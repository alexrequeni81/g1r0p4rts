require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const Excel = require('exceljs');
const fileUpload = require('express-fileupload');
const timeout = require('connect-timeout');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let activeUsers = 0;

io.on('connection', (socket) => {
    activeUsers++;
    io.emit('userCount', activeUsers);

    socket.on('joinAdmin', () => {
        socket.join('admins');
    });

    socket.on('adminNotification', (data) => {
        io.to('admins').emit('adminAlert', data);
    });

    socket.on('disconnect', () => {
        activeUsers--;
        io.emit('userCount', activeUsers);
    });
});

// Middleware de seguridad y optimización
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(timeout('30s'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'frontend')));

// Configuración de MongoDB mejorada
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10
}).then(() => {
    console.log('Conexión exitosa a MongoDB');
}).catch(err => {
    console.error('Error de conexión a MongoDB:', err);
});

// Middleware para manejar timeouts
function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}
app.use(haltOnTimedout);

// Agregar manejadores de eventos para la conexión
mongoose.connection.on('connected', () => {
    console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error en la conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose desconectado de MongoDB');
});

// Manejar señales de terminación
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

// Definir el esquema y modelo para "Part"
const partSchema = new mongoose.Schema({
    REFERENCIA: String,
    DESCRIPCIÓN: String,
    MÁQUINA: String,
    GRUPO: String,
    COMENTARIO: String,
    CANTIDAD: Number
});

const Part = mongoose.model('Part', partSchema, 'databasev1');

// Obtener todos los repuestos (API)
app.get('/api/parts', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; // Calculate the skip value
    const searchQuery = req.query.search || '';

    const searchTerms = searchQuery.split(' ').filter(term => term);

    const query = searchTerms.length > 0 
        ? {
            $and: searchTerms.map(term => ({
                $or: [
                    { REFERENCIA: { $regex: term, $options: 'i' } },
                    { DESCRIPCIÓN: { $regex: term, $options: 'i' } },
                    { MÁQUINA: { $regex: term, $options: 'i' } },
                    { GRUPO: { $regex: term, $options: 'i' } },
                    { COMENTARIO: { $regex: term, $options: 'i' } }
                ]
            }))
        }
        : {};

    try {
        const parts = await Part.find(query).skip(skip).limit(limit); // Fetch data with skip and limit
        const total = await Part.countDocuments(query); // Count total documents for pagination

        res.json({
            parts,
            total,
            page, 
            pages: Math.ceil(total / limit) // Calculate the total number of pages
        });
    } catch (err) {
        console.error('Error al obtener los repuestos:', err);
        res.status(500).send('Error al obtener los repuestos');
    }
});

