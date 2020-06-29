const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const zlib = require('zlib');

const getCurrentDirectoryBase = () => {
    return path.basename(process.cwd());
};

const directoryExists = (filePath) => {
    return fs.existsSync(filePath);
};

const isFile = (filePath) => {
    return fs.lstatSync(filePath).isFile();
};

const deleteFile = (filePath) => {
    const deleteFileAsync = promisify(fs.unlink);
    return deleteFileAsync(filePath);
};

const compressFile = (filename) => {
    const tempFilename = `${filename}.temp`;

    fs.renameSync(filename, tempFilename);

    try {
        const read = fs.createReadStream(tempFilename);
        const zip = zlib.createGzip();
        const write = fs.createWriteStream(filename);
        read.pipe(zip).pipe(write);

        return new Promise((resolve, reject) => {
            write.on('error', (err) => {
                write.end();
                reject(err);
            });
            write.on('finish', () => {
                resolve();
            });
        });
    } catch (err) {
        deleteFile(filename);
        throw err;
    } finally {
        deleteFile(tempFilename);
    }
};

module.exports = {
    getCurrentDirectoryBase,
    directoryExists,
    isFile,
    deleteFile,
    compressFile,
};
