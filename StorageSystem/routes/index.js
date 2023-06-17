var express = require('express');
var fs = require("fs")
var archiver = require('archiver')
var bagit = require('../bagit/bagit')

const storageFolder = 'storage'
const uploadFolder = 'uploads'
const bagFolder = uploadFolder + '/bags'
const multer = require("multer");
const upload = multer({ dest: bagFolder });

var router = express.Router();

router.post("/uploadfile", upload.single('file'), function(req, res){
  bagPath = __dirname + '/../' + req.file.path
  mvPath = __dirname + '/../' + storageFolder + '/' + req.body.checksum

  // TODO: directory tree
  // TODO: check if dir exists
  extractionFolder = __dirname + '/../' + uploadFolder + '/' + req.file.filename
  bagit.unpack_bag(bagPath, extractionFolder, req.body.filename, mvPath)
          .then(() => { res.sendStatus(200) })
          .catch(err => { console.log(err); res.sendStatus(500) })
})

router.get("/file/:filepath", (req, res) => {
  ogPath = __dirname + '/../' + storageFolder + '/' + req.params.filepath

  var archive = archiver('zip', {zlib: {level: 9}})
  const promise = bagit.create_bag(archive, ogPath, req.params.filepath, __dirname + '/../bagit/bags/')
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