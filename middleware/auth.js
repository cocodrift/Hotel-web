// middleware/auth.js
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
  
  function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') { // Assuming a role field in the User model
      return next();
    }
    res.redirect('/');
  }
  
  module.exports = { ensureAuthenticated, ensureAdmin };
  