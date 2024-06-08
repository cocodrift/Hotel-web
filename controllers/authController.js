// controllers/authController.js
const passport = require('../middleware/passportConfig');

exports.renderLoginPage = (req, res) => {
  res.render('login');
};

exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log('User logged in:', user); // Log user details
      console.log('Session:', req.session); // Log session details
      return res.redirect('/admin');
    });
  })(req, res, next);
};

exports.logoutUser = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    req.session.destroy();
    res.redirect('/');
  });
};
