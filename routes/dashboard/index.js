var express = require('express');
var router = express.Router();
var fs = require('fs');

/* Controllers */
var dashboard = require('./dashboard');

/* Router */

/* Dashboard */
/* Home */
router.get('/', dashboard.home);
router.get('/profil', dashboard.profil);
router.get('/vehicules', dashboard.vehicules);
router.get('/vehicules/:id', dashboard.traker);
router.get('/vehicules/:id/lock', dashboard.lock);
router.get('/vehicules/:id/unlock', dashboard.unlock);
router.get('/vehicules/:id/:from/:to', dashboard.trajet);
router.get('/vehicules/:id/trips/:tripid/share', dashboard.shareTrip);


// Middleware to pass data to every RENDER
// router.use(async(req, res, next) => {
//     res.locals.config = config
//     res.locals.user = req.session.user
//     next()
// })


/* Export Router */
module.exports = router;
