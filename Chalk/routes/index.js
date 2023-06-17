const express = require('express');
const router = express.Router();
const axios = require("axios")
const jwt = require("jsonwebtoken")

var FormData = require('form-data');
var archiver = require('archiver')
var bagit = require('../bagit/bagit')
var multer = require('multer')
const uploadFolder = 'uploads'
const bagFolder = 'bagit/bags'
var upload = multer({ dest: uploadFolder })
var fs = require("fs");

let auth_location = process.env.AUTH_SERVER
let archive_location = process.env.ARCH_SERVER
let storage_location = process.env.STORE_SERVER
let public_key = ""
let loggedIn = {}

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

function verifyAuthentication(req,res,next){
  if (req.cookies.token){
      updatePublicKey().then(()=>{
        let result = verifyToken(req.cookies.token)
        req.user = {username:result.username,level:result.level,first_name:result.first_name,last_name:result.last_name}
        next()  
      })
  }
  else{
      req.user = {}
      next() 
  }
}
  
router.get("/sidebar",verifyAuthentication,(req, res, next) =>{
  let promises = []
  promises.push(axios.get(archive_location+"/acess/profile/subscriptions/"+req.user.username))
  promises.push(axios.get(archive_location+"/acess/profile/publisher/"+req.user.username))
  Promise.all(promises).then((results)=>{
      res.status(200).jsonp({subchannels:results[0].data,pubchannels:results[1].data}).end()
  })
})

router.get('/',verifyAuthentication,(req, res, next) =>{
  let promises = []
  promises.push(axios.get(archive_location+"/acess/profile/subscriptions/"+req.user.username))
  promises.push(axios.get(archive_location+"/acess/profile/publisher/"+req.user.username))
  promises.push(axios.get(archive_location+"/acess/posts/user/"+req.user.username))
  promises.push(axios.get(archive_location+"/acess/dates/user/"+req.user.username))
  Promise.all(promises).then((results)=>{
    res.render('dashboard',{
            user:req.user,
            subchannels:results[0].data,
            pubchannels:results[1].data,
            anns: results[2].data,
            dates:results[3].data         
          });
  })
  
});

router.get("/searchbar/:keywords",verifyAuthentication,(req,res,next)=>{
  axios.get(archive_location+"/acess/channel/search?keywords="+req.params.keywords).then(results=>{
      res.status(200).jsonp(results.data).end()
  })
});

