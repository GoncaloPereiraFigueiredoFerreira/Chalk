let mongoose = require("mongoose")


const contentSchema = mongoose.Schema({
    path:{
      type:String,
      required:true,
      index: {unique: true, dropDups: true}
    },
    files:{
      type:[String],
      required:false,
      default:[]
    },
});


let channelSchema = new mongoose.Schema({
    _id:mongoose.Types.ObjectId,

    name: {
      type:String,
      required: true,
      unique:true
    },
    banner:{
      type:String,
      required: true,
    },

    // Código de acesso ao canal
    entry_code:{
      type:String,
      required: false,
    },

    // User / Users responsible for channel: ids of them
    publishers:{
        type:[String],
        required: true,
    },

    consumers:{
        type:[String],
        required: true,
    },
    
    // Directories 
    contents:{
      type:[{type:contentSchema,unique:true,required:true}],
      required: true,
  },

})



module.exports = mongoose.model('channel', channelSchema)
