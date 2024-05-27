const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  imageUrl: String,
  description: String // Add description field
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
