const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); // Added this line

// Connect to MongoDB
const uri = process.env.MONGODB_URI;

mongoose.set('strictQuery', false); // Add this line to prepare for Mongoose 7 deprecation
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Using path.join for views directory

// Routes
const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`MiniEats app is running on port ${port}`);
});
