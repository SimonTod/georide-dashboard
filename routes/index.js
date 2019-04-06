var express = require('express');
const axios = require('axios')
var querystring = require('querystring');
var router = express.Router();

const config = require('../config')

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Express',user });
});

module.exports = router;
