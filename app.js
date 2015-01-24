var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var mongoose = require('mongoose');
var passport = require('passport');
var session  = require('express-session');
var MongoStore = require('connect-mongostore')(session);

// Set config file
config = require('./config/config')[process.env.NODE_ENV || 'live'];
console.log("Started in " + (process.env.NODE_ENV || 'live') + " mode")

// Setup passport using configuration
require('./config/passport')(passport, config)

// Connect to local database
try {
    mongoose.connect(config.db);
    mongoose.set('debug', true);
    console.log("Started connection with database");
} catch (err) {
    console.log("Connection to database failed");
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: config.sessionSecret,
                  maxAge: new Date(Date.now() + 3600000),
                  resave: true,
                  saveUninitialized: true,
                  store: new MongoStore ({'db': 'BitAlertDev'})}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/api/user', require('./routes/api_users'));
app.use('/api/address', require('./routes/api_address'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(config.port, function() {
  console.log('Listening on port %d', server.address().port);
})


module.exports = app;
