// backend/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path'); // Importa el módulo path

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/parts', require('./routes/partsRoutes'));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Nueva ruta para la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html')); // Cambia esto para servir el index.html
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} 🚀`);
});
