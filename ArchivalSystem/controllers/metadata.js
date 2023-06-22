const mongoose = require("mongoose")
let Metadata= require("../models/file_metadata")


module.exports.addFileMetadata = function addFileMetadata(file_metadata){
    var data = new Date().toISOString().substring(0,16)
    return Metadata.create({
        _id: new mongoose.Types.ObjectId(),
        file_size:      file_metadata.file_size,
        publisher:      file_metadata.publisher,
        file_name:      file_metadata.file_name,
        file_extension: file_metadata.file_extension,
        file_type:      file_metadata.file_type,
        location:       file_metadata.location,
        checksum:       file_metadata.checksum,
        tags:           file_metadata.tags,
        publish_date:   data
    })
}

module.exports.getFileMetadata = function getFileMetadata(){
    return Metadata.find()
}

module.exports.getFileMetadataByName = function getFileMetadataByName(name){
    return Metadata.find({file_name:name})
}

module.exports.getFileMetadataByTag = function getFileMetadataByTag(tag){
    return Metadata.find({tags:tag})
}

module.exports.getFileMetadataByPublisher = function getFileMetadataByPublisher(publisher){
    return Metadata.find({publisher:publisher})
}

module.exports.getFileMetadataByID = function getFileMetadataByID(ID){
    return Metadata.findById(ID)
}

module.exports.getFilesByLocation = function getFilesByLocation(location){
    return Metadata.find({location: location})
}

module.exports.deleteFileByID = function deleteFileByID(ID){
    return Metadata.deleteOne({_id: ID})
}


// Please be very carefull about the execution of this method
module.exports.destroyMetadata = function destroyMetadata(){
    return Metadata.deleteMany({})
}