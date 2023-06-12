let mongoose = require("mongoose")

let importantDateSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    channel:{
      type:String,
      required:true
    },
  
    title:{
      type:String,
      required:true
    },

    description:{
      type:String,
      required:true
    },
    
    date:{
        type:String,
        required: true,
    },
})


module.exports = mongoose.model('important_date', importantDateSchema)
