const express = require('express');
const router = express.Router();
const axios = require("axios")
const jwt = require("jsonwebtoken")

let auth_location = process.env.AUTH_SERVER
let archive_location = process.env.ARCH_SERVER
let public_key = ""
let loggedIn = {}

function verifyAuthentication(req,res,next){
  if (req.cookies.token){
    if (public_key == ""){
      axios.get(auth_location+"/public.pem").then((response)=>{
        public_key = response.data
        let result = jwt.verify(req.cookies.token,public_key,{algorithm:"RS512"})
        req.user = {username:result.username,level:result.level}
        next()
      }).catch(err=>{
        req.user = {}
        next()
      })
    }else{
      let result = jwt.verify(req.cookies.token,public_key,{algorithms:["RS512"]})
      req.user = {username:result.username,level:result.level}
      next()
    }
  }
  else{
    next()
}
    
}

router.get('/',verifyAuthentication,(req, res, next) =>{
  res.render('dashboard');
});

router.get("/search/:keywords",(req,res,next)=>{
  axios.get(archive_location+"/acess/channel/search/"+req.params.keywords).then(results=>{
      res.status(200).jsonp(results.data).end()
  })
});

/// Login and Register Pages

router.get("/login",(req,res,next)=>{
  res.render("login")
});

router.get("/register",(req,res,next)=>{
  res.render("register")
});

router.post("/login",(req,res,next)=>{
  console.log(req.body)
  axios.post(auth_location+"/login",req.body).then(resp=>{
    console.log(resp.data)
    if (resp.data.success){
      loggedIn[resp.data.token]=1
      res.cookie("token",resp.data.token)
      res.redirect("/")
    }
    else{
      // should have some kind of warning that login failled for some reason
      res.redirect("/login")
    }
  }).catch((err)=>{

    res.redirect("/login")
  })
});

router.post("/register",(req,res,next)=>{
  axios.post(auth_location+"/register",req.body).then(res=>{
    //respond to client
    if (req.data.sucess){
      res.redirect("/")
    }
    else{
      // should have some kind of warning that login failled for some reason
      res.redirect("/register")
    }
  }).catch((err)=>{
      console.log(err)
      res.redirect("/register")
  })
});

router.get("/logout",(req,res,next)=>{
  delete loggedIn[res.cookies.token]
  res.clearCookie("token");
  res.redirect("login")
})

/// Channel Routes

router.get("/channel/posts/:chID", (req, res, next)=> {
  let ann = req.query.post
  let chn = req.params.chID
  let promisses = []
  promisses.push(axios.get(archive_location+"/acess/channel/info/"+chn))
  promisses.push(axios.get(archive_location+"/acess/posts/channel/"+chn))
  Promise.all(promisses).then(results=>{
    let info = results[0].data
    let titles = results[1].data
    if (ann!=undefined){
      axios.get(archive_location+"/acess/posts/"+ann).then((post)=>{
        res.render("channel/announcements",{channel:info,titles:titles,announcement:post.data})
      })
    }
    else if (titles.length != 0){
      let id = titles[0]._id
      axios.get(archive_location+"/acess/posts/"+id).then((post)=>{
          console.log(post.data.comments)
          res.render("channel/announcements",{channel:info,titles:titles,announcement:post.data})
      })
    }
    else
      res.render("channel/announcements",{channel:info,titles:titles,announcement:{}})
  })  
})

router.get("/channel/:chID",(req, res, next)=>{
  let promises = []
  let chn = req.params.chID
  promises.push(axios.get(archive_location+"/acess/channel/info/"+chn))
  promises.push(axios.get(archive_location+"/acess/channel/contentTree/"+chn))
  promises.push(axios.get(archive_location+"/acess/posts/channel/"+chn))
  promises.push(axios.get(archive_location+"/acess/dates/channel/"+chn))
  Promise.all(promises).then(results=>{
    folders=JSON.stringify(results[1].data).replaceAll("\"","'")
    res.render("channel/index",{
      channel:results[0].data,
      folders:folders,
      titles:results[2].data,
      dates:results[3].data
    })
  })
});

/// Forms
router.get("/channel/:chID/addpost",(req,res,next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn).then((resp)=>{
    res.render("channel/create_post",{channel:resp.data})
  })
});

router.post("/channel/:chID/addpost",(req,res,next)=>{
  axios.post(archive_location+"/ingest/newpost",
  {
    user:"default@need2.change",
    announcement:{
      title:req.body.title,
      content:req.body.content,
      channel:req.params.chID
    }
  
  }).then(()=>{
      res.redirect("/channel/"+req.params.chID)
  }).catch((err)=>{

  })
});

router.get("/channel/:chID/adddate",(req,res,next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn).then((resp)=>{
    res.render("channel/create_date",{channel:resp.data})
  })
});

router.post("/channel/:chID/adddate",(req,res,next)=>{
    axios.post(archive_location+"/ingest/newdate",
    {
      date:{
        channel: req.params.chID,
        title: req.body.subject,
        description: req.body.description,
        date: req.body.date
      }
    
    }).then(()=>{
        res.redirect("/channel/"+req.params.chID)
    }).catch((err)=>{
  
    })

});

router.post("/channel/posts/addcomment",(req,res,next)=>{

  axios.post(archive_location+"/ingest/newcomment",
  {
    user:"defaultUser@nothing.com",
    announcement: req.query.announcement,
    channel:req.query.channel,
    content:req.body.comment
  
  }).then(()=>{
      res.redirect("/channel/posts/"+req.query.channel+"?post="+req.query.announcement)
  }).catch((err)=>{
  })
});


module.exports = router;