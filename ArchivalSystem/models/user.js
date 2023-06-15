let mongoose = require("mongoose")

let userSchema = new mongoose.Schema({
   email:{
      type:String,
      required: true,
      unique: true
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
