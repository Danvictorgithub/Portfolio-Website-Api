var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Routes = require("./routes/routes.js");
const cors = require('cors');

//Firebase setup
require('./configs/firebase-config.js');
//MongoDB setup
require('./configs/mongodb-config.js');

//App initializiation
var app = express();

// PassportJS Setup
require('./authentication/passport');
//Express REST API Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Api Routes
app.use('/api', Routes);
// Express Middlewares
app.use(cors());

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
});
module.exports = app;
