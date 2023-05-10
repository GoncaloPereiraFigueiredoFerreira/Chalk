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

//TODO: treat error
module.exports.getChannelInfo = function getChannelInfo(channel){
    return Channel.findById(channel,{_id:1,name:1,publishers:1}).then((channel)=>{
          return channel
    }).catch((err)=>{})
}





//TODO: treat error
module.exports.getChannelContents = function getChannelContents(channel){
    return Channel.findById(channel,{_id:1,contents:1}).then((contents)=>{
        return contents
    }).catch((err)=>{})
}

//TODO: treat error
module.exports.getChannelConsumers= function getChannelConsumers(channel){
    return Channel.findById(channel,{_id:1,consumers:1}).then((contents)=>{
      return contents
  }).catch((err)=>{})
}

//TODO: treat error
module.exports.searchChannel = function searchChannel(query){
    return Channel.find({"name":{'$regex' : query, '$options' : 'i'}},{_id:1,name:1}).limit(5).then((contents)=>{
      return contents
  }).catch((err)=>{})
}