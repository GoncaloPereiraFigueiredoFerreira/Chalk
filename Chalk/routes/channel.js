const express = require('express');
const router = express.Router();
const axios = require("axios")
const verifyAuthentication = require("./utils").verifyAuthentication
let archive_location = process.env.ARCH_SERVER

var FormData = require('form-data');
var archiver = require('archiver')
var bagit = require('../bagit/bagit')
var multer = require('multer')
const uploadFolder = 'uploads'
var upload = multer({ dest: uploadFolder })
var fs = require("fs");

function verifyChannelRole(req,res,next){
    let chn = req.params.chID
    axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username).then(response=>{
      let info = response.data
      if (info.publishers.includes(req.user.username)) info.role="pub"
      else if (info.subscribed) info.role="sub"
      else info.role=""
      req.info = info
      console.log(info)
      next()

    })
}

/////////// Route acessed to all  ///////////

router.get("/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
    let dates=[]
    let ann_titles=[]
    let folders = {}
    let chn = req.params.chID
    if (req.info.role!=""){
        let promises = []
        promises.push(axios.get(archive_location+"/acess/channel/contentTree/"+chn))
        promises.push(axios.get(archive_location+"/acess/posts/channel/"+chn))
        promises.push(axios.get(archive_location+"/acess/dates/channel/"+chn))
        Promise.all(promises).then(results=>{
          folders=JSON.stringify(results[0].data).replaceAll("\"","'")
          ann_titles = results[1].data
          dates = results[2].data
          res.render("channel/index",{
            user:req.user,
            channel:req.info,
            folders:folders,
            titles:ann_titles,
            dates:dates
          })
        })
    }
    else{
      res.render("channel/index",{
        user:req.user,
        channel:req.info,
        folders:folders,
        titles:ann_titles,
        dates:dates
      })
    }
   
});

// Subscribe to a channel
router.get("/:chID/subscribe",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  axios.post(archive_location+"/ingest/addsubscription",
  {
    user: req.user.username,
    channel:req.params.chID
  }).then(()=>{res.redirect("back")})
  .catch((err)=>{console.log(err)})
});



/////////// Routes for Subs and Pubs ///////////////

router.get("/posts/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=> {
  let chn = req.params.chID
  let ann = req.query.post
  let ann_titles = []
  if (req.info.role!=""){
      axios.get(archive_location+"/acess/posts/channel/"+chn).then((resp)=>{
        ann_titles= resp.data
        if (ann!=undefined && ann_titles.length != 0){
          axios.get(archive_location+"/acess/posts/"+ann).then((post)=>{
            res.render("channel/announcements",{user:req.user,channel:req.info,titles:ann_titles,announcement:post.data})
          })
        } 
        else if (ann_titles.length != 0){
          let id = ann_titles[0]._id
          axios.get(archive_location+"/acess/posts/"+id).then((post)=>{
              res.render("channel/announcements",{user:req.user,channel:req.info,titles:ann_titles,announcement:post.data})
          })
        }
        else
          res.render("channel/announcements",{user:req.user,channel:req.info,titles:ann_titles,announcement:{}})
      })  
  }
  else{
      res.sendStatus(401).end()
  }
})

// Add a comment to a post
router.post("/posts/:chID/addcomment",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role!=""){
    axios.post(archive_location+"/ingest/newcomment",
    {
      user: req.user.first_name + " " + req.user.last_name,
      announcement: req.query.announcement,
      channel: req.params.chID,
      content:req.body.comment
    
    }).then(()=>{
        res.redirect("/channel/posts/"+req.params.chID+"?post="+req.query.announcement)
    }).catch((err)=>{
    })
  }
  else{
    res.sendStatus(401).end()
  }
});

/////////// Routes for Pubs ///////////

//Edit channel route
router.get("/settings/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  if (req.info.role=="pub")
    res.render("channel/editchannel",{user:req.user, channel:req.info})
  else{
    res.sendStatus(401).end()
  }
})

//Post channel Edit
router.post("/settings/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  let chn = req.params.chID
  if (req.info.role=="pub"){
    axios.put(archive_location+"/manage/channel/"+chn,req.body).then(()=>{
      res.redirect("/channel/settings/"+chn)
    })
  }
  else{
      res.sendStatus(401).end()
    }
})

// Get student list
router.get("/students/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  let chn = req.params.chID
  if (req.info.role=="pub"){
    axios.get(archive_location+"/acess/channel/studentlist/"+chn).then(result=>{
      res.render("channel/studentslist",{user:req.user, channel:req.info,students:result.data})
    })
  }
  else{
    res.sendStatus(401).end()
  }
})

// Get student submissions
router.get("/submissions/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  let chnID = req.params.chID
  let date = req.query.date 
  if (req.info.role=="pub"){
    axios.get(archive_location+"/acess/dates/channel/del/"+chnID).then(result=>{
      let listDel = result.data
      if (date==undefined && listDel.length>0) date = listDel[0]._id
      if (listDel.length>0){
        axios.get(archive_location+"/acess/dates/channel/"+chnID+"/submissions/"+date).then(response=>{
          res.render("channel/submissions",{user:req.user, deliveries:listDel, channel:req.info,submissions:response.data})
        })
      }
      else{
        res.render("channel/submissions",{user:req.user, deliveries:listDel,channel:req.info,submissions:[]})
      }
    })
  }
  else{
    res.sendStatus(401).end()
  }
})

// Delete Channel
router.get("/delete/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let id = req.params.chID
  if (req.info.role=="pub"){
    axios.delete(archive_location+"/manage/channel/"+id).then((response)=>{
      res.redirect("/")
    })
  }
  else{
    res.sendStatus(401).end()
  }
})

