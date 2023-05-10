var express = require('express');
var router = express.Router();
var Channel = require("../../controllers/channel")
var Metadata = require("../../controllers/metadata")


// Path to acess a tree content for a channel
router.get("/content/:channel", function(req,res,next){
    let channel = req.params.channel;
    Channel.getChannelContents(channel).then((contents)=>{
        promisses2 = []
        for(dir in contents){
            files_metadata = []
            promisses= []
            for(file in dir.files){
              promisses.push(
                  Metadata.getFileMetadataByID(file).then((result)=>{
                    files_metadata.push(result)
              }))
          }
          promisses2.push(Promise.all(promises).then(()=>dir.files = files_metadata))  
        }
        Promise.all(promisses2).then(()=>res.status(200).jsonp(contents).end())  
    })
})


// Path for searching a channel
router.get("/search/:keywords", function(req,res,next){
    let keywords = req.params.channel;
    Channel.searchChannel(keywords).then((result)=>{
      res.status(200).jsonp(result).end()
    })
})

// Informations of channel without content and announcements
router.get("/info/:channel",function(req,res){
      Channel.getChannelInfo(req.params.channel).then((result)=>{
          res.status(200).jsonp(result).end()
    })
})


// Student list
router.get("/studentlist/:channel",function(req,res){
    Channel.getChannelConsumers(req.params.channel).then((result)=>{
        res.status(200).jsonp(result).end()
    })
})

module.exports = router;