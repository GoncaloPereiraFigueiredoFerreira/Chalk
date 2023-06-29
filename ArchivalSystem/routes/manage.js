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
    }).catch((err) => {console.log(err); res.sendStatus(500)})
});

router.get('/channels', function(req, res, next) {
  Channels.getChannels().then((users)=>{
    res.jsonp(users).end()
  }).catch((err) => {console.log(err); res.sendStatus(500)})
});

router.delete("/users",function(req,res,next){
  Users.remUsers().then(()=>{
    res.sendStatus(200)
  }).catch((err) => {console.log(err); res.sendStatus(500)})
})

router.delete("/channels",function(req,res,next){
  Channels.remChannels().then(()=>{
    res.sendStatus(200)
  }).catch((err) => {console.log(err); res.sendStatus(500)})
})

router.post("/channel/addPublisher/:chID",function(req,res,next){
  let email = req.body.email;
  let id = req.params.chID;
  Promise.all([
    Channels.addPublisher(id,email),
    Users.addPublisher(email,id),
    Users.remSubscription(email,id)
  ]).then(()=>res.status(200).end())
  .catch((err) => {console.log(err); res.sendStatus(500)})
})

router.put("/channel/:chID",function(req,res,next){
  let channel = req.body;
  let id = req.params.chID;
  Channels.editChannel(id,channel).then((result)=>{
    res.status(200).jsonp(result).end()
  }).catch((err) => {console.log(err); res.sendStatus(500)})
})

router.delete("/channel/:chID",function(req,res,next){
  let id = req.params.chID;
  let promises = []
  promises.push(Channels.getChannelInfo(id))
  promises.push(Announcements.getAnnTitlesChannel(id))
  promises.push(Dates.findByChannel(id))
  Promise.all(promises).then(results=>{
      let morePromises=[]
      console.log(results[1])
      for (let ann of results[1]){
        morePromises.push(Announcements.remAnn(ann._id))
      }
      for (let sub of results[0].consumers){
        morePromises.push(Users.remSubscription(sub,id))
      }

      for (let pub of results[0].publishers){
        morePromises.push(Users.remPublisher(pub,id))
      }
      for (let date of results[2]){
        morePromises.push(Dates.remImportantDate(date._id))
      }
      

      Promise.all(morePromises).then(results2=>{
        Channels.deleteChannel(id).then((result)=>{
          res.status(200).jsonp(result).end()
        }).catch((err) => {console.log(err); res.sendStatus(500)})
      })
    }).catch((err) => {console.log(err); res.sendStatus(500)})
})


router.put("/posts/:annID",function(req,res,next){
  let ann = req.body
  let id = req.params.annID
  Announcements.editAnn(id,ann).then((result)=>{
    res.status(200).jsonp(result).end()
  }).catch((err) => {console.log(err); res.sendStatus(500)})
})

router.delete("/posts/:annID",function(req,res,next){
  let ann = req.params.annID;
  Announcements.remAnn(ann).then((result)=>{
    res.status(200).jsonp(result).end()
  }).catch((err) => {console.log(err); res.sendStatus(500)})
})

router.delete("/dates/:dateID",function(req,res,next){
  let date = req.params.dateID;
  Dates.remImportantDate(date).then((result)=>{
    res.status(200).jsonp(result).end()
  }).catch((err) => {console.log(err); res.sendStatus(500)})
})


module.exports = router;