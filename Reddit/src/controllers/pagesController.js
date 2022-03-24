const {join} = require('path');
const getLoginPage = (req, res) => {
  res.sendFile(join(__dirname, '..', '..', 'public', 'signup-in.html'));
};

const indexPage = (req, res) => {
  res.sendFile(join(__dirname, '..', '..', 'protected', 'index.html'));
};

module.exports = {getLoginPage, indexPage};
