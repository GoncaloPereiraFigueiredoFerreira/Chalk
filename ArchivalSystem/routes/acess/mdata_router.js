var express = require('express');
var router = express.Router();
var Metadata = require("../../controllers/metadata")

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