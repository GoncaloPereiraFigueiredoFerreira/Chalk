const mongoose = require("mongoose")
let Announcement= require("../models/announcement")


module.exports.createNewAnn = (user, announcement) =>{
    var data = new Date().toISOString().substring(0,16)
    return Announcement.create({
      _id: new mongoose.Types.ObjectId(),
      channel: announcement.channel,
      publisher: user,
      title: announcement.title,
      content:announcement.content,
      comments:[],
      date:data
  })
}

module.exports.getAnnTitlesChannel = (channel)=>{
    return Announcement.find({"channel":channel},{_id:1,publisher:1,title:1,date:1})
  
}

module.exports.getAnnByID = (id)=>{
  Announcement.findById(id)
}

module.exports.addComment = (ann, comment)=>{
    var data = new Date().toISOString().substring(0,16)
    return Announcement.updateOne({_id:ann},
      {
        $push:
          {"comments" : {
                commenter: comment.commenter,
                comment: comment.comment,
                date: data
              }
          }
      })
}
