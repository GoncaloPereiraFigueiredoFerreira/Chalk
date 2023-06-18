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
  User.register(new User({
    username: req.body.email, 
    first_name:req.body.first_name,
    last_name:req.body.last_name,
    level:"user",
    active:true,
    date_created:data,
    last_acess:data
  }),
    req.body.password, (err, user) => {
    if(err) {
      console.log(err)
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: false,err: err});
    }
    else {
      var token = authenticate.getToken({username: req.body.email, level: "user", first_name:req.body.first_name, last_name:req.body.last_name});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token});
    }
  });
});
 
// Login TODO: Atualizar last acessed
router.post('/login', passport.authenticate('local',{ session: false }), (req, res) => {
    if (req.user.active){
      // Create a token
      var token = authenticate.getToken({username: req.user.username, level: "user", first_name:req.user.first_name, last_name:req.user.last_name});
      // Response
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'You are successfully logged in!'});
    }
    else
      res.json({success: false, status: 'Deactivated Account'});
});



router.get("/auth/google",
  passport.authenticate("google", { scope:
    [ 'email', 'profile' ] }
));


router.get("/auth/google/callback",
  passport.authenticate("google",{session:false}),
  (req, res) => {
      
      console.log({username: req.user.username, level: "user", first_name:req.user.first_name, last_name:req.user.last_name})
      var token = authenticate.getToken({username: req.user.username, level: "user", first_name:req.user.first_name, last_name:req.user.last_name});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'register', email:req.user.username,first_name:req.user.first_name, last_name:req.user.last_name});


      
      
  }
)


module.exports = router;

