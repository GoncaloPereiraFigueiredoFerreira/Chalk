const { default: mongoose } = require("mongoose")
let Metadata= require("../models/file_metadata")


module.exports.addFileMetadata = function addFileMetadata(file_metadata){
    return Metadata.create({
        _id: new mongoose.Types.ObjectId(),
        file_size: file_metadata.file_size,
        publisher: file_metadata.publisher,
        file_name: file_metadata.name,
        location:  file_metadata.location,
        checksum:  file_metadata.checksum,
        tags:      file_metadata.tags,
        publish_date: file_metadata.date
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
    return Metadata.find({_id:ID})
}

/*
module.exports.addTestMetadata = function addTestMetadata(){
    return Metadata.create({
        _id: new mongoose.Types.ObjectId(), 
        file_size:360,
        publisher:"Gonçalo Ferreira",
        file_name:"Relatório de PSD",
        publish_date:"2001/01/23",
        location:"localhost:7777/request/xy",
        checksum:"okafakodfsofa",
        tags:["Relatorio","Projeto","Entrega"]
    })
}
*/


// Please be very carefull about the execution of this method
module.exports.destroyMetadata = function destroyMetadata(){
    return Metadata.deleteMany({})
}