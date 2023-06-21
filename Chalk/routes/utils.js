const axios = require("axios")
const jwt = require("jsonwebtoken")
let auth_location = process.env.AUTH_SERVER
let public_key = ""

function updatePublicKey(){
  return new Promise((resolve,reject)=>{
    if (public_key == ""){
      axios.get(auth_location+"/public.pem").then((response)=>{
        public_key = response.data
        resolve()
      })
    }
    else{resolve()}
  })
}


function verifyToken(token){
  try{
    return jwt.verify(token,public_key,{algorithm:"RS512"})
  }
  catch(err){
    console.log(err.message)
    return {}
  }
}

module.exports.verifyAuthentication =function verifyAuthentication(req,res,next){
  if (req.cookies.token){
      updatePublicKey().then(()=>{
        let result = verifyToken(req.cookies.token)
        if (result=={} || result==undefined) res.redirect("/login")
        else{
          req.user = {username:result.username,level:result.level,first_name:result.first_name,last_name:result.last_name}
          next()  
        }
      })
  }
  else{
      res.redirect("/login")
  }
}
