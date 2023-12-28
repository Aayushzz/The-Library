var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var usersRouter = require('./src/routes/users');
var indexRouter = require('./src/routes/index');
const mongoose = require("mongoose");
const catalogRouter = require('./src/routes/catalog');
const compression = require("compression");
const { publicDecrypt } = require('crypto');
const RateLimit = require("express-rate-limit");
const helmet = require("helmet");
var app = express();

//const limiter = RateLimit({
 // windowMs: 1 * 60 * 1000,
 // max: 20
//});
//app.use(limiter)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["self", "code.jquery.com", "cdn.jsdelivr.net"],
    }
  })
)

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/test', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);
app.get('/', (req, res) => {
  res.send("HEllo this is the index");
})
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

//set up mongoose connection

mongoose.set('strictQuery', false);
const dev_db_url ="mongodb+srv://aayushnrla:Locallibrary@cluster0.rfkazdc.mongodb.net/test?retryWrites=true&w=majority";
const mongoDB = process.env.MONGODB_URI || dev_db_url;
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}


module.exports = app;
