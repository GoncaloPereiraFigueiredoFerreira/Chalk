var express = require('express');
var router = express.Router();
var Users = require("../controllers/users")

/*
router.get('/', function(req, res, next) {
  Users.destroyUsers().then(()=>{  
      Users.userTest().then(()=>{
          Users.testPassword("goncaloff13@gmail.com","francisca134").then(()=>res.sendStatus(200))
  }).catch(
    err => {
      console.log(`caught the error: ${err}`);
      return res.sendStatus(500);
  });
  
});})
*/


router.get('/', function(req, res, next) {
  res.sendStatus(200);
});


module.exports = router;