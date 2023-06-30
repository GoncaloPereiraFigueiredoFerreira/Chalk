var express = require('express');
var fs = require("fs")
var archiver = require('archiver')
var bagit = require('../bagit/bagit')
require("dotenv").config()
let dirpath = __dirname + '/../' 
if (process.env.STORAGE_FOLDER != undefined && process.env.STORAGE_FOLDER!=""){
  dirpath = process.env.STORAGE_FOLDER
}


const storageFolder = dirpath + 'storage'
const bagFolder = '/bagit/bags/'
const uploadFolder = 'uploads'
const uploadBagFolder = uploadFolder + '/bags'
const multer = require("multer");

const upload = multer({ dest: uploadBagFolder });

var router = express.Router();

router.post("/uploadfile", upload.single('file'), function(req, res){
  if (!fs.existsSync(storageFolder)){
    fs.mkdirSync(storageFolder, { recursive: true });
  }
  if (!fs.existsSync(dirpath + uploadBagFolder)){
    fs.mkdirSync(dirpath + uploadBagFolder, { recursive: true });
  }
  
  let bagPath = __dirname + '/../' + req.file.path
  let extractionFolder = __dirname + '/../' + uploadFolder + '/' + req.file.filename

  const promise = bagit.unpack_bag(bagPath, extractionFolder)
  Promise.all([promise])
          .then(result => { 
            for (let i = 0; i < req.body.nr_files; i++){
              let fileOldPath = extractionFolder + '/data/' + req.body['filename' + i]
              let mvPath = storageFolder + '/' + req.body['checksum' + i]

              if (!fs.existsSync(mvPath)) {
                fs.copyFileSync(fileOldPath, mvPath)
              }
            }
            console.log(extractionFolder)
            fs.rmSync(extractionFolder, { recursive: true, force: true })
            res.sendStatus(200) 
          })
          .catch(err => { console.log(err); res.sendStatus(500) })
})

router.delete("/:location", function(req, res){
  fs.unlink(storageFolder + '/' + req.params.location, (err) => { 
    if (err){ console.log(err); res.sendStatus(500) }
    res.sendStatus(200)
  });
})

router.get('/files', (req, res) => {
  if ('locations' in req.query){
    if (!fs.existsSync(__dirname + '/../' + bagFolder)){
      fs.mkdirSync(__dirname + '/../' + bagFolder, { recursive: true });
    }
    req.query['locations'] = req.query['locations'].substring(1, req.query['locations'].length - 1)
    const locations = req.query['locations'].split(";");

    ogPaths = []
    for (let i = 0; i < locations.length; i++){
      ogPaths.push(storageFolder + '/' + locations[i])
    }

    var archive = archiver('zip', {zlib: {level: 9}})
    const promise = bagit.create_bag_files(archive, ogPaths, locations, __dirname + '/../bagit/bags')
    Promise.all([promise])
      .then(([result]) => {
        console.log(result)
        bagPath = __dirname + '/../bagit/bags/' + result + '.zip'

        if (fs.existsSync(bagPath)) {
          res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment; filename=" + result + '.zip'
          });
          fs.createReadStream(bagPath, {encoding: 'binary'}).pipe(res);
        }
        else
          res.sendStatus(500)
      })
      .catch(err => console.log(err))
  }
  else[
    // TODO: devolver erro
  ]
})

router.get("/file/:filepath", (req, res) => {
  if (!fs.existsSync(__dirname + '/../' + bagFolder)){
    fs.mkdirSync(__dirname + '/../' + bagFolder, { recursive: true });
  }
  ogPath = storageFolder + '/' + req.params.filepath

  var archive = archiver('zip', {zlib: {level: 9}})
  const promise = bagit.create_bag(archive, ogPath, req.params.filepath, __dirname + '/../bagit/bags')
  Promise.all([promise])
    .then(([result]) => {
      bagPath = __dirname + '/../bagit/bags/' + result + '.zip'
      
      if (fs.existsSync(bagPath)) {
        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": "attachment; filename=" + result + '.zip'
        });
        fs.createReadStream(bagPath, {encoding: 'binary'}).pipe(res);
      }
      else
        res.sendStatus(500)
    })
    .catch(err => console.log(err))
})

module.exports = router;