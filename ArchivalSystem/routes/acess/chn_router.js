var express = require('express');
var router = express.Router();
var Channel = require("../../controllers/channel")
var Metadata = require("../../controllers/metadata")



// Path for searching a channel
router.get("/search/:keywords", function(req,res,next){
    let keywords = req.params.channel;
    Channel.searchChannel(keywords).then((result)=>{
      res.status(200).jsonp(result).end()
    })
})

// Informations of channel without content and announcements
router.get("/:channel/info",function(req,res){
    Channel.getChannelInfo(req.params.channel).then((result)=>{
        res.status(200).jsonp(result).end()
  })
})

// im not sure this works
router.get("/:channel/contentTree",function(req,res){
    Channel.getChannelContents(req.params.channel).then((result)=>{
        let tree = {}
        let outer_promisses=[]
        for (let dir of result.contents){
            let promisses = []
            let directories = dir.path.split("/")
            let current_tree=tree
            for (let d of directories){
                if (!(d in current_tree)){
                     current_tree[d] = {type:'dir',files:{}}
                }
                if (current_tree == tree) current_tree = current_tree[d]
                else current_tree = current_tree[d]["files"]
            }
            for (let file of dir.files){
              promisses.push(
                  Metadata.getFileMetadataByID(file).then((result)=>{
                    current_tree[result.file_name] = result
              }))
            }
            outer_promisses.push(Promise.all(promisses).then((results)=>{
                for (let metadata of result){
                    current_tree[metadata.file_name] = metadata
                }
            }))
        }
        Promise.all(outer_promisses).then(()=>res.status(200).jsonp(tree).end()) 
    })
})


// Student list
router.get("/studentlist/:channel",function(req,res){
    Channel.getChannelConsumers(req.params.channel).then((result)=>{
        res.status(200).jsonp(result).end()
    })
})

module.exports = router;