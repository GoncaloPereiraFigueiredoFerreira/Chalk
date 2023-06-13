const { default: mongoose } = require("mongoose")
let Channel= require("../models/channel")

module.exports.getChannels = ()=>{
  return Channel.find()
}

module.exports.existsChannel = (id)=>{
  return Channel.exists({_id:id})
}

module.exports.remChannels = ()=>{
  return Channel.deleteMany()
}


module.exports.addSubscriptor = (email,channel)=>{
  return Channel.updateOne({_id:channel},{ $addToSet: {"consumers": email}})
}
module.exports.remSubscriptor = (email,channel)=>{
  return Channel.updateOne({_id:channel},{ $pull: {"consumers": email}})
}

module.exports.createDir = (channel,path)=>{
  return Channel.find({_id:channel,"contents.path":path}).then(results=>{
    if (results.length==0){
      return Channel.updateOne({_id:channel},{ $addToSet: {"contents": {"path":path}}})
    }
    else return nullmat
  })
}

module.exports.addFile = (channel,path,file)=>{
  return Channel.updateOne({_id:channel,"contents.path":path},{$addToSet:{"contents.$.files":file}})
}

//No clue if this works
module.exports.mvFile = (channel,newpath,oldpath,file)=>{
  return Promises.all([
    Channel.updateOne({_id:channel,"contents.path":oldpath},{$pull:{"contents.$.files":file}}),
    Channel.updateOne({_id:channel,"contents.path":newpath},{$addToSet:{"contents.$.files":file}})
  ])
}


module.exports.createNewChannel = function createNewChannel(channel){
  return Channel.create({
      _id: new mongoose.Types.ObjectId(),
      name: channel.name,
      banner: channel.banner,
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