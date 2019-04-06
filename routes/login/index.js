var express = require('express');
var router = express.Router();
var fs = require('fs');

/* Controllers */
var login = require('./login');

/* Router */

/* Dashboard */
/* Home */
router.get('/', login.home);
router.get('/login', login.login);
router.post('/login', login.handleLogin);
router.get('/logout', login.logout);
// router.get('/register', login.register);
router.get('/cgv', login.cgv);

/* Export Router */
module.exports = router;
