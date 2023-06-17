var express = require('express');
var router = express.Router();
var Channel = require("../../controllers/channel")
var Metadata = require("../../controllers/metadata")
var User = require("../../controllers/users")
/**
 * Search for a channel
 */
router.get("/search", function(req,res,next){
    let keywords = req.query.keywords;
    Channel.searchChannel(keywords).then((result)=>{
      res.status(200).jsonp(result).end()
    })
})

/**
 *  Channel Information
 */
router.get("/info/:channel",function(req,res){
    let user = req.query.user
      Channel.getChannelInfo(req.params.channel).then((result)=>{
        if (result!=undefined){
        let msg={
          _id:result._id,banner:result.banner,name:result.name,publishers:result.publishers,subscribed:result.consumers.includes(user)
        }
        res.status(200).jsonp(msg).end()}
        else{
          res.status(404).end()
        }
      }) 
})

/**
 *  Channels Content Tree
 */
router.get("/contentTree/:channel",function(req,res){
    Channel.getChannelContents(req.params.channel).then((result)=>{
        let tree = {}
        let outer_promisses=[]
        for (let dir of result.contents){
            let promisses = []
            let directories = dir.path.split("/")
            let current_tree=tree
            
            for (let d of directories){
                if (!(d in current_tree)){
                     current_tree[d] = {type:'dir', files:{}}
                }
                current_tree = current_tree[d]["files"]
            }
            
            for (let file of dir.files){
              promisses.push(
                  Metadata.getFileMetadataByID(file).then((result)=>{
                    current_tree[result.file_name] = {type: 'file', metadata: result}
                    return result
              }))
            }
            outer_promisses.push(Promise.all(promisses))
        }
        Promise.all(outer_promisses).then(()=> { res.status(200).jsonp(tree).end() }) 
    })
})


/**
 *  Channel consumers
 */
router.get("/studentlist/:channel",function(req,res){
    Channel.getChannelConsumers(req.params.channel).then((result)=>{
        let promises=[]
        for (let usr of result.consumers){
          promises.push(User.getUserInfo(usr))
        }
        Promise.all(promises).then(results=>{
          res.status(200).jsonp(results).end()
        })
    })
})

module.exports = router;