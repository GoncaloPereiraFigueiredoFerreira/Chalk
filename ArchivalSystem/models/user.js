let mongoose = require("mongoose")

let userSchema = new mongoose.Schema({
   email:{
      type:String,
      required: true,
      unique: true
  },
   first_name:{
      type:String,
      required: true
   },
   last_name:{
      type:String,
      required: true
   },
  subscribed:{
      type:[String],
      required: true,
  },
   publisher:{
    type:[String],
    required: true,
  }
})

module.exports = mongoose.model('user', userSchema)
