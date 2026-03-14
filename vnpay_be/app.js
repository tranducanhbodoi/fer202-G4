var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var order = require('./routes/order');
var cors = require('cors');

var app = express();

app.use(cors()); // Bật CORS cho tất cả các routes

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/order', order);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({
    message: 'Not Found'
  });
});

// error handler
app.use(function(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

const PORT = 1234;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
