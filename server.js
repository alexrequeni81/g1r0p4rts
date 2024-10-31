require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Conexión a MongoDB usando Mongoose
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'spareparts'
})
.then(() => console.log('Conectado a MongoDB en la base de datos "spareparts"'))
.catch((err) => console.error('Error al conectar a MongoDB:', err));

// Crear un esquema simple para pruebas
const PartSchema = new mongoose.Schema({
    name: String,
    code: String,
    stock: Number
});

const Part = mongoose.model('Part', PartSchema);

// Ruta para verificar el estado de la conexión
app.get('/api/status', async (req, res) => {
    try {
        const count = await Part.countDocuments();
        res.json({
            success: true,
            count,
            message: 'Conectado a la base de datos spareparts'
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Ruta adicional para obtener todas las partes (opcional)
app.get('/api/parts', async (req, res) => {
    try {
        const parts = await Part.find().limit(10); // Limitamos a 10 para el ejemplo
        res.json({
            success: true,
            data: parts
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
