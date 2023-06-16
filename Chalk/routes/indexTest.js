var express = require('express');
var router = express.Router();

var axios = require("axios")

var jwt = require("jsonwebtoken")
var multer = require('multer')
var bagit = require('../bagit/bagit')
var FormData = require('form-data');

const uploadFolder = 'uploads'
var upload = multer({dest: uploadFolder})
var archiver = require('archiver')
var fs = require("fs");
const { channel } = require('diagnostics_channel');

let auth_location = process.env.AUTH_SERVER
let archive_location = process.env.ARCH_SERVER
let storage_location = process.env.STORE_SERVER
let public_key = ""


function verifyAuthentication(req,res,next){
    if (public_key == ""){
      // This should be done differently
      axios.get(auth_location+"/public.pem",(response)=>{
        public_key = response
      })
    }
    let result = jwt.verify(req.token,public_key,{algorithms:["RS512"]})
    console.log(result)
    // req.username = result.username
}

router.get('/', function(req, res, next) {
    res.render('dashboard');
});

//Test route
router.get('/channel/announcements', function(req, res, next) {
    res.render('channel/announcements',{
      channel:{
        title:"RPCW",
        banner:"https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",

      }, 
      titles:[
        {
          title:"Teste Adicionado",
          publisher:"JCR",
          date: "22/03/2001"
      }],
      announcement:{
        title:"Teste Adicionado",
        publisher:"JCR",
        date: "22/03/2001",
        text:"Novo teste foi adicionado aos conteúdos",
        comments:[
          {
            author:"Gonçalo Ferreira",
            date: "22/03/2001",
            text:"Nice!"
          }
        ]
      }

  });
});

//Test route
router.get('/channel', function(req, res, next) {
  let folders = {
    "Teóricas":{
        type:'dir',
        files: {
          'Teste de 2024':{
            type:'file',
            format:'PDF'
          },
          testes2022:{
            type:'dir',
            files:{}
          }
        }
      },
      teste2021:{
        type:'file',
        format:'PDF'
      }
  }
    folders=JSON.stringify(folders).replaceAll("\"","'")

    res.render('channel/index',{
      channel:{
        title:"RPCW",
        banner:"https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",

      }, 
      titles:[
        {
          title:"Teste Adicionado",
          publisher:"JCR",
          date: "22/03/2001"
      }],
      "folders":folders

});
});

router.get("/uploadfile", function(req, res, next) {
  res.render("channel/upload_file",{channel:{
    title:"RPCW",
    banner:"https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",

  }, })
});

router.get("/postAnn", function(req, res, next) {
  res.render("channel/create_post",{channel:{
    title:"RPCW",
    banner:"https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",

  }, })
});


router.get("/channel/postDate", function(req, res, next) {
  res.render("channel/create_date",{channel:{
    title:"RPCW",
    banner:"https://images.unsplash.com/photo-1500964757637-c85e8a162699?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",

  }, })
});


router.get('/dashboard', function(req, res, next) {
    res.redirect('/')
});

router.get('/settings', function(req, res, next) {
    res.render('settings');
});

router.get("/login",(req,res)=>{
    res.render("login")
})

router.get("/register",(req,res)=>{
  res.render("register")
})

treeCache = {}

router.get("/channel/:id", (req,res)=>{
    let channelId = req.params.id
    return Promise.all([
        // Get Channel General Info
        axios.get(archive_location+"/acess/channel/" + channelId + "/info" ),
        // Get Channel Content Tree
        axios.get(archive_location+"/acess/channel/"+ channelId +"/contentTree"),
        // Get Channel Announcements Titles
        axios.get(archive_location+"/acess/ann/titles/channel/" + channelId)
    ]).then((results)=>{
        chn_info = results[0]
        chn_cont = results[1]
        chn_ann  = results[2]

        res.render("channel_index",{"chn_info":chn_info,"chn_cont":chn_cont,"chn_ann":chn_ann})
    })
})

router.post("/uploadfile", upload.single('myFile'), function(req, res) {
  // TODO: meter o channel correto com o routing
  var canal = 'rpcw'

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
  const promise = bagit.create_bag(archive, __dirname + '/../' + req.file.path, req.body.filename, __dirname + '/../bagit/bags/')

  Promise.all([promise])
    .then(([checksum]) => {
      // TODO: publisher
      // TODO: then, catch do post
      metadata = {
        file_size: req.file.size,
        publisher: 'a publisher',
        file_name: req.body.filename,
        file_type: req.file.mimetype,
        location: canal + '/' + checksum,
        checksum: checksum,
        tags: tags
      }
      console.log(metadata)

      file = fs.createReadStream(__dirname + '/../bagit/bags/' + checksum + '.zip')
        //options: {
        //  filename: metadata.location,
        //  contentType: metadata.file_type
        //
      //}
    
      var form = new FormData()
      form.append('file', file)
      form.append('checksum', metadata.checksum)
      form.append('filename', metadata.file_name)
      form.append('channel', canal)
    
      axios.post(storage_location + '/uploadfile', form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
      })
      .then(response => {
    
      })
      .catch(err => {
    
      })
      res.redirect('/')
    })
    .catch(err => console.log(err))

  /*
  axios.post(archive_location + '/ingest/uploadfile', metadata)
       .then(response => {

       })
       .catch(err => {

       })
  */

});



module.exports = router;