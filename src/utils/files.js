const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const zlib = require('zlib');
const crypto = require('crypto');
const strings = require('./strings');
const AppendInitVect = require('./appendInitVector');

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

let encrypt = async (filePath, key) => {
    const tempFileName = `${filePath}.temp`;
    try {
        fs.renameSync(filePath, tempFileName);
        const initVect = crypto.randomBytes(16);
        const encryptionFlag = Buffer.from(strings.encryptionTag, 'utf-8');
        const bufferArr = [encryptionFlag, initVect];
        const CIPHER_KEY = crypto.createHash('sha256').update(key).digest();
        const readStream = fs.createReadStream(tempFileName);
        const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);
        const salt = Buffer.concat(bufferArr);
        const appendInitVect = new AppendInitVect(salt);
        const writeStream = fs.createWriteStream(filePath);
        readStream.pipe(cipher).pipe(appendInitVect).pipe(writeStream);
        let promise = new Promise((resolve, reject) => {
            writeStream.on('error', (err) => {
                writeStream.end();
                reject(err);
            });
            writeStream.on('finish', () => {
                resolve();
            });
        });
        return await promise;
    } catch (err) {
        deleteFile(filePath);
        console.log('Encryption Failed.');
        throw err;
    } finally {
        deleteFile(tempFileName);
    }
};

let decrypt = async (fileName, key) => {
    try {
        const readInitVect = fs.createReadStream(fileName, {start: 4, end: 19});
        let initVect;
        readInitVect.on('data', (chunk) => {
            initVect = chunk;
        });
        let beginDecryption = new Promise((resolve, reject) => {
            readInitVect.on('close', () => {
                resolve();
            });
            readInitVect.on('error', () => {
                reject();
            });
        });
        await beginDecryption;
        const cipherKey = crypto.createHash('sha256').update(key).digest();
        const readStream = fs.createReadStream(fileName, {start: 20});
        const decipher = crypto.createDecipheriv('aes256', cipherKey, initVect);
        const writeStream = fs.createWriteStream(fileName + '_unenc');

        readStream.pipe(decipher).pipe(writeStream);
        let promise = new Promise((resolve, reject) => {
            writeStream.on('error', (err) => {
                writeStream.end();
                reject(err);
            });
            writeStream.on('finish', () => {
                resolve();
            });
        });
        return await promise;
    } catch (err) {
        console.log('Decryption Failed.');
        deleteFile(`${fileName}_unenc`);
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
    encrypt,
    decrypt,
};
