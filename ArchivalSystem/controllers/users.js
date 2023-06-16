let User= require("../models/user")
let Channel = require("../models/channel")

module.exports.getUsers = ()=>{
    return User.find()
}

module.exports.existsUser = (email)=>{
    return User.exists({"email":email})
}

module.exports.remUsers = ()=>{
  return User.deleteMany()
}

module.exports.getUserPublisher = (user)=>{
  return new Promise((resolve,reject)=>{
    User.findOne({"email":user},{publisher:1}).then(result=>{
      let promises=[]
      if (result!=null){
        for(let sub of result.publisher){
          promises.push(Channel.findOne({_id:sub},{name:1}))
        }
      }
      Promise.all(promises).then((results)=>{
        resolve(results)
      }).catch(err=>console.log(err))
  }).catch(err=>console.log(err))
  }) 
}

module.exports.getUserSubscriptions = (user)=>{
    return new Promise((resolve,reject)=>{
      User.findOne({"email":user},{subscribed:1}).then(result=>{
       
        let promises=[]
        if (result!=null){
          for(let sub of result.subscribed){
            promises.push(Channel.findOne({_id:sub},{name:1}))
          }
        }
        Promise.all(promises).then((results)=>{
            resolve(results)
        }).catch(err=>console.log(err))
    }).catch(err=>console.log(err))
    }) 
}

module.exports.addSubscription = (user,channelID)=>{
  return User.updateOne({"email":user},{$addToSet :{"subscribed":channelID}})
}

module.exports.remSubscription = (user,channelID)=>{
  return User.updateOne({"email":user},{$pull:{"subscribed":channelID}})
}

module.exports.addPublisher = (user,channelID)=>{
  return User.updateOne({"email":user},{$addToSet :{"publisher":channelID}})
}

module.exports.createUser=(user)=>{
  return User.create({
      email: user.email,
      subscribed:[],
      publisher:[]
  })
}