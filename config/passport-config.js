const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Assuming you have a User model
const bcrypt = require('bcrypt'); // Assuming you're using bcrypt for password hashing

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.role);
});

passport.deserializeUser(function(role, done) {
  User.findOne({ role: role }, function(err, user) {
    done(err, user);
  });
});

module.exports = passport;
