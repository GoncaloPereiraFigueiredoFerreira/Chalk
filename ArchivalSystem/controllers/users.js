const { default: mongoose } = require("mongoose")
let User= require("../models/user")
/*
module.exports.userTest=function userTest(){
    return User.create({
        _id: new mongoose.Types.ObjectId(),
        google_acc: false,
        role:["User"],
        first_name: "Goncalo",
        last_name: "Ferreira",
        email:"goncaloff13@gmail.com",
        password:"francisca1234",
        subscribed:[]
    })
}
*/

module.exports.testPassword=function testPassword(username,candidate){
    return User.findOne({email:username}).then(user1=> {
        user1.comparePassword(candidate, function(err, isMatch) {
            if (err) throw err;
            console.log(candidate, isMatch); // -> Password123: true
        });    
    }) 
}



// Please be very carefull about the execution of this method
module.exports.destroyUsers = function destroyUsers(){
    return User.deleteMany({})
}