var dotenv = require('dotenv').config();
console.log(process.env.NODE_ENV)

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var swaggerUI = require('swagger-ui-express');


var indexRouter = require('./api/routes/index');
var bcRouter = require('./api/routes/routes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// inbound logging
app.use((req, res, next) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`${ip} ${req.method} ${req.url}`);
  if (req.method == 'POST' || req.method == 'PUT') {
      console.log(`[Body] ${JSON.stringify(req.body)}`);
  }
  next();
});

app.use('/', indexRouter);
app.use('/api/v1', bcRouter);

// swagger setup
const swaggerDocument = require('./api/controllers/swagger-api-doc/swagger.json');
swaggerDocument.host = process.env.HOSTNAME ? process.env.HOSTNAME : `localhost:${process.env.PORT}`
const swaggerOptions = {}
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument, swaggerOptions))

//app.use('/api/v1/users', usersRouter);
//app.use('/api/customers', )

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
