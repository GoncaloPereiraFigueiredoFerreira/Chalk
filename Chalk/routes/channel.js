const express = require('express');
const router = express.Router();
const axios = require("axios")
const verifyAuthentication = require("./utils").verifyAuthentication
let archive_location = process.env.ARCH_SERVER
let storage_location = process.env.STORE_SERVER
const createHttpError = require('http-errors');
var FormData = require('form-data');
var archiver = require('archiver')
var bagit = require('../bagit/bagit')
var multer = require('multer')
const bagFolder = 'bagit/bags'
const uploadFolder = 'uploads'
const dataFolder = 'data'
var upload = multer({ dest: uploadFolder })
var fs = require("fs");

let max_cache_size = 50
let cache = []

function verifyChannelRole(req,res,next){
    let chn = req.params.chID
    axios.get(archive_location+"/acess/channel/info/"+chn+"?user="+req.user.username).then(response=>{
      let info = response.data
      if (info.publishers.includes(req.user.username)) info.role="pub"
      else if (info.subscribed) info.role="sub"
      else info.role=""
      req.info = info
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
  if (req.info.entry_code==""){
    axios.post(archive_location+"/ingest/addsubscription",
    {
      user: req.user.username,
      channel:req.params.chID
    }).then(()=>{res.redirect("back")})
    .catch((err)=> { console.log(err) })
  }
  else {
    next(createHttpError(403))
  }  

});
  


router.post("/:chID/subscribewec",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.body.entrycode == req.info.entry_code){
    axios.post(archive_location+"/ingest/addsubscription",
    {
      user: req.user.username,
      channel:req.params.chID
    }).then(()=>{res.redirect("back")})
    .catch((err)=>{console.log(err)})

  }
  else{
    res.redirect("/channel/"+req.params.chID)
  }
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
    next(createHttpError(401))
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
    next(createHttpError(401))
  }
});

/////////// Routes for Pubs ///////////

router.get("/addPublisher/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  if (req.info.role=="pub" || req.user.level == "admin")
    res.render("channel/addPublisher",{user:req.user, channel:req.info})
  else{
        next(createHttpError(401))
  }
})


router.post("/addPublisher/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  let chn = req.params.chID
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.post(archive_location+"/manage/channel/addPublisher/"+chn,req.body).then(()=>{
      res.redirect("/channel/addPublisher/"+chn)
    })
  }
  else{
    next(createHttpError(401))
    }
})

//Edit channel route
router.get("/settings/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  if (req.info.role=="pub" || req.user.level == "admin")
    res.render("channel/editchannel",{user:req.user, channel:req.info})
  else{
        next(createHttpError(401))
  }
})

//Post channel Edit
router.post("/settings/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  let chn = req.params.chID
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.put(archive_location+"/manage/channel/"+chn,req.body).then(()=>{
      res.redirect("/channel/settings/"+chn)
    })
  }
  else{
    next(createHttpError(401))
    }
})

// Get student list
router.get("/students/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  let chn = req.params.chID
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.get(archive_location+"/acess/channel/studentlist/"+chn).then(result=>{
      res.render("channel/studentslist",{user:req.user, channel:req.info,students:result.data})
    })
  }
  else{
        next(createHttpError(401))
  }
})

// Get student submissions
router.get("/submissions/:chID",verifyAuthentication,verifyChannelRole,(req, res, next)=>{
  let chnID = req.params.chID
  let date = req.query.date 
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.get(archive_location+"/acess/dates/channel/del/"+chnID).then(result=>{
      let listDel = result.data
      if (date==undefined && listDel.length>0) date = listDel[0]._id
      if (listDel.length>0){
        axios.get(archive_location+"/acess/dates/channel/"+chnID+"/submissions/"+date).then(response=>{
          res.render("channel/submissions",{user:req.user, deliveries:listDel, channel:req.info,submissions:response.data.submissions})
        })
      }
      else{
        res.render("channel/submissions",{user:req.user, deliveries:[], channel:req.info,submissions:{_id:"",submissions:[]}})
      }
    }).catch(err=>{console.log(err);res.sendStatus(500);})
  }
  else{
        next(createHttpError(401))
  }
})

