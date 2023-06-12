const { default: mongoose } = require("mongoose")
let Important_dates= require("../models/important_date")

module.exports.createImportantDate = (date)=>{
  return Important_dates.create({
    _id: new mongoose.Types.ObjectId(),
    channel: date.channel,
    title: date.title,
    description:date.description,
    date:date.date
  })
}
