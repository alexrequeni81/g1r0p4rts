// backend/controllers/authController.js
const User = require('../models/User'); // Asegúrate de importar el modelo User

const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Obtiene todos los usuarios
    res.json(users); // Devuelve los usuarios en formato JSON
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

const login = (req, res) => {
  // Lógica de autenticación
  res.send("Login exitoso");
};

module.exports = { login, getUsers }; // Exporta la función getUsers
