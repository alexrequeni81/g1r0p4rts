// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conexión a MongoDB exitosa 🗄️");
  } catch (error) {
    console.error("Error conectando a MongoDB ❌", error);
    process.exit(1); // Termina la app si falla la conexión
  }
};

module.exports = connectDB;
