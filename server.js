require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

// Conexión a MongoDB
async function connectToMongo() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('test'); // Puedes cambiar 'test' por el nombre de tu base de datos
    const count = await db.collection('test').countDocuments();
    return { success: true, count };
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    return { success: false, error: error.message };
  }
}

// Ruta para verificar el estado de la conexión
app.get('/api/status', async (req, res) => {
  const result = await connectToMongo();
  res.json(result);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
