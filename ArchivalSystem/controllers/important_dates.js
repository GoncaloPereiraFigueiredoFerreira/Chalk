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

module.exports.remImportantDate= (date)=>{
    return Important_dates.deleteOne({_id:date})
}


module.exports.findByChannel=(chID)=>{
    return Important_dates.find({channel:chID})
}

module.exports.findDatesByChannel=(chID)=>{
  return Important_dates.find({channel:chID,delivery:false})
}

module.exports.findDeliveriesByChannel=(chID)=>{
  return Important_dates.find({channel:chID,delivery:true})
}