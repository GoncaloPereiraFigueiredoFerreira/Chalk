let User= require("../models/user")

module.exports.getUsers = ()=>{
    return User.find()
}

module.exports.existsUser = (email)=>{
    return User.exists({"email":email})
}


module.exports.remUsers = ()=>{
  return User.deleteMany()
}

module.exports.getUserSubscriptions = (user)=>{
    return User.findOne({"email":user},{subscribed:1})
}

module.exports.addSubscription = (user,channelID)=>{
  return User.updateOne({"email":user},{$addToSet :{"subscribed":channelID}})
}

module.exports.remSubscription = (user,channelID)=>{
  return User.updateOne({"email":user},{$pull:{"subscribed":channelID}})
}


module.exports.createUser=(user)=>{
  return User.create({
      email: user.email,
      subscribed:[],
      publisher:[]
  })
}