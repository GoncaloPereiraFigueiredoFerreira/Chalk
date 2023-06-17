let mongoose = require("mongoose")

const submissionSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  description:String,
  file: String,
  deliver_date: String,
  student:String,
})


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

    delivery:{
        type:Boolean,
        required: false,
        default:false
    },

    submissions:{
        type:[{type:submissionSchema}],
        required: false,
        default:[]
    }

})


module.exports = mongoose.model('important_date', importantDateSchema)
