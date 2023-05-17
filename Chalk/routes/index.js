var express = require('express');
var router = express.Router();

var axios = require("axios")

var multer = require('multer')
//var bagit = require('../../BagIt/bagit')

const uploadFolder = 'uploads'
var upload = multer({dest: 'uploads'})
var archiver = require('archiver')
//var decompress = require('decompress')

let auth_location = process.env.AUTH_SERVER
let archive_location = process.env.ARCH_SERVER

function verifyAuthentication(req,res,next){
    // Get token
    token = ""
    // Make a post request to the authentication request
    axios.post(auth_location+ "/verify/"+token).then((req,res)=>{
      
      // Put the username in the request

      // Put the role in the request
      
      next()
    }).catch(()=>{})
}



router.get('/', function(req, res, next) {
    res.render('dashboard');
});

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

router.get('/channel', function(req, res, next) {
  let folders = {
    "Teóricas":{
        type:'dir',
        name: 'Teóricas',
        files: {
          teste2023:{
            type:'file',
            name:'Teste de 2024',
            format:'PDF'
          },
          testes2022:{
            type:'dir',
            name:'Teste de 2019',
            files:{}
          }
        }
      },
      teste2021:{
        type:'file',
        name:'Teste de 2021',
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

/* 
tmp functions 
router.post('/files', upload.single('myFile'), (req, res) => {
    var archive = archiver('zip', {zlib: {level: 9}})
    bagit.create_bag(__dirname + '/../' + uploadFolder, 'target.zip', archive, req.file.path, req.file.originalname)
    res.redirect('/')
})

router.post('/unpack', (req, res) => {
    bagit.unpack_bag('target.zip', 'target')
    res.redirect('/')
})
*/

router.get("/login",(req,res)=>{
    res.render("login")
})

router.get("/register",(req,res)=>{
  res.render("register")
})

treeCache = {}

router.get("/getChannel/:id", (req,res)=>{
    return Promise.all([
        // Get Channel General Info
        axios.get(archive_location+"/acess/channel/info/:channel"),
        // Get Channel Content Tree
        axios.get(archive_location+"/acess/"),
        // Get Channel Announcements Titles
        axios.get(archive_location+"")
    ]).then((results)=>{
        chn_info = results[0]
        chn_cont = results[1]
        chn_ann  = results[2]

        res.render("channel_ind",{"chn_info":chn_info,"chn_cont":chn_cont,"chn_ann":chn_ann})

    })

})

router.get("/getChannelTree/:id/:node", (req,res)=>{  
})  


module.exports = router;