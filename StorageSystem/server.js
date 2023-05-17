let express = require("express")
let multer = require("multer")
let fs = require("fs")
const upload = multer({ dest: "uploads/" });
let app = express()
require("dotenv").config();

// TODO: Maybe compress and decompress files with bag it


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/file/:filepath",(req,res)=>{
  res.sendFile("files/"+req.params.filepath)
})

app.post("/upload_files",upload.array("files"), uploadFiles);


function uploadFiles(req, res) {
    console.log(req.body);
    res.json({ message: "Successfully uploaded files" });
}


app.listen(process.env.PORT, () => {
    console.log(`Storage System started...`);
});



