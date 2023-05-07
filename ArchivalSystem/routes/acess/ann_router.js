var express = require('express');
var router = express.Router();


// Path to acess the announcements titles for a user
router.get("/titles/user:userID", function(req,res,next){
  let user = req.params.userID;

})

// Path to acess the announcements titles for a channel
router.get("/titles/channel:channelID", function(req,res,next){
  let channel = req.params.channelID;

})

// Acess all announcements for a user
router.get("/full/user:userID",function(req,res,next){
  let user = req.params.userID;
  

})

// Acess all announcements for a user
router.get("/full/channel:channelID",function(req,res,next){
  let channel = req.params.userID;
  

})



module.exports = router;