require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./middleware/passportConfig'); // Ensure passportConfig is correct
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.set('strictQuery', false);
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Set up session with connect-mongo
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false, // Typically set to false to comply with GDPR laws
  store: MongoStore.create({ mongoUrl: mongoURI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Import routes
const appRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
app.use('/', appRouter);
app.use(require('./middleware/isAuthenticated'), adminRouter);

// Flash middleware
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { message: err.message });
});

// Handle login form submission
app.post('/login', passport.authenticate('local', {
  successRedirect: '/admin',
  failureFlash: true
}));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
