var express = require('express');
var fs = require("fs")
var bagit = require('../bagit/bagit')

const storageFolder = 'storage'
const uploadFolder = 'uploads'
const bagFolder = uploadFolder + '/bags'
const multer = require("multer");
const upload = multer({ dest: bagFolder });

var router = express.Router();


router.post("/uploadfile", upload.single('file'), function(req, res){
  console.log('uploading file...')
  console.log(req.body)
  console.log(req.file)

  bagPath = __dirname + '/../' + req.file.path
  mvPath = __dirname + '/../' + storageFolder + '/' + req.body.channel + '/' + req.body.checksum

  // TODO: directory tree
  // TODO: check if dir exists

  // TODO: fazer unpack para uma pasta específica para cada um
  extractionFolder = __dirname + '/../' + uploadFolder + '/' + req.file.filename
  bagit.unpack_bag(bagPath, extractionFolder, req.body.filename, mvPath)

  // TODO: return result
})

//app.get("/file/:filepath", (req,res)=>{
//  res.sendFile("files/"+req.params.filepath)
//})

//app.post("/upload_files", upload.array("files"), uploadFiles);
//function uploadFiles(req, res) {
//    console.log(req.body);
//    res.json({ message: "Successfully uploaded files" });
//}

module.exports = router;