// backend/server.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/parts', require('./routes/partsRoutes'));

// Nueva ruta para la raíz
app.get('/', (req, res) => {
  res.send('Bienvenido a la APu de g1r0p4rts'); // Mensaje de bienvenida
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT} 🚀`);
});
