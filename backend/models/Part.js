// backend/models/Part.js
const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
});

module.exports = mongoose.model('Part', partSchema);
