const express = require('express');
const router = express.Router();
const axios = require("axios")

let auth_location = process.env.AUTH_SERVER
let archive_location = process.env.ARCH_SERVER

router.get('/', (req, res, next) =>{
  res.render('dashboard');
});

router.get("/channel/posts/:chID", (req, res, next)=> {
  let ann = req.query.post
  let chn = req.params.chID
  let promisses = []
  promisses.push(axios.get(archive_location+"/acess/channel/info/"+chn))
  promisses.push(axios.get(archive_location+"/acess/posts/channel/"+chn))
  Promise.all(promisses).then(results=>{
    let info = results[0].data
    let titles = results[1].data
    if (ann!=undefined){
      axios.get(archive_location+"/acess/posts/"+ann).then((post)=>{
        res.render("channel/announcements",{channel:info,titles:titles,announcement:post.data})
      })
    }
    else if (titles.length != 0){
      let id = titles[0]._id
      axios.get(archive_location+"/acess/posts/"+id).then((post)=>{
          console.log(post.data.comments)
          res.render("channel/announcements",{channel:info,titles:titles,announcement:post.data})
      })
    }
    else
      res.render("channel/announcements",{channel:info,titles:titles,announcement:{}})
  })  
})

router.get("/channel/:chID",(req, res, next)=>{
  let promises = []
  let chn = req.params.chID
  promises.push(axios.get(archive_location+"/acess/channel/info/"+chn))
  promises.push(axios.get(archive_location+"/acess/channel/contentTree/"+chn))
  promises.push(axios.get(archive_location+"/acess/posts/channel/"+chn))
  promises.push(axios.get(archive_location+"/acess/dates/channel/"+chn))
  Promise.all(promises).then(results=>{
    folders=JSON.stringify(results[1].data).replaceAll("\"","'")
    res.render("channel/index",{
      channel:results[0].data,
      folders:folders,
      titles:results[2].data,
      dates:results[3].data
    })
  })
});

router.get("/search/:keywords",(req,res,next)=>{
  axios.get(archive_location+"/acess/channel/search/"+req.params.keywords).then(results=>{
      res.status(200).jsonp(results.data).end()
  })
})


///FORMS
router.get("/channel/:chID/addpost",(req,res,next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn).then((resp)=>{
    res.render("channel/create_post",{channel:resp.data})
  })
});

router.post("/channel/:chID/addpost",(req,res,next)=>{
  axios.post(archive_location+"/ingest/newpost",
  {
    user:"default@need2.change",
    announcement:{
      title:req.body.title,
      content:req.body.content,
      channel:req.params.chID
    }
  
  }).then(()=>{
      res.redirect("/channel/"+req.params.chID)
  }).catch((err)=>{

  })
});

router.get("/channel/:chID/adddate",(req,res,next)=>{
  let chn = req.params.chID
  axios.get(archive_location+"/acess/channel/info/"+chn).then((resp)=>{
    res.render("channel/create_date",{channel:resp.data})
  })
});

router.post("/channel/:chID/adddate",(req,res,next)=>{
    axios.post(archive_location+"/ingest/newdate",
    {
      date:{
        channel: req.params.chID,
        title: req.body.subject,
        description: req.body.description,
        date: req.body.date
      }
    
    }).then(()=>{
        res.redirect("/channel/"+req.params.chID)
    }).catch((err)=>{
  
    })

});

router.post("/channel/posts/addcomment",(req,res,next)=>{

  axios.post(archive_location+"/ingest/newcomment",
  {
    user:"defaultUser@nothing.com",
    announcement: req.query.announcement,
    channel:req.query.channel,
    content:req.body.comment
  
  }).then(()=>{
      res.redirect("/channel/posts/"+req.query.channel+"?post="+req.query.announcement)
  }).catch((err)=>{
  })
});


module.exports = router;