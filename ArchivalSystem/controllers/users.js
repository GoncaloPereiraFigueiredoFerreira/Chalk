let User= require("../models/user")

module.exports.getUserSubscriptions = (user)=>{
    return User.find({"email":user},{subscribed:1})
}

module.exports.addSubscription = (user,channelID)=>{
  return User.updateOne({"email":user},{$push:{"subscribed":channelID}})
}

module.exports.remSubscription = (user,channelID)=>{
  return User.updateOne({"email":user},{$pull:{"subscribed":channelID}})
}


module.exports.createUser=(email,userInfo)=>{
  return User.create({
      email: email,
      first_name:user.first_name,
      last_name:user.last_name,
      subscribed:[],
      publisher:[]
  })

}