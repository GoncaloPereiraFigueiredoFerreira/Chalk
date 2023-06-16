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
      for(let sub of subs){
        promisses.push(Announcements.getAnnTitlesChannel(sub._id))
      }
      Promise.all(promisses).then(results=>{
        let anns = []
        for(let i in subs){
            let ann={}
            ann.channel={name:subs[i].name,_id:subs[i]._id}
            ann.posts = results[i]
            anns.push(ann)
        }
        res.status(200).jsonp(anns).end()}).catch((err)=>{console.log(err);res.sendStatus(500)})
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