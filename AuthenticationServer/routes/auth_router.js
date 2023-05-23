var express = require('express');
var router = express.Router();
var passport = require('passport');
 
// User model
var User = require('../models/user');
 
// Parse Json
const bodyParser = require('body-parser');
router.use(bodyParser.json());
 
// Get our authenticate module
var authenticate = require('../auth_strat');


// TODO: this request should be protected somehow
router.get("/public.pem",(req,res,next)=>{
    res.sendFile("/keys/public.pem",{root:"."})
})


router.post("/deactivate",authenticate.verifyUser,(req, res, next) =>{
    User.updateOne({username:req.user.username},{$set:{active:false}}).then(()=>{
         // Add username and role to req
        res.status(200).jsonp({"message":"Account deactivated"})
    })
});


// Get Users
router.get('/', authenticate.verifyUser, (req, res, next) =>{
  if (req.user.level=="admin"){
    // Get all records
    User.find()
      .then((users,err) => {
        
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        else{
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.jsonp(users);
        }
      

    })} 
    else res.sendStatus(401);

  })




// Register User
router.post('/register', (req, res, next) => {
  var data = new Date().toISOString().substring(0,16)
  // Create User
  User.register(new User({username: req.body.username, level:req.body.level,active:true,date_created:data,last_acess:data}),
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      // Use passport to authenticate User
      passport.authenticate('local',{ session: false })(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});
 
// Login TODO: Atualizar last acessed
router.post('/login', passport.authenticate('local',{ session: false }), (req, res) => {
    if (req.user.active){
      // Create a token
      var token = authenticate.getToken({username: req.user.username, level: req.user.level});
      // Response
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'You are successfully logged in!'});
    }
    else
      res.json({success: false, status: 'Deactivated Account'});
});
 
// Logout
router.get('/logout',authenticate.verifyUser,(req, res,next) => {
 if (req.session) {
   req.session.destroy();
   res.clearCookie('session-id');
   res.json({success: true})
 }
 else {
   var err = new Error('You are not logged in!');
   err.status = 403;
   next(err);
 }
});
 
module.exports = router;

