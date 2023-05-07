var express = require('express');
var router = express.Router();


// Path to acess a tree content for a channel
router.get("/content/:channel", function(req,res,next){
    let channel = req.params.channel;
    // 1st Pedir os conteúdos do canal
    // 2nd Substituir os ficheiros por metadados
    // 3rd Criar estrura em árvore
    // 4th Enviar
})


// Path for searching a channel
router.get("/search/:keywords", function(req,res,next){
    let keywords = req.params.channel;
})

// Informations of channel without content
router.get("/info/:channel",function(req,res){

})


// Student list
router.get("/studentlist",function(req,res){

})

module.exports = router;