router.get("/search",verifyAuthentication,(req,res,next)=>{
  axios.get(archive_location+"/acess/channel/search?keywords="+req.query.keywords).then(results=>{
    res.render("channel_list",{user:req.user,channels:results.data})
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
  axios.post(auth_location+"/register",req.body).then(resp=>{
    //respond to client
    if (resp.data.success){
      loggedIn[resp.data.token]=1
      res.cookie("token",resp.data.token)
      axios.post(archive_location+"/ingest/newaccount",{"email":req.body.email, "name":req.body.first_name +  " " + req.body.last_name}).then(()=>{
        res.redirect("/")
      }).catch(err=>console.log(err))
      
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

router.get("/logout",verifyAuthentication,(req,res,next)=>{
  delete loggedIn[req.cookies.token]
  res.clearCookie("token");
  res.redirect("login")
})

/// Channel Routes

router.get("/channel/posts/:chID",verifyAuthentication, (req, res, next)=> {
  let ann = req.query.post
  let chn = req.params.chID
  let promisses = []
  promisses.push(axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username)) //add query string to query if user is subscribed to channel
  promisses.push(axios.get(archive_location+"/acess/posts/channel/"+chn))
  Promise.all(promisses).then(results=>{
    let info = results[0].data
    req.user.subscribed=info.subscribed
    let titles = results[1].data
    if (ann!=undefined){
      axios.get(archive_location+"/acess/posts/"+ann).then((post)=>{
        res.render("channel/announcements",{user:req.user,channel:info,titles:titles,announcement:post.data})
      })
    }
    else if (titles.length != 0){
      let id = titles[0]._id
      axios.get(archive_location+"/acess/posts/"+id).then((post)=>{
          console.log(post.data.comments)
          res.render("channel/announcements",{user:req.user,channel:info,titles:titles,announcement:post.data})
      })
    }
    else
      res.render("channel/announcements",{user:req.user,channel:info,titles:titles,announcement:{}})
  })  
})

router.get("/channel/:chID",verifyAuthentication,(req, res, next)=>{
  let promises = []
  let chn = req.params.chID
  promises.push(axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username))
  promises.push(axios.get(archive_location+"/acess/channel/contentTree/"+chn))
  promises.push(axios.get(archive_location+"/acess/posts/channel/"+chn))
  promises.push(axios.get(archive_location+"/acess/dates/channel/"+chn))
  Promise.all(promises).then(results=>{
    folders=JSON.stringify(results[1].data).replaceAll("\"","'")
    req.user.subscribed=results[0].data.subscribed
    res.render("channel/index",{
      user:req.user,
      channel:results[0].data,
      folders:folders,
      titles:results[2].data,
      dates:results[3].data
    })
  })
});

router.get("/channel/:chID/settings",verifyAuthentication,(req, res, next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username).then((response)=>{
      res.render("channel/editchannel",{user:req.user, channel:response.data})
  })
})

router.post("/channel/:chID/settings",verifyAuthentication,(req, res, next)=>{
  let chn = req.params.chID
  console.log(req.body)
  axios.put(archive_location+"/manage/channel/"+chn,req.body).then(()=>{
    res.redirect("/channel/"+chn+"/settings")
  })
})


router.get("/channel/:chID/students",verifyAuthentication,(req, res, next)=>{
  let chn = req.params.chID
  let promisses=[]
  promisses.push(axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username))
  promisses.push(axios.get(archive_location+"/acess/channel/studentlist/"+chn))
  Promise.all(promisses).then(results=>{
    console.log(results[1].data)
    res.render("channel/studentslist",{user:req.user, channel:results[0].data,students:results[1].data})
  })
})

router.get("/channel/:chID/submissions",verifyAuthentication,(req, res, next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username).then((response)=>{
      res.render("channel/submissions",{user:req.user, channel:response.data})
  })
})


/// Forms
router.get("/createChannel",verifyAuthentication,(req,res,next)=>{
  
  res.render("createChn_form",{user:req.user,defaultV:{},edit:false})
})

router.post("/createChannel",verifyAuthentication,(req,res,next)=>{
  req.body.publishers=[req.user.username]
  axios.post(archive_location+"/ingest/newchannel",{channel:req.body}).then((response)=>{
    res.redirect("/channel/"+response.data._id)
  })
})

router.get("/channel/:chID/edit",verifyAuthentication,(req,res,next)=>{
  axios.get(archive_location+"/acess/channel/info/"+chn).then((response)=>{
    res.render("createChn_form",{user:req.user,defaultV:response.data,edit:true})
  })
})

router.post("/channel/:chID/edit",verifyAuthentication,(req,res,next)=>{
  let id = req.params.chID
  axios.put(archive_location+"/manage/channel/"+id,{channel:req.body}).then((response)=>{
    res.redirect("/channel/"+id)
  })
})

router.get("/channel/:chID/delete",verifyAuthentication,(req,res,next)=>{
  let id = req.params.chID
  axios.delete(archive_location+"/manage/channel/"+id).then((response)=>{
    res.redirect("/")
  })
})



router.get("/channel/:chID/addpost",verifyAuthentication,(req,res,next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username).then((resp)=>{
    req.user.subscribed=resp.data.subscribed
    res.render("channel/create_post",{user:req.user,channel:resp.data,defaultV:{},edit:false})
  })
});

router.post("/channel/:chID/addpost",verifyAuthentication,(req,res,next)=>{
  axios.post(archive_location+"/ingest/newpost",
  {
    user:req.user.first_name + " " + req.user.last_name,
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


router.get("/channel/posts/:chID/edit",verifyAuthentication,(req,res,next)=>{
  let chn = req.params.chID
  let ann = req.query.post
  axios.get(archive_location+"/acess/channel/info/"+chn).then((resp)=>{
    axios.get(archive_location+"/acess/posts/"+ann).then((resp2)=>{
      res.render("channel/create_post",{user:req.user,channel:resp.data,defaultV:resp2.data,edit:true})
    })  
  })
});

router.post("/channel/posts/:chID/edit",verifyAuthentication,(req,res,next)=>{
    let ann = req.query.post
    console.log(ann)
    axios.put(archive_location+"/manage/posts/"+ann,req.body).then(()=>{
      res.redirect("/channel/"+req.params.chID)
    })

});

router.get("/channel/posts/:chID/delete",verifyAuthentication,(req,res,next)=>{
  let ann = req.query.post
  console.log(ann)
  axios.delete(archive_location+"/manage/posts/"+ann).then(()=>{
    res.redirect("/channel/"+req.params.chID)
  })
});

router.get("/channel/:chID/adddate",verifyAuthentication,(req,res,next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username).then((resp)=>{
    req.user.subscribed=resp.data.subscribed
    res.render("channel/create_date",{user:req.user,channel:resp.data})
  })
});

router.post("/channel/:chID/adddate",verifyAuthentication,(req,res,next)=>{
    axios.post(archive_location+"/ingest/newdate",
    {
      date:{
        channel: req.params.chID,
        title: req.body.subject,
        description: req.body.description,
        date: req.body.date,
        delivery:req.body.deliver=="on"
      }
    }).then(()=>{
        res.redirect("/channel/"+req.params.chID)
    }).catch((err)=>{
  
    })

});

router.get("/channel/:chID/remdate",verifyAuthentication,(req,res,next)=>{
  let date = req.query.date
  axios.delete(archive_location+"/manage/dates/"+date).then(()=>{
    res.redirect("/channel/"+req.params.chID)
  })
});



router.post("/channel/posts/addcomment",verifyAuthentication,(req,res,next)=>{

  axios.post(archive_location+"/ingest/newcomment",
  {
    user: req.user.first_name + " " + req.user.last_name,
    announcement: req.query.announcement,
    channel:req.query.channel,
    content:req.body.comment
  
  }).then(()=>{
      res.redirect("/channel/posts/"+req.query.channel+"?post="+req.query.announcement)
  }).catch((err)=>{
  })
});



router.get("/channel/:chID/subscribe",verifyAuthentication,(req,res,next)=>{
  axios.post(archive_location+"/ingest/addsubscription",
  {
    user: req.user.username,
    channel:req.params.chID
  }).then(()=>{res.redirect("back")})
  .catch((err)=>{console.log(err)})
});

router.get("/channel/:chID/unsubscribe",verifyAuthentication,(req,res,next)=>{
  axios.post(archive_location+"/ingest/remsubscription",
  {
    user: req.user.username,
    channel:req.params.chID
  }).then(()=>{res.redirect("back")})
  .catch((err)=>{})
});


router.get("/channel/:chID/addfile", verifyAuthentication, (req, res, next) => {
  res.render("channel/upload_file", {
      user: req.user,
      channel: req.params.chID
  })
});

router.post("/channel/:chID/addfile", verifyAuthentication, upload.single('myFile'), function(req, res) {
  // TODO: meter o channel correto com o routing
  tags = []
  i = 1
  while(true){
    var tag = 'tag' + i
    if (tag in req.body){
      tags.push(req.body[tag])
    }
    else
      break
    i += 1
  }

  var archive = archiver('zip', {zlib: {level: 9}})
  const promise1 = bagit.create_bag(archive, __dirname + '/../' + req.file.path, req.body.filename, __dirname + '/../bagit/bags/')

  Promise.all([promise1])
    .then(([checksum]) => {
      // TODO: then, catch do post
      metadata = {
        file_size: req.file.size,
        publisher: req.user.username,
        file_name: req.body.filename,
        file_type: req.file.mimetype,
        location: checksum,
        checksum: checksum,
        tags: tags
      }
      console.log(metadata)

      file = fs.createReadStream(__dirname + '/../bagit/bags/' + checksum + '.zip')
    
      var form = new FormData()
      form.append('file', file)
      form.append('checksum', metadata.checksum)
      form.append('filename', metadata.file_name)
    
      axios.post(storage_location + '/uploadfile', form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
      })
        .then(response1 => {
            axios.post(archive_location + '/ingest/uploadfile', {
                'channel': req.params.chID,
                'path': req.body.dir,
                'file': metadata
              }
            )
              .then(response2 => { res.redirect('/') })
              .catch(err => { err => console.log(err) })
         })
        .catch(err => { })
    })
    .catch(err => console.log(err))
    // TODO: do something com os erros
});


/// File Routing
router.get("/file/:fileID", verifyAuthentication, (req, res, next) => {
  axios.get(archive_location + '/acess/file/' + req.params.fileID)
    .then((file) => {
      metadata = file.data
      axios.get(storage_location + '/file/' + metadata.location)
        .then((result) => {
          outputBag = __dirname + '/../' + bagFolder + '/' + metadata.checksum + '.zip'
          fs.writeFile(outputBag, result.data, "binary", (err) => {
            if (err) throw err;

            extractionFolder = __dirname + '/../' + bagFolder + '/' + metadata.checksum
            bagit.unpack_bag(outputBag, extractionFolder)
              .then(() => {
                file_to_send = extractionFolder + '/data/' + metadata.checksum
                res.download(file_to_send, metadata.file_name)
              })
              .catch(err => console.log(err))
          });
        })
        .catch((err) => { console.log(err) })
    })
    .catch((err) => { console.log(err) })
}) 

module.exports = router;