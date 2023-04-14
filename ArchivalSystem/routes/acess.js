var express = require('express');
var router = express.Router();
var Metadata = require("../controllers/metadata")
/*
router.get('/', function(req, res, next) {
  Metadata.addTestMetadata()
    .then(()=> res.sendStatus(200))
    .catch(
        err => {
          console.log(`caught the error: ${err}`);
          return res.sendStatus(500);
      });
});
*/


router.get('/', function(req, res, next) {
  res.sendStatus(200);
});


module.exports = router;