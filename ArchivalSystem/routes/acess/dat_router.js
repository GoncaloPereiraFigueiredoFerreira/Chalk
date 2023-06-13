var express = require('express');
var router = express.Router();
var Dates = require("../../controllers/important_dates")
var User = require("../../controllers/users")

router.get("/channel/:chnID",(req,res)=>{
    Dates.findByChannel(req.params.chnID).then(results=>{
        res.status(200).jsonp(results).end()
    }).catch(err=>{
      console.log(err)
      res.status(500)
    })
})

router.get("/user/:chnID",(req,res)=>{
    User.getUserSubscriptions().then(results=>{
        let promisses = []
        for (let sub in results.subscribed){
          promisses.push(Dates.findByChannel(sub))
        }
        Promise.all(promisses).then((results)=>{
          let dates = []
          for (let posts of results){
            posts.forEach(p => {
              dates.push(p)
            });}
          res.status(200).jsonp(dates).end()}).catch((err)=>{console.log(err);res.sendStatus(500)})
      })
    })


module.exports = router;