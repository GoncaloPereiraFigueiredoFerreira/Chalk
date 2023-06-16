var express = require('express');
var router = express.Router();
var ann_router = require("./acess/ann_router")
var chn_router = require("./acess/chn_router")
var usr_router = require("./acess/usr_router")
var dat_router = require("./acess/dat_router")
var mdata_router = require("./acess/mdata_router")


router.use("/posts",ann_router);
router.use("/dates",dat_router);
router.use("/channel",chn_router);
router.use("/profile",usr_router);
router.use("/file",mdata_router);


module.exports = router;