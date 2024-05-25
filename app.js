const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/minieats', { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MiniEats app is running on port ${port}`);
});
