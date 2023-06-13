var express = require('express');
var router = express.Router();
var User = require("../../controllers/users")

// List of subscription
router.get("/subscriptions/:user", function (req,res){
    User.getUserSubscriptions().then(results=>{
        res.status(200).jsonp(results).end()
    })
})

// Profile information
router.get("/info/:user", function (req,res){
  
})





module.exports = router;