// Delete Channel
router.get("/delete/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let id = req.params.chID
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.delete(archive_location+"/manage/channel/"+id).then((response)=>{
      res.redirect("/")
    })
  }
  else{
        next(createHttpError(401))
  }
})

// Form to submit post
router.get("/addpost/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role=="pub" || req.user.level == "admin"){
    res.render("channel/create_post",{user:req.user,channel:req.info,defaultV:{},edit:false})
  }
  else{
        next(createHttpError(401))
  }
});

// Post form
router.post("/addpost/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role=="pub" || req.user.level == "admin"){
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
        next(createHttpError(401))
  }
});

// Edit Post
router.get("/posts/:chID/edit",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let ann = req.query.post
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.get(archive_location+"/acess/posts/"+ann).then((resp2)=>{
      res.render("channel/create_post",{user:req.user,channel:req.info,defaultV:resp2.data,edit:true})
    })  
  }
  else{
        next(createHttpError(401))
  }
});

// Post edit form
router.post("/posts/:chID/edit",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let ann = req.query.post
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.put(archive_location+"/manage/posts/"+ann,req.body).then(()=>{
      res.redirect("/channel/"+req.params.chID)
    })
  }
  else{
        next(createHttpError(401))
  }
});

// Delete Post
router.get("/posts/:chID/delete",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let ann = req.query.post
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.delete(archive_location+"/manage/posts/"+ann).then(()=>{
      res.redirect("/channel/"+req.params.chID)
    })
  }
  else{
        next(createHttpError(401))
  }
});

// Add new Important Date
router.get("/adddate/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let chn = req.params.chID
  if (req.info.role=="pub" || req.user.level == "admin"){
      res.render("channel/create_date",{user:req.user,channel:req.info})
  }
  else{
        next(createHttpError(401))
  }
});

// Post important date form
router.post("/adddate/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role=="pub" || req.user.level == "admin"){
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
        next(createHttpError(401))
  }
});

// Remove Date
router.get("/remdate/:chID",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  let date = req.query.date
  if (req.info.role=="pub" || req.user.level == "admin"){
    axios.delete(archive_location+"/manage/dates/"+date).then(()=>{
      res.redirect("/channel/"+req.params.chID)
    })
  }
  else{
        next(createHttpError(401))
  }
});

/////////// Routes for Subs //////////////

router.get("/:chID/submitForm/:submit",verifyAuthentication,verifyChannelRole,(req,res,next)=>{
  if (req.info.role == "sub"){
    res.render("channel/submit_work",{user:req.user,channel:req.info,delivery:req.params.submit})
  }
  else{
        next(createHttpError(401))
  }

});


router.post("/:chID/submitForm/:submit",verifyAuthentication,verifyChannelRole,upload.single('myFile'),(req,res,next)=>{
  if (req.info.role == "sub"){
    let chn = req.params.chID
    let subm = req.params.submit
  
    var archive = archiver('zip', {zlib: {level: 9}})
    if (!fs.existsSync(__dirname + '/../' + bagFolder)){
      fs.mkdirSync(__dirname + '/../' + bagFolder, { recursive: true });
    }

    const promise1 = bagit.create_bag(archive, [__dirname + '/../' + req.file.path], [req.body.filename], __dirname + '/../' + bagFolder)
    Promise.all([promise1])
      .then(([result]) => {
        let extension = getExtension(req.file.originalname, req.body.filename)
        metadata = {
          file_size:      req.file.size,
          publisher:      req.user.username,
          file_name:      req.body.filename,
          file_extension: extension,
          file_type:      req.file.mimetype,
          location:       result.bag_name,
          checksum:       result.bag_name,
          tags:           []
        }

        let file = fs.createReadStream(__dirname + '/../' + bagFolder + '/' + result.bag_name + '.zip')
        var form = new FormData()
        form.append('file', file)
        form.append('nr_files', 1)
        form.append('checksum0', metadata.checksum)
        form.append('filename0', metadata.file_name)
      
        axios.post(storage_location + '/uploadfile', form, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
        })
        .then(response1 => {
          fs.unlink(__dirname + '/../' + bagFolder + '/' + result.bag_name + '.zip', (err) => { if (err) throw err });
          axios.post(archive_location+"/ingest/submitfile", {
            channel: chn,
            submission:subm,
            user: req.user.username,
            description: req.body.description,
            file: metadata
          })
            .then((resp)=>{
              res.redirect('/channel/' + req.params.chID)
            })
            .catch(err => { res.sendStatus(400).end() })
        })
        .catch(err => { })
    })
    .catch(err => { res.sendStatus(400).end() })
  }
  else{
        next(createHttpError(401))
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
    next(createHttpError(401))
    }
});

