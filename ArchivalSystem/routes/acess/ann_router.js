var express = require('express');
var router = express.Router();
let Announcements = require("../../controllers/announcements")


// Path to acess the announcements titles for a user
router.get("/titles/user:userID", function(req,res,next){
  let user = req.params.userID;

})

// Path to acess the announcements titles for a channel
router.get("/titles/channel:channelID", function(req,res,next){
  let channel = req.params.channelID;
  Announcements.getAnnTitlesChannel(channel).then((result)=>{
    res.status(200).jsonp(result).end()
  })

})

// Acess all announcements for a channel
router.get("/full/:annID",function(req,res,next){
  let ann = req.params.annId;
  Announcements.getAnnByID(ann).then((result)=>{
    res.status(200).jsonp(result).end()
  })
})



module.exports = router;