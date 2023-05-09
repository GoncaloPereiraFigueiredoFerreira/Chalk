const mongoose = require("mongoose"),
      Schema = mongoose.Schema,
      passportLocalMongoose = require("passport-local-mongoose")

var User = new Schema({
      level: String,
      active: Boolean,
      date_created: String,
      last_acess: String
})
    
User.plugin(passportLocalMongoose)

module.exports = mongoose.model("User",User)