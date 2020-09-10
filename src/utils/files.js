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

const listFileNames = promisify(fs.readdir);

const compressFile = async (filename) => {
    const tempFilename = `${filename}.temp`;

    fs.renameSync(filename, tempFilename);

    try {
        const read = fs.createReadStream(tempFilename);
        const zip = zlib.createGzip();
        const write = fs.createWriteStream(filename);
        read.pipe(zip).pipe(write);

        let promise = new Promise((resolve, reject) => {
            write.on('error', (err) => {
                write.end();
                reject(err);
            });
            write.on('finish', () => {
                resolve();
            });
        });
        return await promise;
    } catch (err) {
        deleteFile(filename);
        throw err;
    } finally {
        deleteFile(tempFilename);
    }
};

const decompressFile = async (filename) => {
    const tempFilename = `${filename}.sql`;
    try {
        const read = fs.createReadStream(filename);
        const unzip = zlib.createGunzip();
        const write = fs.createWriteStream(tempFilename);
        read.pipe(unzip).pipe(write);

        let promise = new Promise((resolve, reject) => {
            write.on('error', (err) => {
                write.end();
                reject(err);
            });
            write.on('finish', () => {
                resolve();
            });
        });
        return await promise;
    } catch (err) {
        deleteFile(tempFilename);
        throw err;
    }
};

module.exports = {
    getCurrentDirectoryBase,
    directoryExists,
    isFile,
    deleteFile,
    compressFile,
    decompressFile,
    listFileNames,
};
