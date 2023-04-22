var express = require('express');
var router = express.Router();

var multer = require('multer')
var bagit = require('../../BagIt/bagit')

var upload = multer({dest: 'uploads'})

const uploadFolder = 'uploads'


//var fs = require('fs')
var archiver = require('archiver')

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('channel');
});

router.post('/files', upload.single('myFile'), (req, res) => {
    var archive = archiver('zip', {zlib: {level: 9}})
    bagit.create_bag(__dirname + '/../' + uploadFolder, 'target.zip', archive, req)
    res.redirect('/')
})

module.exports = router;