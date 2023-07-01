const fs = require('fs')
var crypto = require('crypto')
var decompress = require('decompress')

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

module.exports.manifest_file = (filename, checksums, files) => {
    var text = ''
    for (let i = 0; i < checksums.length; i++){
        text += `${checksums[i]} ${files[i]}`
        if (i + 1 != checksums.length){
            text += '\n'
        }
    }

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

module.exports.create_bag_files = (archive, locations, new_names, output_dir) => {
    return new Promise((resolve, reject) => {
        let checksums = []
        for (let i = 0; i < locations.length; i++){
            checksums.push(this.checksum_sha256(locations[i]))
        }

        let hash256 = crypto.randomBytes(32).toString('hex');
        this.bag_declaration(output_dir + '/bagit.txt')
        this.manifest_file(output_dir + '/manifest-sha256.txt', checksums, new_names)

        var output = fs.createWriteStream(output_dir + '/' + hash256 + '.zip')
        output.on('close', function () {
            fs.unlink(output_dir + '/bagit.txt', (err) => { if (err) throw err });
            fs.unlink(output_dir + '/manifest-sha256.txt', (err) => { if (err) throw err });

            resolve(hash256);
        });
        archive.pipe(output)
    
        for (let i = 0; i < locations.length; i++){
            archive.file(locations[i], { name: 'data/' + new_names[i] })
        }
        archive.file(output_dir + '/bagit.txt', { name: 'bagit.txt' })
        archive.file(output_dir + '/manifest-sha256.txt', { name: 'manifest-sha256.txt' })
        archive.finalize()
    })
}

module.exports.create_bag = (archive, original_path, new_name, output_dir) => {
    return new Promise((resolve, reject) => {
        var hash256 = this.checksum_sha256(original_path)

        this.bag_declaration(output_dir + '/bagit.txt')
        this.manifest_file(output_dir + '/manifest-sha256.txt',  [hash256], [new_name])
    
        var output = fs.createWriteStream(output_dir + '/' + hash256 + '.zip')
        output.on('close', function () {
            fs.unlink(output_dir + '/bagit.txt', (err) => { if (err) throw err });
            fs.unlink(output_dir + '/manifest-sha256.txt', (err) => { if (err) throw err });

            resolve(hash256);
        });
        archive.pipe(output)
    
        archive.file(original_path, { name: 'data/' + new_name })
        archive.file(output_dir + '/bagit.txt', { name: 'bagit.txt' })
        archive.file(output_dir + '/manifest-sha256.txt', { name: 'manifest-sha256.txt' })
        archive.finalize()
    })
}

module.exports.unpack_bag = (bagPath, extractionFolder) => {
    return decompress(bagPath, extractionFolder)
            .then((files) => {
                return new Promise((resolve, reject) => {
                    fs.unlink(bagPath, (err) => { if (err) throw err });
                    fs.readFile(extractionFolder + '/bagit.txt', 'UTF-8', (err, bag) => {
                        if (err) {
                          console.error(err);
                        }
                        var lines = bag.split('\n')
                        var encoding = lines[1].substring(29, lines[1].length)
                        fs.readFile(extractionFolder + '/manifest-sha256.txt', encoding, (err, manifest) => {
                            if (err) {
                                return err
                            }

                            const lines = manifest.split('\n')
                            let correct = true
                            for(let i in lines){
                                let line = lines[i]
                                var hashOG = line.substring(0, 64)
                                var manifest_filename = line.substring(65, line.length)
                                var hashNew = this.checksum_sha256(extractionFolder + '/data/' + manifest_filename)

                                if (hashNew !== hashOG){
                                    correct = false
                                    break
                                }
                            }

                            if (correct){
                                resolve()
                            }
                            else{
                                reject()
                            }
                        })
                    })
                })
            })
            .catch((error) => {
                throw error
            })
}
