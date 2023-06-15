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

router.get("/user/:user",(req,res)=>{
    User.getUserSubscriptions(req.params.user).then(subs=>{
        let promisses = []
        for (let sub of subs){
          promisses.push(Dates.findByChannel(sub._id))
        }
        Promise.all(promisses).then((results)=>{
          let dates = []
          for(let i in subs){
              let date = {}
              date.channel= {name:subs[i].name,_id:subs[i]._id}
              date.dates = results[i]
              dates.push(date)
          }
          res.status(200).jsonp(dates).end()}).catch((err)=>{console.log(err);res.sendStatus(500)})
      })
    })


module.exports = router;