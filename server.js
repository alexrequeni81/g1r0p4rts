require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Asegúrate de que esta línea esté presente

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(path.join(__dirname))); // Esto servirá index.html y otros archivos estáticos

// URI de conexión a MongoDB
const MONGODB_URI = "mongodb+srv://dbuser:uI7HMA2doZIxf8P5@g1r0p4rts.6yiod.mongodb.net/test?retryWrites=true&w=majority";

// Conexión a MongoDB
async function connectToDatabase() {
    try {
        console.log('Intentando conectar a MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
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
    const { nombre, email } = req.query;
    try {
        const user = await mongoose.connection.collection('users').find({ nombre, email }).toArray();
        res.json(user);
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

// Ruta para agregar un nuevo usuario
app.post('/api/users', async (req, res) => {
    try {
        const newUser = req.body;
        await mongoose.connection.collection('users').insertOne(newUser);
        res.status(201).json({ message: 'Usuario agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar usuario:', error.message);
        res.status(500).json({ error: 'Error al agregar usuario' });
    }
});

// Ruta para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Asegúrate de que el archivo index.html esté en la raíz
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
