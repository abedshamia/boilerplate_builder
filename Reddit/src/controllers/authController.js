const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../database/config/connection');
const {createError} = require('../errors/customError');
const registerUser = async (req, res) => {
  const {username, password, confirm_password, email} = req.body;

  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
    confirm_password: Joi.string().valid(Joi.ref('password')),
    email: Joi.string().email().required(),
  });

  try {
    const {error} = await schema.validateAsync(req.body, {abortEarly: false});
  } catch (error) {
    throw createError(error.details.map(e => e.message).join(', '), 400);
  }

  // Check if username or email already exists
  const isExist = await connection.query(
    'SELECT username, email FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );

  if (isExist.rows[0]) {
    throw createError('Username or email already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into database

  const user = await connection.query(
    'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *',
    [username, hashedPassword, email]
  );

  // Send token to client

  const payload = {
    id: user.rows[0].id,
    username: user.rows[0].username,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1h'});

  res.status(200).cookie('token', token, {httpOnly: true}).json({
    status: 'success',
    token,
    user: user.rows[0],
  });
};

// Login user

const loginUser = async (req, res) => {
  const {username, password} = req.body;

  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string()
      .required()
      .regex(/^[a-zA-Z0-9]{3,30}$/),
  });

  try {
    const {error} = await schema.validateAsync(req.body, {abortEarly: false});
  } catch (error) {
    throw createError(error.details.map(e => e.message).join(', '), 400);
  }

  // Check if user exists
  const user = await connection.query('SELECT * FROM users WHERE username = $1', [username]);

  if (!user.rows[0]) {
    throw createError('User does not exist, please sign up', 404);
  }

  // Check if password is correct

  const validatePassword = await bcrypt.compare(password, user.rows[0].password);

  if (!validatePassword) {
    throw createError('Password is incorrect', 400);
  }

  // Send token to client

  const payload = {
    id: user.rows[0].id,
    username: user.rows[0].username,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(200).cookie('token', token, {httpOnly: true}).json({
    status: 'success',
    token,
  });
};

const logoutUser = (req, res) => {
  res.clearCookie('token').json({
    status: 'success',
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
