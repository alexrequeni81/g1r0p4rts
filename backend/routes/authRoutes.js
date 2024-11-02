// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ejemplo de una ruta para login
router.post('/login', authController.login);

module.exports = router; // Asegúrate de que esté exportando `router`
