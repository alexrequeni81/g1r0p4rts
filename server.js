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
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Rutas para obtener datos
app.get('/api/users', async (req, res) => {
    const users = await mongoose.connection.collection('users').find({}).toArray();
    res.json(users);
});

app.get('/api/parts', async (req, res) => {
    const parts = await mongoose.connection.collection('parts').find({}).toArray();
    res.json(parts);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});