var express = require('express');
var router = express.Router();
var Dates = require("../../controllers/important_dates")
var User = require("../../controllers/users")

function compareDates(a,b){
  if (a.date.date < b.date.date) return -1; 
  else if (a.date.date > b.date.date) return 1; 
  else return 0
}


router.get("/channel/:chnID",(req,res)=>{
    Dates.findByChannel(req.params.chnID).then(results=>{
        results.sort((a,b)=>{
          if (a.date < b.date) return -1; 
          else if (a.date > b.date) return 1; 
          else return 0
        })
        res.status(200).jsonp(results).end()
    }).catch(err=>{
      console.log(err)
      res.status(500)
    })
})

router.get("/user/:user",(req,res)=>{
    User.getUserSubscriptions(req.params.user).then(subs=>{
        User.getUserPublisher(req.params.user).then(pubs=>{
          let promisses = []
          for (let sub of subs){
            promisses.push(Dates.findByChannel(sub._id))
          }
          for (let pub of pubs){
            promisses.push(Dates.findByChannel(pub._id))
          }
          Promise.all(promisses).then((results)=>{
            let dates = []
            counter = 0
            for(let i in subs){
              for (let date of results[counter]){
                let temp = {}
                temp.channel= {name:subs[i].name,id:subs[i]._id}
                temp.date= date
                dates.push(temp)
              }
              counter++;
            }
            for(let i in pubs){
              for (let date of results[counter]){
                let temp = {}
                temp.channel= {name:pubs[i].name,id:pubs[i]._id}
                temp.date= date
                dates.push(temp)
              }
              counter++;
          }
          dates.sort(compareDates)
          res.status(200).jsonp(dates).end()}).catch((err)=>{console.log(err);res.sendStatus(500)})         
        
        })
      })
})


router.get("/channel/del/:chID",(req,res)=>{
  Dates.findDeliveriesByChannel(req.params.chnID).then(results=>{
    results.sort((a,b)=>{
      if (a.date < b.date) return -1; 
      else if (a.date > b.date) return 1; 
      else return 0
    })
    res.status(200).jsonp(results).end()
}).catch(err=>{
  console.log(err)
  res.status(500)
})
})


router.get("/user/del/:user",(req,res)=>{
  User.getUserSubscriptions(req.params.user).then(subs=>{
      let promisses = []
      for (let sub of subs){
        promisses.push(Dates.findDeliveriesByChannel(sub._id))
      }
      Promise.all(promisses).then((results)=>{
        let dates = []
        counter = 0
        for(let i in subs){
          for (let date of results[counter]){
            let temp = {}
            temp.channel= subs[i].name
            temp.date= date
            dates.push(temp)
          }
          counter++;
        }
        for(let i in pubs){
          for (let date of results[counter]){
            let temp = {}
            temp.channel= pubs[i].name
            temp.date= date
            dates.push(temp)
          }
          counter++;
      }
      dates.sort(compareDates)
      res.status(200).jsonp(dates).end()}).catch((err)=>{console.log(err);res.sendStatus(500)})         
    })

})


router.get("/channel/date/:chID",(req,res)=>{
  Dates.findDatesByChannel(req.params.chnID).then(results=>{
    results.sort((a,b)=>{
      if (a.date < b.date) return -1; 
      else if (a.date > b.date) return 1; 
      else return 0
    })
    res.status(200).jsonp(results).end()
}).catch(err=>{
  console.log(err)
  res.status(500)
})
})


router.get("/user/date/:user",(req,res)=>{
  User.getUserSubscriptions(req.params.user).then(subs=>{
    User.getUserPublisher(req.params.user).then(pubs=>{
      let promisses = []
      for (let sub of subs){
        promisses.push(Dates.findDatesByChannel(sub._id))
      }
      for (let pub of pubs){
        promisses.push(Dates.findDatesByChannel(pub._id))
      }
      Promise.all(promisses).then((results)=>{
        let dates = []
        counter = 0
        for(let i in subs){
          for (let date of results[counter]){
            let temp = {}
            temp.channel= subs[i].name
            temp.date= date
            dates.push(temp)
          }
          counter++;
        }
        for(let i in pubs){
          for (let date of results[counter]){
            let temp = {}
            temp.channel= pubs[i].name
            temp.date= date
            dates.push(temp)
          }
          counter++;
      }
      dates.sort(compareDates)
      res.status(200).jsonp(dates).end()}).catch((err)=>{console.log(err);res.sendStatus(500)})         
    
    })
  })
})


module.exports = router;