const fs = require('fs');
const strings = require('./strings');
const string = require('./strings');
let readData = async (fileName) => {
    const chunks = [];
    const readStream = fs.createReadStream(fileName, { start: 0, end: 3 });
    let promise = new Promise((resolve, reject) => {
        readStream.on('error', () => {
            reject();
        });
        readStream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        readStream.on('end', () => {
            resolve(Buffer.concat(chunks).toString('utf-8'));
        });
    });
    return promise;
};

let isEncrypted = async (fileName) => {
    let data = await readData(fileName);
    if (data === strings.encryptionTag) {
        return true;
    } else {
        return false;
    }
};

let isKeytarSupported = async () => {
    try {
        await keytar.getPassword(strings.serviceName, strings.accountName);
        return true;
    } catch (err) {
        return false;
    }
};

module.exports = {
    isEncrypted,
    isKeytarSupported,
};
