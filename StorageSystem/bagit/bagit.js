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

module.exports.create_bag = (archive, original_path, new_name, output_dir) => {
    return new Promise((resolve, reject) => {
        var hash256 = this.checksum_sha256(original_path)

        this.bag_declaration(output_dir + '/bagit.txt')
        this.manifest_file(output_dir + '/manifest-sha256.txt', hash256, new_name)
    
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

// extrai o bag
// verifica a integridade do bag
// move o que está presente na diretoria para um local específico
module.exports.unpack_bag = (bagPath, extractionFolder, filename, mvPath) => {
    return decompress(bagPath, extractionFolder)
            .then((files) => {
                fileOldPath = extractionFolder + '/data/' + filename

                // get manifest encoding from bagit.txt
                fs.readFile(extractionFolder + '/bagit.txt', 'UTF-8', (err, bag) => {
                    if (err) {
                      console.error(err);
                    }
                    var lines = bag.split('\n')
                    var encoding = lines[1].substring(29, lines[1].length)

                    // comparing checksum values and comparing with the file's checksum
                    fs.readFile(extractionFolder + '/manifest-sha256.txt', encoding, (err, manifest) => {
                        if (err) {
                            return err
                        }
                        var hashOG = manifest.substring(0, 64)
                        var manifest_filename = manifest.substring(65, manifest.length)
                        var hashNew = this.checksum_sha256(extractionFolder + '/data/' + manifest_filename)

                        if (hashNew === hashOG){
                            if (!fs.existsSync(mvPath)) {
                                console.log('file does not exist')
                                fs.rename(fileOldPath, mvPath, () => { })
                            }

                            // TODO: acabar unpacking (i.e. remover os ficheiros)
                            return
                        }
                        else {
                            // TODO: tratar do erro
                        }
                    })
                })
            })
            .catch((error) => {
                throw error
            })
}