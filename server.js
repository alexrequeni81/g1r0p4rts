require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB usando la variable de entorno
async function connectToDatabase() {
    try {
        console.log('Intentando conectar a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('Conexión a MongoDB exitosa');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1); // Salir del proceso si no se puede conectar
    }
}

// Llamar a la función de conexión
connectToDatabase();

// Rutas para obtener datos
app.get('/api/users', async (req, res) => {
    try {
        const users = await mongoose.connection.collection('users').find({}).toArray();
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

app.get('/api/parts', async (req, res) => {
    try {
        const parts = await mongoose.connection.collection('parts').find({}).toArray();
        res.json(parts);
    } catch (error) {
        console.error('Error al obtener piezas:', error.message);
        res.status(500).json({ error: 'Error al obtener piezas' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