///////////////////////////////////////////

//// File Management


router.get("/:chID/addfile", verifyAuthentication,verifyChannelRole, (req, res, next) => {
  if (req.info.role == "pub"){
    if (!fs.existsSync(uploadFolder)){
      fs.mkdirSync(uploadFolder, { recursive: true });
    }
   
    res.render("channel/upload_file", {
      user: req.user,
      channel: req.info,
    })
    
  }
  else{
        next(createHttpError(401))
  }
});

router.post("/:chID/addfile", verifyAuthentication,verifyChannelRole, upload.array('myFiles'), function(req, res) {
  if (req.info.role == "pub"){
    if ('dir' in req.query){
      let dir = req.query['dir']
      if (dir === '""'){
        dir = ''
      }
      else{
        dir = req.query['dir'].substring(2, req.query['dir'].length - 1)
      }

      let tags = getTags(req.files.length, req.body)
      var archive = archiver('zip', {zlib: {level: 9}})
      if (!fs.existsSync(__dirname + '/../' + bagFolder)){
        fs.mkdirSync(__dirname + '/../' + bagFolder, { recursive: true });
      }

      OGpaths = []
      NEWpaths = []
      for (let i = 0; i < req.files.length; i++){
        let file = req.files[i]
        OGpaths.push(__dirname + '/../' + file.path)
        NEWpaths.push(req.body['filename' + i])
      }

      const promise1 = bagit.create_bag(archive, OGpaths, NEWpaths, __dirname + '/../' + bagFolder)
      const promise2 = axios.get(archive_location + '/acess/channel/contentTree/' + req.params.chID)
      
      Promise.all([promise1, promise2])
        .then(([bag_result, channel_contents]) => {
          if (!filesExistsInDir(channel_contents.data, dir, NEWpaths)){
            let files_metadata = []
            for (let i = 0; i < req.files.length; i++){
              let file = req.files[i]
              let extension = getExtension(file.originalname, req.body['filename' + i])
              let metadata = {
                file_size:      file.size,
                publisher:      req.user.username,
                file_name:      req.body['filename' + i],
                file_extension: extension,
                file_type:      file.mimetype,
                location:       bag_result.checksums[i],
                checksum:       bag_result.checksums[i],
                tags:           tags[i]
              }
              files_metadata.push(metadata)
            }

            
            let file = fs.createReadStream(__dirname + '/../' + bagFolder + '/' + bag_result.bag_name + '.zip')
            var form = new FormData()
            form.append('file', file)
            form.append('nr_files', req.files.length)
            for (let i = 0; i < req.files.length; i++){
              form.append('checksum' + i, bag_result.checksums[i])
            }
            for (let i = 0; i < req.files.length; i++){
              form.append('filename' + i, req.body['filename' + i])
            }
          
            axios.post(storage_location + '/uploadfile', form, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
            })
            .then(response1 => {
                fs.unlink(__dirname + '/../' + bagFolder + '/' + bag_result.bag_name + '.zip', (err) => { if (err) throw err });
                let promises = []
                for (let i = 0; i < req.files.length; i++){
                  promises.push(
                    axios.post(archive_location + '/ingest/uploadfile', {
                        'channel': req.params.chID,
                        'path': dir,
                        'file': files_metadata[i]
                      }
                    )
                  )
                }

                Promise.all(promises)
                  .then(response2 => {
                    automaticPost(req.params.chID, req.body, req.user)
                    res.redirect('/channel/' + req.params.chID) 
                  })
                  .catch(err => { err => 
                    // TODO: dar erro concreto
                    console.log(err) 
                  })
            })
            .catch(err => {
              // TODO: dar erro concreto
            })
          }
          else{
            // TODO: dar erro concreto
            res.sendStatus(400)
          }
        })
        .catch(err => console.log(err))
        // TODO: do something com os erros
    }
    else{
        // TODO: do something com os erros
    }
  }  
  else{
        next(createHttpError(401))
  }
});

