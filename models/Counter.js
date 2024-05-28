// models/Counter.js
const mongoose = require('mongoose');

if (!mongoose.modelNames().includes('Counter')) {
  const counterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  });

  mongoose.model('Counter', counterSchema);
}

module.exports = mongoose.model('Counter');
