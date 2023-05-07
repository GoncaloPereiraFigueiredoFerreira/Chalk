const { default: mongoose } = require("mongoose")
let Channel= require("../models/channel")


module.exports.createNewChannel = function createNewChannel(channel){
  return Channel.create({
      _id: new mongoose.Types.ObjectId(),
      name: channel.name,
      entry_code: channel.entry_code,
      publishers: channel.publishers,
      consumers:  [],
      contents:  [],
  })
}
