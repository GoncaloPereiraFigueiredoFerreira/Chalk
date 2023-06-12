var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require("mongoose")
require("dotenv").config();

var ingestRouter= require('./routes/ingest');
var acessRouter = require('./routes/acess');
var manageRouter= require('./routes/manage');

var mongoDB = process.env.MONGODB
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/manage', manageRouter)
app.use('/ingest', ingestRouter);
app.use('/acess', acessRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.error("Error: " + err)
  // send error status
  res.sendStatus(err.status || 500);

});

module.exports = app;
