var express = require('express');
var router = express.Router();
var Users = require("../controllers/users")
var Channels = require("../controllers/channel")
var Announcements = require("../controllers/announcements")
var Dates = require("../controllers/important_dates")

/// All these routes should be protected!

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


router.put("/channel/:chID",function(req,res,next){
  let channel = req.body;
  let id = req.params.channel;
  Channels.editChannel(id,channel).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})

router.delete("/channel/:chID",function(req,res,next){
  let channel = req.body;
  let id = req.params.channel;
  Channels.editChannel(id,channel).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})


router.put("/posts/:annID",function(req,res,next){
  let ann = req.body
  let id = req.params.annID
  Announcements.editAnn(id,ann).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})

router.delete("/posts/:annID",function(req,res,next){
  let ann = req.params.annID;
  Announcements.remAnn(ann).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})

router.delete("/dates/:dateID",function(req,res,next){
  let date = req.params.dateID;
  Dates.remImportantDate(date).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})


module.exports = router;