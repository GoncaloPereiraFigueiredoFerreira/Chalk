var express = require('express');
var router = express.Router();
let Announcements = require("../../controllers/announcements")
let User = require("../../controllers/users")




/**
 *  Acess a user destined announcements
 */
router.get("/user/:userID", function(req,res,next){
    let user = req.params.userID;
    User.getUserSubscriptions(user).then(subs=>{
      
      promisses = []
      for(let sub of subs.subscribed){
        promisses.push(Announcements.getAnnTitlesChannel(sub))
      }
      Promise.all(promisses).then(results=>{
        let ann = []
        for (let posts of results){
          posts.forEach(p => {
            ann.push(p)
          });}

        res.status(200).jsonp(ann).end()}).catch((err)=>{console.log(err);res.sendStatus(500)})
    })
})


/**
 * Announcements associated to a channel
 */
router.get("/channel/:channelID", function(req,res,next){
  let channel = req.params.channelID;
  Announcements.getAnnTitlesChannel(channel).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})


/**
 * Acess a specific announcement post
 */
router.get("/:annID",function(req,res,next){
  let ann = req.params.annID;
  Announcements.getAnnByID(ann).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})

module.exports = router;