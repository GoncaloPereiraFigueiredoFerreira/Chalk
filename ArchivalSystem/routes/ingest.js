var express = require('express');
var router = express.Router();

router.post("/uploadfile", function(req,res){

})

router.post("/newpost",function(req,res){
/**
 * newpost : POST
 * req.body:{
 *     publisher,
 *     channelID,
 *     title,
 *     content, 
 * }
 */

})

router.post("/newcomment",function(req,res){
/**
 * newpost : POST
 * req.body:{
 *     userID,
 *     announcementID
 *     content, 
 * }
 */

})

router.post("/newchannel",function(req,res){
/**
 * newpost : POST
 * req.body:{
 *     name,
 *     banner,
 * }
 */
})

router.post("/newaccount",function(req,res){

})

router.post("/addsubscription",function(req,res){
/**
 * newpost : POST
 * req.body:{
 *     userID,
 *     channelID,
 * }
 */
})

router.post("/remsubscription",function(req,res){
/**
 * newpost : POST
 * req.body:{
 *     userID,
 *     channelID,
 * }
 */
})


module.exports = router;