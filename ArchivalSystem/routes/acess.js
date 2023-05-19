var express = require('express');
var router = express.Router();
var ann_router = require("./acess/ann_router")
var chn_router = require("./acess/chn_router")
var usr_router = require("./acess/usr_router")


router.use("/ann",ann_router);
router.use("/channel",chn_router);
router.use("/profile",usr_router);


module.exports = router;