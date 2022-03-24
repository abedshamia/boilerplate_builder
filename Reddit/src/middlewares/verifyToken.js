const {verify} = require('jsonwebtoken');
const {createError} = require('../errors/customError');
const verifyToken = async (req, res, next) => {
  const {token} = req.cookies;

  if (!token) {
    throw createError('No token provided', 401);
  }

  try {
    const decodedToken = verify(token, process.env.JWT_SECRET);
    const {id, username} = decodedToken;
    req.user = {id, username};
    console.log(req.user);
    next();
  } catch (error) {
    throw createError('Invalid token', 401);
  }
};

module.exports = verifyToken;
