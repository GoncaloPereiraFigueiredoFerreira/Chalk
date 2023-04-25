const fs = require('fs')
var crypto = require('crypto')

const version = '1.0'
const encoding = 'UTF-8'

module.exports.bag_declaration = (filename) => {
    var text = `BagIt-Version: ${version}
Tag-File-Character-Encoding: ${encoding}`

    fs.writeFile(filename, text, err => {
        if (err)
            throw err
    });
}

module.exports.manifest_file = (filename, checksum, file) => {
    var text = `${checksum} ${file}`
    
    fs.writeFile(filename, text, err => {
        if (err)
            throw err
    });
}

module.exports.checksum_sha256 = (file) => {
    const hash = crypto.createHash('sha256')
    const fileBuffer = fs.readFileSync(file)
    
    return hash.update(fileBuffer).digest('hex')
}

module.exports.create_bag = (dirname, output_name, archive, req) => {
    var hash256 = this.checksum_sha256(dirname + '/../' + req.file.path)

    this.bag_declaration(dirname + '/bagit.txt')
    this.manifest_file(dirname + '/manifest-sha256.txt', hash256, req.file.originalname)

    var output = fs.createWriteStream(output_name)
    archive.pipe(output)

    archive.file(req.file.path, { name: 'data/' + req.file.originalname })
    archive.file(dirname + '/bagit.txt', { name: 'bagit.txt' })
    archive.file(dirname + '/manifest-sha256.txt', { name: 'manifest-sha256.txt' })
    archive.finalize()
}
