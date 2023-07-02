var passport = require('passport');
require("dotenv").config();
const crypto = require("crypto")
// User model
var User = require('./models/user');


// Strategies
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require("passport-google-oauth2").Strategy;

var fs = require("fs")
 
var privateKEY  = fs.readFileSync('./keys/private.pem','utf8');
// Used to create, sign, and verify tokens
var jwt = require('jsonwebtoken');
 
// Local strategy with passport mongoose plugin User.authenticate() function
passport.use(new LocalStrategy(User.authenticate()));
 
// Required for our support for sessions in passport.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 
exports.getToken = function(user) {
    // This helps us to create the JSON Web Token
  
    return jwt.sign(user, privateKEY,{expiresIn: 3600, algorithm:"RS512"});
};
/*
exports.googlePassport = passport.use(new GoogleStrategy({
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:7777/auth/google", 
      passReqToCallback : true
    },
    (request, accessToken, refreshToken, profile, done) => {
      try {
          
          User.findOne(({username: profile.emails[0].value})).then((existingUser)=>{
            if (existingUser) {
              return done(null, existingUser);
            }
            else{
              var data = new Date().toISOString().substring(0,16)
              User.register(new User({
                username: profile.emails[0].value,
                first_name: profile.name.givenName,
                last_name:profile.name.familyName,
                level:"user",
                active:true,
                date_created:data,
                last_acess:data
              }),accessToken).then(user=>{
                return done(null, user);
              })
                       
          }})

         
      } catch (error) {
          return done(error, false)
      }
    }
  ));
 */
// Options to specify for my JWT based strategy.
var opts = {};
 
// Specifies how the jsonwebtoken should be extracted from the incoming request message
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
 
//Supply the secret key to be using within strategy for the sign-in.
opts.secretOrKey = privateKEY;

opts.algorithm = ["RS512"]
 
// JWT Strategy
exports.jwtPassport = passport.use(new JwtStrategy(opts,
   // The done is the callback provided by passport
   (jwt_payload, done) => {
     
       // Search the user with jwt.payload ID field
       User.findOne({username: jwt_payload.username}).then((user,err) => {
           // Have error
           if (err) {
               return done(err, false);
           }
           // User exist
           else if (user) {
               return done(null, user);
           }
           // User doesn't exist
           else {
               return done(null, false);
           }
       });
   }));
 
// Verify an incoming user with jwt strategy we just configured above   
exports.verifyUser = passport.authenticate('jwt', {session: false});

