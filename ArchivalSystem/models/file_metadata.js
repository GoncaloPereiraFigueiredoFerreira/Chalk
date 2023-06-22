let mongoose = require("mongoose")

let file_metadataSchema = new mongoose.Schema({
    _id:mongoose.Types.ObjectId,

    file_size:{
        type:Number,
        required: true,
    },

    publisher:{
        type:String,
        required: true,
    },

    file_name:{
        type:String,
        required: true,
    },

    file_extension:{
        type:String,
    },

    file_type:{
        type:String,
        required: true,
    },

    publish_date:{
        type:String,
        required: true,
    },

    location:{
        type:String,
        required: true,
    },

    checksum:{
        type:String,
        required: true,
    },

    tags:{
        type:[String],
        required: true,
    },
})


module.exports = mongoose.model('file_metadata', file_metadataSchema)
