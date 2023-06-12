var express = require('express');
var router = express.Router();
var Users = require("../controllers/users")
var Channels = require("../controllers/channel")


router.get('/users', function(req, res, next) {
    Users.getUsers().then((users)=>{
      res.jsonp(users).end()
    })
});

router.get('/channels', function(req, res, next) {
  Channels.getChannels().then((users)=>{
    res.jsonp(users).end()
  })
});

router.delete("/users",function(req,res,next){
  Users.remUsers().then(()=>{
    res.sendStatus(200)
  })
})

router.delete("/channels",function(req,res,next){
  Channels.remChannels().then(()=>{
    res.sendStatus(200)
  })
})

module.exports = router;