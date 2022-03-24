const isUserLoggedIn = (req, res, next) => {
  if (req.cookies.token) {
    res.redirect('/');
  } else {
    next();
  }
};

module.exports = isUserLoggedIn;
