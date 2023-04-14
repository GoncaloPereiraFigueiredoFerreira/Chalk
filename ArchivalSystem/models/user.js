let mongoose = require("mongoose")
let bcrypt = require("bcrypt")
let SALT_WORK_FACTOR = 10;

let userSchema = new mongoose.Schema({
   _id:mongoose.Types.ObjectId,
   role:{
      type:[String],
      required: true
   },
   google_acc:{  //if it is a google acc, store token in password
      type:Boolean,
      required: true
   },
   first_name:{
      type:String,
      required: true
   },
   last_name:{
      type:String,
      required: true
   },
   email:{
      type:String,
      required: true,
      unique: true
   },
   password:  {
      type:String,
      required: true,
  },
  subscribed:{
      type:[String],
      required: true,
  }
})

userSchema.pre("save", function(next) {
   var user = this;

   // only hash the password if it has been modified (or is new)
   if (!user.isModified('password')) return next();

   // generate a salt
   bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password using our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
         if (err) return next(err);

         // override the cleartext password with the hashed one
         user.password = hash;
         next();
      });
   });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
   bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
       if (err) return cb(err);
       cb(null, isMatch);
   });
};

/* TODO: Remember this
// fetch user and test password verification
User.findOne({ username: 'jmar777' }, function(err, user) {
    if (err) throw err;

    // test a matching password
    user.comparePassword('Password123', function(err, isMatch) {
        if (err) throw err;
        console.log('Password123:', isMatch); // -> Password123: true
    });

    // test a failing password
    user.comparePassword('123Password', function(err, isMatch) {
        if (err) throw err;
        console.log('123Password:', isMatch); // -> 123Password: false
    });
});

*/



module.exports = mongoose.model('user', userSchema)
