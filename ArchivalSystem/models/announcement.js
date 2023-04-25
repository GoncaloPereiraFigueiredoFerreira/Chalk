let mongoose = require("mongoose")

let announcementSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    origin:{
      publisher: String,
      channel: String,
    },
    
    associated_file:{
        type:String,
        required: false,
    },

    comments:[{
            commenter:{
                type:String,
                required: true,
            },
            comment:{
                type:String,
                required: true,
            },
            date:{
                type:String,
                required: true,
            },    
        }],
    date:{
        type:String,
        required: true,
    },
})


module.exports = mongoose.model('announcement', announcementSchema)
