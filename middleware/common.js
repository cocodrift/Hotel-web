// middleware/common.js

function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  
  function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      res.redirect('/login');
    }
  }
  
  module.exports = {
    errorHandler,
    isAuthenticated,
  };
  