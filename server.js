require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.json());

// Middleware para logging de las solicitudes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Conexión a MongoDB usando Mongoose
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'spareparts'
})
.then(() => console.log('Conectado a MongoDB en la base de datos "spareparts"'))
.catch((err) => console.error('Error al conectar a MongoDB:', err));

// Definir el esquema y modelo para "Part" (usando el esquema del proyecto anterior)
const partSchema = new mongoose.Schema({
    REFERENCIA: String,
    DESCRIPCIÓN: String,
    MÁQUINA: String,
    GRUPO: String,
    COMENTARIO: String,
    CANTIDAD: Number
});

const Part = mongoose.model('Part', partSchema, 'databasev1');

// Ruta para verificar el estado de la conexión
app.get('/api/status', async (req, res) => {
    try {
        // Verificar la conexión a la base de datos
        await mongoose.connection.db.admin().ping();
        const count = await Part.countDocuments();
        res.json({
            success: true,
            count,
            message: 'Conectado a la base de datos spareparts',
            dbStatus: 'OK'
        });
    } catch (error) {
        console.error('Error al verificar el estado:', error);
        res.json({
            success: false,
            error: error.message,
            dbStatus: 'ERROR'
        });
    }
});

// Ruta para obtener las partes
app.get('/api/parts', async (req, res) => {
    try {
        const parts = await Part.find().limit(10);
        res.json({
            success: true,
            data: parts
        });
    } catch (error) {
        console.error('Error al obtener las partes:', error);
        res.json({
            success: false,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
