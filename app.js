var createError = require('http-errors');
var express = require('express');
var helmet = require('helmet');
var session = require('express-session');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var moment = require('moment');
var i18next = require('i18next')
var middleware = require("i18next-express-middleware");

var config = require('./config');

var indexRouter = require('./routes/login');
// var usersRouter = require('./routes/users');
var dashboardRouter = require('./routes/dashboard');

var app = express();

app.use(helmet());

i18next.use(middleware.LanguageDetector).init({
  preload: ["en", "fr"],
});

app.use(
  middleware.handle(i18next, {
    // ignoreRoutes: ["/foo"], // or function(req, res, options, i18next) { /* return true to ignore */ }
    removeLngFromUrl: false
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'georide-session',
  store: new FileStore,
  expires: new Date(Date.now() + (30 * 86400 * 1000)),
  saveUninitialized: true,
  resave: true
}));
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/dashboard',isConnected, dashboardRouter);

// Création de lien vers les dist de modules
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/font-awesome', express.static(__dirname + '/node_modules/font-awesome/'));
app.use('/ionicons', express.static(__dirname + '/node_modules/ionicons/dist/'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/moment', express.static(__dirname + '/node_modules/moment/'));
app.use('/lodash', express.static(__dirname + '/node_modules/lodash/'));
app.use('/socket', express.static(__dirname + '/node_modules/socket.io-client/dist/'));
app.use('/push.js', express.static(__dirname + '/node_modules/push.js/bin/'));

function isConnected(req, res, next) {
  console.log('/*************************/');
  console.log('        isConnected        ');

    if (req.session.authenticated) {
      console.log('    '+moment().format('DD/MM/YYYY H:m:s')+'    ');
      console.log('  '+req.session.user.id+' ');
      console.log('  '+req.session.user.email+'  ');
      console.log('/*************************/');
      next();
    } else {
      console.log('           No            ');
      console.log('/*************************/');
       res.redirect("/login");
    }

}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
