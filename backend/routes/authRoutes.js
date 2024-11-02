// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ejemplo de una ruta para login
router.post('/login', authController.login);
router.get('/users', authController.getUsers); // Nueva ruta para obtener usuarios

module.exports = router; // Asegúrate de que esté exportando `router`
