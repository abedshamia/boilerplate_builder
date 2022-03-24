const {getLoginPage, indexPage} = require('./pagesController');
const {registerUser, loginUser, logoutUser} = require('./authController');

module.exports = {
  getLoginPage,
  registerUser,
  loginUser,
  logoutUser,
  indexPage,
};
