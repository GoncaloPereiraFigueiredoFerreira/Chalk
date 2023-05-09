var express = require('express');
var router = express.Router();

var multer = require('multer')
var bagit = require('../../BagIt/bagit')

const uploadFolder = 'uploads'
var upload = multer({dest: 'uploads'})
var archiver = require('archiver')
var decompress = require('decompress')


router.get('/', function(req, res, next) {
    res.render('dashboard');
});

router.get('/channel/announcements', function(req, res, next) {
    res.render('channel_ad');
});

router.get('/channel', function(req, res, next) {
    res.render('channel_index');
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

module.exports = router;