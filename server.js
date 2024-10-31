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

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Opciones de conexión mejoradas para MongoDB Atlas
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'spareparts',
    retryWrites: true,
    w: 'majority',
    ssl: true,
    authSource: 'admin',
    replicaSet: 'atlas-cnz1z4-shard-0',
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000
};

// Conexión a MongoDB con mejor manejo de errores
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        console.log(`MongoDB conectado: ${conn.connection.host}`);
        
        // Manejador de eventos de desconexión
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB desconectado. Intentando reconectar...');
            setTimeout(connectDB, 5000);
        });

        // Manejador de errores de conexión
        mongoose.connection.on('error', (err) => {
            console.error('Error de MongoDB:', err);
            mongoose.disconnect();
        });

    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};

// Iniciar conexión
connectDB();

// Esquema y modelo
const partSchema = new mongoose.Schema({
    REFERENCIA: String,
    DESCRIPCIÓN: String,
    MÁQUINA: String,
    GRUPO: String,
    COMENTARIO: String,
    CANTIDAD: Number
});

const Part = mongoose.model('Part', partSchema, 'databasev1');

// Ruta para verificar el estado
app.get('/api/status', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Base de datos no conectada');
        }
        
        await mongoose.connection.db.admin().ping();
        const count = await Part.countDocuments();
        
        res.json({
            success: true,
            count,
            message: 'Conectado a la base de datos spareparts',
            dbStatus: 'OK',
            connectionState: mongoose.connection.readyState
        });
    } catch (error) {
        console.error('Error al verificar el estado:', error);
        res.json({
            success: false,
            error: error.message,
            dbStatus: 'ERROR',
            connectionState: mongoose.connection.readyState
        });
    }
});

// Ruta para obtener partes
app.get('/api/parts', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Base de datos no conectada');
        }

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

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada.');
        process.exit(0);
    } catch (err) {
        console.error('Error al cerrar la conexión:', err);
        process.exit(1);
    }
});
