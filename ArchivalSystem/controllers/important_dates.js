const { default: mongoose } = require("mongoose")
let Important_dates= require("../models/important_date")

module.exports.createImportantDate = (date)=>{
    return Important_dates.create({
      _id: new mongoose.Types.ObjectId(),
      channel: date.channel,
      title: date.title,
      description:date.description,
      date:date.date,
      delivery:date.delivery,
      submissions:[]
    })
}

module.exports.getSubmissions=(date)=>{
    return Important_dates.find({channel:chID},  {submissions:1})
}

module.exports.addSubmission = (date,submission)=>{
    return Important_dates.updateOne({_id:date},{$push:{submissions:submission}})
}

module.exports.remImportantDate= (date)=>{
    return Important_dates.deleteOne({_id:date})
}


module.exports.findByChannel=(chID)=>{
    return Important_dates.find({channel:chID}, {_id: 1,channel: 1,title: 1,description:1,date:1,delivery:1})
}

module.exports.findDatesByChannel=(chID)=>{
  return Important_dates.find({channel:chID,delivery:false}, {_id: 1,channel: 1,title: 1,description:1,date:1,delivery:1})
}

module.exports.findDeliveriesByChannel=(chID)=>{
  return Important_dates.find({channel:chID,delivery:true}, {_id: 1,channel: 1,title: 1,description:1,date:1,delivery:1})
}