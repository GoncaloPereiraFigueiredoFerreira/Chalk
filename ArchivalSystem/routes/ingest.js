var express = require('express');
var router = express.Router();
var Users = require("../controllers/users")
var Channels = require("../controllers/channel");
var Announcements = require('../controllers/announcements');
var Dates = require("../controllers/important_dates")


router.post("/uploadfile", function(req,res){

})

router.post("/newdate",function(req,res){
  return Dates.createImportantDate(req.body.date).then(()=>{
    res.sendStatus(200)
  }).catch((err)=>{
      //ver erro e responder em conformidade
      console.log(err)
      res.sendStatus(500)
  })
})

router.post("/newpost",function(req,res){
    //Should check if user is compatible with channel, and existance of channel and user
    return Announcements.createNewAnn(req.body.user,req.body.announcement).then(()=>{
      res.sendStatus(200)
    }).catch((err)=>{
        //ver erro e responder em conformidade
        console.log(err)
        res.sendStatus(500)
    })
})

router.post("/newcomment",function(req,res){
  return Announcements.addComment(req.body.user,req.body.announcement, req.body.content).then(()=>{
    res.sendStatus(200)
    }).catch((err)=>{
        //ver erro e responder em conformidade
        console.log(err)
        res.sendStatus(500)
    })
})


router.post("/addFile",function(req,res){
  return Channels.addFile(req.body.channel,req.body.path,req.body.file).then(()=>{
    res.sendStatus(200)
}).catch((err)=>{
    //ver erro e responder em conformidade
    console.log(err)
    res.sendStatus(500)
})
})


router.post("/newdir",function(req,res){
  return Channels.createDir(req.body.channel,req.body.path).then(()=>{
    res.sendStatus(200)

}).catch((err)=>{
    //ver erro e responder em conformidade
    console.log(err)
    res.sendStatus(500)
})
})



router.post("/newchannel",function(req,res){
  return Channels.createNewChannel(req.body.channel).then(()=>{
    res.sendStatus(200)

}).catch((err)=>{
    //ver erro e responder em conformidade
    res.sendStatus(500)
})

})

router.post("/newaccount",function(req,res){
  return Users.createUser(req.body).then(()=>{
      res.sendStatus(200)

  }).catch((err)=>{
      //ver erro e responder em conformidade
      console.log(err)
      res.sendStatus(500)
  })
})

router.post("/addsubscription",function(req,res){
  let usr_email = req.body.user
  let channel = req.body.channel
  return Promise.all([Users.existsUser(usr_email),Channels.existsChannel(channel)]).then((results)=>{
    if (!results.includes(null)){
      return Promise.all(
        [
          Users.addSubscription(usr_email,channel),
          Channels.addSubscriptor(usr_email,channel)
        ]).then(()=>{
          res.sendStatus(200)
        }).catch((err)=>{
          //ver erro e responder em conformidade
          res.sendStatus(500)
      })
    } else {
      res.sendStatus(500)
    }
  })
})


router.post("/remsubscription",function(req,res){
  let usr_email = req.body.user
  let channel = req.body.channel
  return Promise.all([Users.existsUser(usr_email),Channels.existsChannel(channel)]).then((results)=>{
    if (!results.includes(null)){
      return Promise.all(
        [
          Users.remSubscription(usr_email,channel),
          Channels.remSubscriptor(usr_email,channel)
        ]).then(()=>{
          res.sendStatus(200)
        }).catch((err)=>{
          //ver erro e responder em conformidade
          res.sendStatus(500)
      })
    } else {
      res.sendStatus(500)
    }
  })
})



module.exports = router;