// Crear un nuevo repuesto
app.post('/api/parts', async (req, res) => {
    try {
        const { referencia, descripcion, maquina, grupo, comentario, cantidad } = req.body;

        if (!referencia || !descripcion || !maquina || !grupo || !comentario || isNaN(cantidad)) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios y la cantidad debe ser un número.' });
        }

        const newPart = new Part({
            REFERENCIA: referencia,
            DESCRIPCIÓN: descripcion,
            MÁQUINA: maquina,
            GRUPO: grupo,
            COMENTARIO: comentario,
            CANTIDAD: cantidad
        });

        await newPart.save();
        await updateTotalRecords();

        res.status(201).json({
            message: 'Repuesto creado con éxito',
            part: newPart
        });
    } catch (err) {
        console.error('Error al crear un nuevo repuesto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar un repuesto existente (API PUT con Logs y Normalización)
app.put('/api/parts/:id', async (req, res) => {
    try {
        const id = req.params.id;
        console.log(`Editando repuesto con ID: ${id}`); // Log del ID recibido

        // Validación y normalización de los datos recibidos
        let { referencia, descripcion, maquina, grupo, comentario, cantidad } = req.body;

        console.log('Datos recibidos antes de la normalización:', { referencia, descripcion, maquina, grupo, comentario, cantidad });

        // Convertir "cantidad" a número si es necesario y normalizar cadenas vacías
        cantidad = cantidad !== undefined && cantidad !== null ? (cantidad === "" ? null : Number(cantidad)) : null;

        if (!id) {
            console.error('ID no proporcionada');
            return res.status(400).json({ error: 'ID no proporcionada' });
        }

        if (!referencia || !descripcion || !maquina || !grupo || !comentario || isNaN(cantidad)) {
            console.error('Datos inválidos');
            return res.status(400).json({ error: 'Todos los campos son obligatorios y la cantidad debe ser un número.' });
        }

        // Normalizar campos vacíos a null
        referencia = referencia.trim() || null;
        descripcion = descripcion.trim() || null;
        maquina = maquina.trim() || null;
        grupo = grupo.trim() || null;
        comentario = comentario.trim() || null;

        console.log('Datos después de la normalización:', { referencia, descripcion, maquina, grupo, comentario, cantidad });

        const updatedPart = await Part.findByIdAndUpdate(id, {
            REFERENCIA: referencia,
            DESCRIPCIÓN: descripcion,
            MÁQUINA: maquina,
            GRUPO: grupo,
            COMENTARIO: comentario,
            CANTIDAD: cantidad
        }, { new: true });

        if (!updatedPart) {
            console.error('Repuesto no encontrado');
            return res.status(404).json({ error: 'Repuesto no encontrado' });
        }

        console.log('Repuesto actualizado:', updatedPart); // Log del repuesto actualizado
        res.status(200).json(updatedPart);
    } catch (err) {
        console.error('Error al editar el repuesto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar un repuesto
app.delete('/api/parts/:id', async (req, res) => {
    try {
        await Part.findByIdAndDelete(req.params.id);
        await updateTotalRecords();
        res.status(204).send();
    } catch (err) {
        console.error('Error al eliminar el repuesto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Servir el archivo 'index.html' en la ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Cron job para hacer ping cada 5 minutos
cron.schedule('*/1 * * * *', () => { 
    axios.get('https://my-database-ahys.onrender.com/') 
        .then(() => console.log('Ping exitoso, el servidor sigue activo')) 
        .catch(err => console.error('Error al hacer ping:', err)); 
});

// Reseteo masivo de todos los repuestos
app.delete('/api/resetAllParts', async (req, res) => {
    try {
        const allParts = await Part.find();

        if (!allParts || allParts.length === 0) {
            return res.status(404).json({ success: false, message: 'No hay repuestos para resetear' });
        }

        const allPartsData = allParts.map(part => ({
            REFERENCIA: part.REFERENCIA,
            DESCRIPCIÓN: part.DESCRIPCIÓN,
            MÁQUINA: part.MÁQUINA,
            GRUPO: part.GRUPO,
            COMENTARIO: part.COMENTARIO,
            CANTIDAD: part.CANTIDAD
        }));

        await Part.deleteMany({});
        await Part.insertMany(allPartsData);
        await updateTotalRecords();

        res.json({ success: true, message: 'Todos los repuestos han sido reseteados' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Nueva ruta para obtener el conteo total de registros
let totalRecords = 0;
app.get('/api/totalRecords', (req, res) => {
    res.json({ total: totalRecords });
});

// Función para actualizar el conteo total
async function updateTotalRecords() {
    try {
        totalRecords = await Part.countDocuments();
        console.log(`Total de registros actualizado: ${totalRecords}`);
    } catch (err) {
        console.error('Error al actualizar el total de registros:', err);
    }
}

// Actualizar el conteo al iniciar el servidor
updateTotalRecords();

// Actualizar el conteo cada 5 minutos
cron.schedule('*/5 * * * *', updateTotalRecords);

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Nueva ruta para verificar el estado del servidor
app.get('/api/status', async (req, res) => {
    try {
        // Verificar la conexión a la base de datos
        await mongoose.connection.db.admin().ping();
        res.status(200).json({ serverStatus: 'OK', dbStatus: 'OK' });
    } catch (error) {
        console.error('Error al verificar el estado de la base de datos:', error);
        res.status(200).json({ serverStatus: 'OK', dbStatus: 'ERROR' });
    }
});

// Nueva ruta para descargar los datos
app.get('/api/download', async (req, res) => {
    try {
        const parts = await Part.find({});
        
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Repuestos');
        
        worksheet.columns = [
            { header: 'REFERENCIA', key: 'REFERENCIA', width: 15 },
            { header: 'DESCRIPCIÓN', key: 'DESCRIPCIÓN', width: 30 },
            { header: 'MÁQUINA', key: 'MÁQUINA', width: 15 },
            { header: 'GRUPO', key: 'GRUPO', width: 15 },
            { header: 'COMENTARIO', key: 'COMENTARIO', width: 30 },
            { header: 'CANTIDAD', key: 'CANTIDAD', width: 10 }
        ];

        parts.forEach(part => {
            worksheet.addRow(part);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=repuestos.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al descargar los datos:', error);
        res.status(500).json({ error: 'Error al descargar los datos' });
    }
});

// Nueva ruta para cargar datos desde Excel
app.post('/api/upload', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No se ha subido ningún archivo.');
    }

    let excelFile = req.files.file;
    let workbook = new Excel.Workbook();
    
    try {
        await workbook.xlsx.load(excelFile.data);
        let worksheet = workbook.getWorksheet(1);

        // Verificar los encabezados
        const expectedHeaders = ['REFERENCIA', 'DESCRIPCIÓN', 'MÁQUINA', 'GRUPO', 'COMENTARIO', 'CANTIDAD'];
        const actualHeaders = worksheet.getRow(1).values.slice(1); // Ignorar la primera celda vacía

        if (!arraysEqual(expectedHeaders, actualHeaders)) {
            return res.status(400).send('El formato del archivo no es válido. Verifique los encabezados de las columnas.');
        }

        let newParts = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber > 1) { // Ignorar la fila de encabezados
                if (row.values.length !== 7) { // 6 columnas + 1 (la primera celda está vacía)
                    throw new Error(`La fila ${rowNumber} no tiene el número correcto de columnas.`);
                }

                let newPart = {
                    REFERENCIA: row.getCell(1).value,
                    DESCRIPCIÓN: row.getCell(2).value,
                    MÁQUINA: row.getCell(3).value,
                    GRUPO: row.getCell(4).value,
                    COMENTARIO: row.getCell(5).value,
                    CANTIDAD: row.getCell(6).value
                };

                // Validación básica
                if (!newPart.REFERENCIA || !newPart.DESCRIPCIÓN || !newPart.MÁQUINA || !newPart.GRUPO || isNaN(newPart.CANTIDAD)) {
                    throw new Error(`La fila ${rowNumber} contiene datos inválidos.`);
                }

                newParts.push(newPart);
            }
        });

        if (newParts.length === 0) {
            return res.status(400).send('El archivo no contiene datos válidos.');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            await Part.deleteMany({}, { session });
            await Part.insertMany(newParts, { session });
            await session.commitTransaction();
            session.endSession();

            await updateTotalRecords();

            res.status(200).send('Datos cargados exitosamente');
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Error al cargar los datos:', error);
            res.status(500).send('Error al procesar el archivo: ' + error.message);
        }
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        res.status(400).send('Error al procesar el archivo: ' + error.message);
    }
});

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

app.use(fileUpload());

// Nuevo esquema para clientes
const clienteSchema = new mongoose.Schema({
    nombre: String,
    correo: { 
        type: String, 
        unique: true,
        required: true 
    },
    direcciones: [String],
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

// Nuevo esquema para pedidos
const pedidoSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    direccionEntrega: String,
    items: [{
        referencia: String,
        descripcion: String,
        cantidad: Number
    }],
    estado: {
        type: String,
        enum: ['pendiente', 'procesando', 'enviado', 'completado', 'cancelado'],
        default: 'pendiente'
    },
    fechaPedido: {
        type: Date,
        default: Date.now
    }
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

// Rutas API para Clientes
app.post('/api/clientes/verificar', async (req, res) => {
    try {
        const { correo } = req.body;
        const cliente = await Cliente.findOne({ correo });
        res.json({
            exists: !!cliente,
            cliente: cliente
        });
    } catch (error) {
        console.error('Error al verificar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/clientes', async (req, res) => {
    try {
        const { nombre, correo, direcciones } = req.body;
        
        // Verificar si el cliente ya existe
        const clienteExistente = await Cliente.findOne({ correo });
        if (clienteExistente) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const nuevoCliente = new Cliente({
            nombre,
            correo,
            direcciones
        });

        await nuevoCliente.save();
        res.status(201).json(nuevoCliente);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para obtener un repuesto por referencia
app.get('/api/parts/referencia/:referencia', async (req, res) => {
    try {
        const part = await Part.findOne({ 
            REFERENCIA: { $regex: new RegExp('^' + req.params.referencia + '$', 'i') }
        });
        res.json({ part });
    } catch (error) {
        console.error('Error al buscar repuesto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Rutas API para Pedidos
app.post('/api/pedidos', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { cliente, direccionEntrega, items } = req.body;

        // Verificar stock disponible
        for (const item of items) {
            const part = await Part.findOne({ REFERENCIA: item.referencia });
            if (!part || part.CANTIDAD < item.cantidad) {
                throw new Error(`Stock insuficiente para ${item.referencia}`);
            }
        }

        // Crear el pedido
        const nuevoPedido = new Pedido({
            cliente,
            direccionEntrega,
            items
        });

        // Actualizar stock
        for (const item of items) {
            await Part.updateOne(
                { REFERENCIA: item.referencia },
                { $inc: { CANTIDAD: -item.cantidad } }
            );
        }

        await nuevoPedido.save({ session });
        await session.commitTransaction();

        // Notificar por Socket.IO
        io.emit('nuevoPedido', {
            mensaje: 'Nuevo pedido recibido',
            pedido: nuevoPedido
        });

        res.status(201).json(nuevoPedido);
    } catch (error) {
        await session.abortTransaction();
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
});

// Ruta para obtener pedidos de un cliente
app.get('/api/pedidos/cliente/:clienteId', async (req, res) => {
    try {
        const pedidos = await Pedido.find({ cliente: req.params.clienteId })
            .sort({ fechaPedido: -1 });
        res.json(pedidos);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para actualizar estado de pedido
app.patch('/api/pedidos/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;
        const pedido = await Pedido.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Notificar por Socket.IO
        io.emit('actualizacionPedido', {
            mensaje: 'Estado de pedido actualizado',
            pedido
        });

        res.json(pedido);
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para obtener estadísticas de pedidos
app.get('/api/pedidos/estadisticas', async (req, res) => {
    try {
        const totalPedidos = await Pedido.countDocuments();
        const pedidosPendientes = await Pedido.countDocuments({ estado: 'pendiente' });
        const pedidosHoy = await Pedido.countDocuments({
            fechaPedido: {
                $gte: new Date().setHours(0,0,0,0),
                $lt: new Date().setHours(23,59,59,999)
            }
        });

        res.json({
            total: totalPedidos,
            pendientes: pedidosPendientes,
            hoy: pedidosHoy
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});
