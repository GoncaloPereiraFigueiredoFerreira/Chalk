var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var router = require("./routes/auth_router")
require("dotenv").config();

var passport = require('passport');

// MongoDB User Credential Server

var mongoose = require("mongoose")
var connectString = "mongodb://127.0.0.1/ChalkAuth"

mongoose.connect(connectString,  {useNewUrlParser:true, useUnifiedTopology:true})
var db = mongoose.connection

db.on("error", (err)=> {
    console.log(err)
    process.exit()
})
db.on("open", ()=>{
    console.log("Connexão ao mongo realizada com sucesso...")
})



var app = express();




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());


app.use("/",router)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err.message)
  // render the error page
  res.status(err.status || 500);
  res.jsonp({'error':err, "message":err.message});
});

module.exports = app;
