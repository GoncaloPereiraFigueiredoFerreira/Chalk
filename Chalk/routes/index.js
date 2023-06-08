var express = require('express');
var router = express.Router();

var axios = require("axios")

var jwt = require("jsonwebtoken")
var multer = require('multer')
//var bagit = require('../../BagIt/bagit')

const uploadFolder = 'uploads'
var upload = multer({dest: 'uploads'})
var archiver = require('archiver')
var fs = require("fs")
//var decompress = require('decompress')

let auth_location = process.env.AUTH_SERVER
let archive_location = process.env.ARCH_SERVER
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
    res.render('channel_ann',{
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

    res.render('channel_index',{
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



module.exports = router;