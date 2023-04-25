let mongoose = require("mongoose")

let channelSchema = new mongoose.Schema({
    _id:mongoose.Types.ObjectId,

    name: {
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
        type: [
          {
            path:String, // Formated string, that designates the path
            files:[String] // Filemetadata ids for the files contained in said path
          }
        ],
        required: true
    },


})
//Passport local-mongoose

module.exports = mongoose.model('file_metadata', file_metadataSchema)
