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

module.exports.addPublisher = (channel,email) =>{
  return Promise.all([
      Channel.updateOne({_id:channel},{ $addToSet: {"publishers": email}}),
      Channel.updateOne({_id:channel},{ $pull:{"consumers": email}})
  ])
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
    else return null
  })
}

module.exports.removeDir = (channel,path)=>{
  return Channel.updateOne({_id:channel},{ $pull: {"contents": {"path":path}}})
}

module.exports.addFile = (channel,path,file)=>{
  return Channel.updateOne({_id:channel,"contents.path":path},{$addToSet:{"contents.$.files":file}})
}

module.exports.rmFile = (channel,path,file)=>{
  return Channel.updateOne({_id:channel,"contents.path":path},{$pull:{"contents.$.files":file}})
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
      description:channel.description,
      banner: channel.banner,
      entry_code: channel.entry_code,
      publishers: channel.publishers,
      consumers:  [],
      contents: [],
  })
}

module.exports.editChannel = (id,channel)=>{
  return Channel.updateOne({_id:id},
    {
      name: channel.name, 
      banner: channel.banner,
      description:channel.description,
      entry_code:channel.entry_code
    })
}


module.exports.deleteChannel = (channel)=>{
    return Channel.deleteOne({_id:channel})
}

//TODO: treat error
module.exports.getChannelInfo = function getChannelInfo(channel){
    return Channel.findById(channel,{_id:1,banner:1,entry_code:1,name:1,publishers:1,consumers:1,description:1}).then((channel)=>{
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
    return Channel.find({"name":{'$regex' : query, '$options' : 'i'}},{_id:1,name:1,description:1,consumers:1}).limit(5).then((contents)=>{
      return contents
  }).catch((err)=>{})
}