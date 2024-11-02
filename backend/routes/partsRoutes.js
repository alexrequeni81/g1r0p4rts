// backend/routes/partsRoutes.js
const express = require('express');
const router = express.Router();
const partsController = require('../controllers/partsController');

// Ejemplo de una ruta para obtener partes
router.get('/', partsController.getParts);

module.exports = router; // Asegúrate de que esté exportando `router`