// Form to submit post
router.get("/addpost/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role=="pub"){
    res.render("channel/create_post",{user:req.user,channel:req.info,defaultV:{},edit:false})
  }
  else{
    res.sendStatus(401).end()
  }
});

// Post form
router.post("/addpost/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role=="pub"){
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
  }
  else{
    res.sendStatus(401).end()
  }
});


// Edit Post
router.get("/posts/:chID/edit",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let ann = req.query.post
  if (req.info.role=="pub"){
    axios.get(archive_location+"/acess/posts/"+ann).then((resp2)=>{
      res.render("channel/create_post",{user:req.user,channel:req.info,defaultV:resp2.data,edit:true})
    })  
  }
  else{
    res.sendStatus(401).end()
  }
});

// Post edit form
router.post("/posts/:chID/edit",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let ann = req.query.post
  if (req.info.role=="pub"){
    axios.put(archive_location+"/manage/posts/"+ann,req.body).then(()=>{
      res.redirect("/channel/"+req.params.chID)
    })
  }
  else{
    res.sendStatus(401).end()
  }
});

// Delete Post
router.get("/posts/:chID/delete",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let ann = req.query.post
  if (req.info.role=="pub"){
    axios.delete(archive_location+"/manage/posts/"+ann).then(()=>{
      res.redirect("/channel/"+req.params.chID)
    })
  }
  else{
    res.sendStatus(401).end()
  }
});

// Add new Important Date
router.get("/adddate/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let chn = req.params.chID
  if (req.info.role=="pub"){
      res.render("channel/create_date",{user:req.user,channel:req.info})
  }
  else{
    res.sendStatus(401).end()
  }
});

// Post important date form
router.post("/adddate/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role=="pub"){
    axios.post(archive_location+"/ingest/newdate",
    {
      date:{
        channel: req.params.chID,
        title: req.body.subject,
        description: req.body.description,
        date: req.body.date,
        delivery:req.body.delivery=="on"
      }
    }).then(()=>{
        res.redirect("/channel/"+req.params.chID)
    }).catch((err)=>{
  
    })
  }
  else{
    res.sendStatus(401).end()
  }
});

// Remove Date
router.get("/remdate/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let date = req.query.date
  if (req.info.role=="pub"){
    axios.delete(archive_location+"/manage/dates/"+date).then(()=>{
      res.redirect("/channel/"+req.params.chID)
    })
  }
  else{
    res.sendStatus(401).end()
  }
});

/////////// Routes for Subs //////////////

router.get("/:chID/submitForm/:submit",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role == "sub"){
    res.render("channel/submit_work",{user:req.user,channel:req.info,delivery:req.params.submit})
  }
  else{
    res.sendStatus(401).end()
  }

});


router.post("/:chID/submitForm/:submit",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let chn = req.params.chID
  let subm = req.params.submit
  if (req.info.role == "sub"){
    //TODO: finish up
    axios.post(archive_location+"/submitfile",{channel:chn,submission:subm}).then((resp)=>{
      res.redirect("/")
    })
  }
  else{
    res.sendStatus(401).end()
  }
});

// Unsubscribe from channel
router.get("/:chID/unsubscribe",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role == "sub"){
    axios.post(archive_location+"/ingest/remsubscription",
    {
      user: req.user.username,
      channel:req.params.chID
    }).then(()=>{res.redirect("/")})
    .catch((err)=>{})
  }
  else{
      res.sendStatus(401).end()
    }
});

///////////////////////////////////////////

//// File Management


router.get("/:chID/addfile", verifyAuthentication,verifyChannelRole, (req, res, next) => {
  if (req.info.role == "pub"){
    res.render("channel/upload_file", {
        user: req.user,
        channel: req.params.chID
    })
  }
  else{
    res.sendStatus(401).end()
  }
});

router.post("/:chID/addfile", verifyAuthentication,verifyChannelRole, upload.single('myFile'), function(req, res) {
  if (req.info.role == "pub"){
    if ('dir' in req.query){
      let dir = req.query['dir']
      if (dir === '""'){
        dir = ''
      }
      else{
        dir = req.query['dir'].substring(2, req.query['dir'].length - 1)
      }
      let tags = []
      let i = 1
      while(true){
        let tag = 'tag' + i
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
                    'path': dir,
                    'file': metadata
                  }
                )
                  .then(response2 => { res.redirect('/channel/' + req.params.chID) })
                  .catch(err => { err => console.log(err) })
            })
            .catch(err => { })
        })
        .catch(err => console.log(err))
        // TODO: do something com os erros
    }
    else{
        // TODO: do something com os erros
    }
  }  
  else{
    res.sendStatus(401).end()
  }
});

router.get("/:chID/adddir", verifyAuthentication, verifyChannelRole,function(req, res) {
  if (req.info.role == "pub"){
    if ('dir' in req.query){
      res.render("channel/create_dir", {
        user: req.user,
        channel: req.params.chID
      })
    }
  }
  else{
    res.sendStatus(401).end()
  }
});


router.post("/:chID/adddir", verifyAuthentication,verifyChannelRole, function(req, res) {
  if (req.info.role == "pub"){
    if ('dir' in req.query){
      dir = req.query['dir']
      if (dir === '""'){
        dir = '' + req.body.dir
      }
      else{
        dir = req.query['dir'].substring(2, req.query['dir'].length - 1)
        dir = dir + '/' + req.body.dir
      }

      axios.post(archive_location + '/ingest/newdir', {
        channel: req.params.chID,
        path: dir
      })
        .then((result) => { res.redirect('/channel/' + req.params.chID) })
        .catch(err => { 
          //TODO: tratar do erro 
        })
    }
  }
  else{
    res.sendStatus(401).end()
  }
});


module.exports = router