getTags = (nrFiles, body) => {
  let tags = {}

  for(let i = 0; i < nrFiles; i++){
    tags[i] = []
    let tagFile = 'tag_' + i + '_'

    let j = 0
    let tagID = tagFile + j
    while(tagID in body){
      tags[i].push(body[tagID])
      j += 1
      tagID = tagFile + j
    }
  }

  return tags
}

filesExistsInDir = (contentTree, dir, filenames) => {
  let content = getDirContents(contentTree, dir)
  let result = false

  for (let i in filenames){
    let name = filenames[i]
    if (name in content){
      result = true
      break
    }
  }

  return result
}

getExtension = (original_name, new_name) => {
  let res = '';
  
  OGext = original_name.split('.').pop()
  if (OGext === original_name){
    NEWext = new_name.split('.').pop()
    if (NEWext !== new_name)
      res = NEWext
  }
  else
    res = OGext

  return res
}

automaticPost = (chID, body, user) => {
  if ('automatic' in body){
    let content = body.content
    if (content === ''){ content = 'New file has been added to this channel!' }

    let title = body.title
    if (title === ''){ title = 'New file!' }

    let username = user.first_name + ' ' + user.last_name

    axios.post(archive_location + '/ingest/newpost', {
      user: username,
      announcement: {
        title: title,
        content: content,
        channel: chID
      }
    })
    .catch(err => { console.log(err) })
  }
}

router.get("/:chID/rmfile/:fileID", verifyAuthentication, (req, res, next) => {
  axios.get(archive_location + '/acess/file/' + req.params.fileID)
    .then((res1) => {
      metadata = res1.data

      let dir = ''
      if ('dir' in req.query){
        dir = req.query['dir']
        if (dir === '""'){ dir = '' }
        else{ dir = req.query['dir'].substring(2, req.query['dir'].length - 1) }
      }

      axios.delete(archive_location + '/ingest/rmfile/'+req.params.fileID)
        .then((res2) => {

          axios.put(archive_location + '/ingest/rmfile/'+req.params.fileID, {
              'channel': req.params.chID,
              'path': dir,
            }
          )
            .then((res3) => {
              axios.get(archive_location + '/acess/file/location/' + metadata.location)
                .then((res4) => { 
                  files = res4.data
                  if (files.length == 0){
                    axios.delete(storage_location + '/' + metadata.location)
                      .then((res5) => {
                        res.redirect('back')
                      })
                      .catch(err => { console.log(err); })
                  }
                  else
                    res.redirect('back')
                })
                .catch(err => { console.log(err); })
            })
        })
        .catch(err => { console.log(err) })
    })
    .catch(err => { console.log(err); })
})

router.get("/:chID/adddir", verifyAuthentication, verifyChannelRole,function(req, res) {
  if (req.info.role == "pub"){
    if ('dir' in req.query){
      res.render("channel/create_dir", {
        user: req.user,
        channel: req.info
      })
    }
  }
  else{
        next(createHttpError(401))
  }
});


