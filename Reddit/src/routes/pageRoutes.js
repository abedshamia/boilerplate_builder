const router = require('express').Router();
const verifyToken = require('../middlewares/verifyToken');
const {getLoginPage, indexPage} = require('../controllers');
const isUserLoggedIn = require('../middlewares/loggedIn');

router.get('/reddit/login', isUserLoggedIn, getLoginPage);

router.get('/', verifyToken, indexPage);

module.exports = router;
