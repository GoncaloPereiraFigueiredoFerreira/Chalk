var express = require('express');
var router = express.Router();
var Metadata = require("../../controllers/metadata")

router.get("/files", function(req, res){
    if ('files' in req.query){
        req.query['files'] = req.query['files'].substring(1, req.query['files'].length - 1)
        const files = req.query['files'].split(";");
        Metadata.getFilesMetadataByID(files)
            .then((result) => { console.log(result); res.status(200).jsonp(result).end() })
            .catch((err) => { res.status(500).jsonp(err).end() })
    }
    else{
        res.sendStatus(400)
    }
})

router.get("/:id", function(req, res){
    Metadata.getFileMetadataByID(req.params.id)
        .then((result) => { res.status(200).jsonp(result).end() })
        .catch((err) => { res.status(500).jsonp(err).end() })
})

router.get("/location/:location", function(req, res){
    Metadata.getFilesByLocation(req.params.location)
        .then((result) => { res.status(200).jsonp(result).end() })
        .catch((err) => { res.status(500).jsonp(err).end() })
})

module.exports = router;