router.post("/:chID/adddir", verifyAuthentication,verifyChannelRole, function(req, res) {
  if (req.info.role == "pub"){
    if ('dir' in req.query){
      let dir = req.query['dir']
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
        next(createHttpError(401))
  }
});

router.get("/:chID/rmdir", verifyAuthentication,verifyChannelRole, function(req, res) {
  if (req.info.role == "pub"){
    if ('context' in req.query && 'dir' in req.query){
      let context = req.query['context']
      let dir = req.query['dir'].substring(1, req.query['dir'].length - 1)

      if (context === '""'){
        context = '' + dir
      }
      else{
        context = req.query['context'].substring(2, req.query['context'].length - 1)
        context = context + '/' + dir
      }

      axios.get(archive_location + '/acess/channel/contentTree/' + req.params.chID)
        .then((res1) => {
          removeContents(res1.data, req.params.chID, context)

          axios.delete(archive_location + '/ingest/rmdir/' + req.params.chID + '?dir=\"' + context + '\"')
            .then((res2) => {
              res.redirect('back')
            })
            .catch(err => { 
              //TODO: tratar do erro 
              console.log(err)
            })
        })
        .catch(err => { 
          //TODO: tratar do erro 
          console.log(err)
        })
    }
  }
  else{
    next(createHttpError(401))
  }
});

removeContents = (contentTree, chID, context) => {
  let dirContents = ''
  dirContents = getDirContents(contentTree, context)

  for (let key in dirContents){
    let elem = dirContents[key]
    if (elem.type === 'dir'){
      removeDir(contentTree, chID, context, key)
    }
    else if (elem.type === 'file'){
      removeFile(elem)
    }
  }
}

removeDir = (contentTree, chID, context, dir) => {
  let insideContext = context + '/' + dir
  let dirContents = getDirContents(contentTree, insideContext)
  removeContents(contentTree, chID, insideContext)

  axios.delete(archive_location + '/ingest/rmdir/' + chID + '?dir=\"' + insideContext + '\"')
    .catch(err => { 
      //TODO: tratar do erro 
      console.log(err)
    })
}

removeFile = (elem) => {
  axios.delete(archive_location + '/ingest/rmfile/' + elem.metadata._id)
    .catch(err => { 
      //TODO: tratar do erro 
      console.log(err)
      //next(createHttpError(401))
    })

  axios.get(archive_location + '/acess/file/location/' + elem.metadata.location)
    .then((res3) => { 
      files = res3.data
      if (files.length == 0){
        axios.delete(storage_location + '/' + elem.metadata.location)
          .catch(err => { console.log(err); })
      }
    })
    .catch(err => { console.log(err); })
}

getDirContents = (contentTree, dir) => {
  const path = dir.split("/")

  let tmpTree = ''
  tmpTree = contentTree[path[0]]
  for (let i=1; i < path.length; i++){
    tmpTree = tmpTree.files[path[i]]
  }

  return tmpTree.files
}

router.get('/:chID/files', verifyAuthentication, verifyChannelRole, function(req, res) {
  if ('files' in req.query){
    req.query['files'] = req.query['files'].substring(1, req.query['files'].length - 1)
    const files = req.query['files'].split(";");
    if (files.length == 1 && files[0] === ''){
      res.redirect('back')
    }
    else{
      axios.get(archive_location + '/acess/file/files?files=\"' + req.query['files'] + "\"")
        .then((files) => {
          files = files.data
          let new_names = {}
          let files_in_cache = []
          let files_to_request = []

          for (let i in files){
            let file = files[i]
            let cache_check = isFileInCache(file.checksum)
            if (cache_check != -1){
              files_in_cache.push(cache_check)
            }
            else{
              files_to_request.push(file)
            }
            new_names[file.location] = file.file_name
          }

          let locations = ""
          for (let i in files_to_request){
            if (i != 0){
              locations += ';' + files_to_request[i].location
            }
            else{
              locations = files_to_request[i].location
            }
          }

          if (locations !== ''){
            axios.get(storage_location + '/files?locations=\"' + locations + "\"")
              .then((result) => {
                let file_name = result.headers['content-disposition']
                let zip_name = file_name.substring(21, file_name.length)
                file_name = file_name.substring(21, file_name.length - 4)

                if (!fs.existsSync(__dirname + '/../' + bagFolder)){
                  fs.mkdirSync(__dirname + '/../' + bagFolder, { recursive: true });
                }
                if (!fs.existsSync(__dirname + '/../' + dataFolder)){
                  fs.mkdirSync(__dirname + '/../' + dataFolder, { recursive: true });
                }
                let outputBag = __dirname + '/../' + bagFolder + '/' + zip_name

                fs.writeFile(outputBag, result.data, "binary", (err) => {
                  if (err) throw err;
                
                  let extractionFolder = __dirname + '/../' + bagFolder + '/' + file_name
                  bagit.unpack_bag(outputBag, extractionFolder)
                    .then(() => {
                      send_data_bag(res, file_name, new_names, files_in_cache, outputBag, extractionFolder)
                    })
                    .catch(err => console.log(err))
                });
              })
              .catch((err) => { console.log(err) })
          }
          else{
            send_data_bag(res, '', new_names, files_in_cache, '', '')
          }
        })
        .catch((err) => { console.log(err) })
    }
  }
  else{
    // TODO: erro
  }
})

send_data_bag = (res, file_name, new_names, files_in_cache, outputBag, extractionFolder) => {
  let archive = archiver('zip', {zlib: {level: 9}})
  let cache_checksums = []
  let cache_names = []
  let cache_under = []
    
  var output = fs.createWriteStream(__dirname + '/../' + bagFolder + '/' + file_name + '_data.zip')
  output.on('close', function() {
    res.download(__dirname + '/../' + bagFolder + '/' + file_name + '_data.zip', 'data.zip')
    if (outputBag !== ''){
      fs.unlink(outputBag, (err) => { if (err) throw err })
    }
    if (extractionFolder !== ''){
      fs.rmSync(extractionFolder, { recursive: true, force: true })
    }
    let bags_remaining = fs.readdirSync(__dirname + '/../' + bagFolder);
    for (let i in bags_remaining){
      let tmp_bag = bags_remaining[i]
      if (tmp_bag !== file_name + '_data.zip'){
        let extension = tmp_bag.substring(tmp_bag.length - 4, tmp_bag.length)
        if (extension === '.zip')
          fs.unlink(__dirname + '/../' + bagFolder + '/' + tmp_bag, (err) => { if (err) throw err })
        else
          fs.rmSync(__dirname + '/../' + bagFolder + '/' + tmp_bag, { recursive: true, force: true })
      }
    }

    manage_cache(cache_checksums, cache_names, cache_under)
  })

  archive.pipe(output)
  if (extractionFolder !== ''){
    let files_to_send = fs.readdirSync(extractionFolder + '/data/');
    for (let i in files_to_send){
      archive.file(extractionFolder + '/data/' + files_to_send[i], { name: new_names[files_to_send[i]] })
      fs.copyFileSync(extractionFolder + '/data/' + files_to_send[i], dataFolder + '/' + files_to_send[i])
      cache_checksums.push(files_to_send[i])
      cache_names.push(new_names[files_to_send[i]])
      cache_under.push('checksum')
    }
  }
  for (let i in files_in_cache){
    let cache_file = files_in_cache[i]
    archive.file(__dirname + '/../' + dataFolder + '/' + cache_file[cache_file.under], { name: new_names[cache_file.checksum] })
    cache_checksums.push(cache_file.checksum)
    cache_names.push(cache_file.file_name)
    cache_under.push(cache_file.under)
  }
  archive.finalize()
}

/// File Routing
router.get("/:chID/file/download/:fileID", verifyAuthentication, (req, res, next) => {
  axios.get(archive_location + '/acess/file/' + req.params.fileID)
    .then((file) => {
      let metadata = file.data

      let cache_check = isFileInCache(metadata.checksum)
      if (cache_check != -1){
        let file_under = cache_check[cache_check.under]
        res.download(dataFolder + '/' + file_under, metadata.file_name)
        manage_cache([metadata.checksum], [metadata.file_name], [cache_check.under])
      }
      else{
        axios.get(storage_location + '/file/' + metadata.location)
          .then((result) => {
            let outputBag = __dirname + '/../' + bagFolder + '/' + metadata.checksum + '.zip'
            if (!fs.existsSync(__dirname + '/../' + bagFolder)){
              fs.mkdirSync(__dirname + '/../' + bagFolder, { recursive: true });
            }
            if (!fs.existsSync(__dirname + '/../' + dataFolder)){
              fs.mkdirSync(__dirname + '/../' + dataFolder, { recursive: true });
            }

            fs.writeFile(outputBag, result.data, "binary", (err) => {
              if (err) throw err;

              extractionFolder = __dirname + '/../' + bagFolder + '/' + metadata.checksum
              bagit.unpack_bag(outputBag, extractionFolder)
                .then(() => {
                  fs.copyFileSync(extractionFolder + '/data/' + metadata.checksum, dataFolder + '/' + metadata.checksum)
                  res.download(dataFolder + '/' + metadata.checksum, metadata.file_name)

                  manage_cache([metadata.checksum], [metadata.file_name], ['checksum'])
                  fs.unlink(outputBag, (err) => { if (err) throw err })
                  fs.rmSync(extractionFolder, { recursive: true, force: true })
                })
                .catch(err => console.log(err))
            });
          })
          .catch((err) => { console.log(err) })
      }
    })
    .catch((err) => { console.log(err) })
}) 

isFileInCache = (file_checksum) => {
  let res = -1

  for (let i in cache){
    if (file_checksum === cache[i].checksum){
      res = cache[i]
      break
    }
  }

  return res
}

manage_cache = (checksums, new_names, denominations) => {
  for (let i in checksums){
    let insert
    if (denominations[i] !== 'not_new'){
      insert = {
        checksum: checksums[i],
        file_name: new_names[i],
        under: denominations[i]
      }
    }
    else{
      insert = isFileInCache(checksums[i])
    }
    cache.push(insert)
  }

  let files_to_remove = cache.length - max_cache_size
  for (let i = 0; i < files_to_remove; i++){
    let removed = cache.shift()
    let cache_check = isFileInCache(removed.checksum)
    if (cache_check == -1 || removed[removed.under] !== cache_check[cache_check.under]){
      fs.unlink(__dirname + '/../' + dataFolder + '/' + removed[removed.under], (err) => { if (err) throw err })
    }
  }
}

router.get('/:chID/file/:fileID', verifyAuthentication, verifyChannelRole, function(req, res) {
  axios.get(archive_location + '/acess/file/' + req.params.fileID)
    .then((file) => {
      let metadata = file.data
      let cache_check = isFileInCache(metadata.checksum)
      if (cache_check != -1){
        let file_under = cache_check[cache_check.under]
        if (cache_check.under === 'checksum'){
          fs.copyFileSync(dataFolder + '/' + file_under, dataFolder + '/' + metadata.file_name)
          res.redirect('/' + metadata.file_name)
        }
        else{
          res.redirect('/' + file_under)
        }

        manage_cache([metadata.checksum], [metadata.file_name], ['file_name'])
      }
      else{
        axios.get(storage_location + '/file/' + metadata.location)
          .then((result) => {
            let outputBag = __dirname + '/../' + bagFolder + '/' + metadata.checksum + '.zip'
            if (!fs.existsSync(__dirname + '/../' + bagFolder)){
              fs.mkdirSync(__dirname + '/../' + bagFolder, { recursive: true });
            }
            if (!fs.existsSync(__dirname + '/../' + dataFolder)){
              fs.mkdirSync(__dirname + '/../' + dataFolder, { recursive: true });
            }

            fs.writeFile(outputBag, result.data, "binary", (err) => {
              if (err) throw err;
              let extractionFolder = bagFolder + '/' + metadata.checksum
              bagit.unpack_bag(outputBag, extractionFolder)
                .then(() => {
                  //copia do ficheiro para o verdadeiro nome dele
                  fs.copyFileSync(extractionFolder + '/data/' + metadata.checksum, dataFolder + '/' + metadata.file_name)
                  fs.copyFileSync(extractionFolder + '/data/' + metadata.checksum, dataFolder + '/' + metadata.file_name)
                  res.redirect('/' + metadata.file_name)

                  manage_cache([metadata.checksum], [metadata.file_name], ['file_name'])
                  fs.unlink(outputBag, (err) => { if (err) throw err })
                  fs.rmSync(extractionFolder, { recursive: true, force: true })
                })
                .catch(err => console.log(err))
            });
          })
          .catch((err) => { console.log(err) })
      }
    })
    .catch((err) => { console.log(err) })
})

module.exports = router