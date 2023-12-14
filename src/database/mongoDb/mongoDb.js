const mongoose = require('mongoose');
const mongoUriBuilder = require('./mongoUriBuilder');
const exec = require('./../../utils/await-exec');
const isGzip = require('./../../utils/isGzip');
const path = require('path');
const files = require('../../utils/files');
const encryptionCheck = require('../../utils/isEncrypted');

let connect = async (dbConfig) => {
    let connectionUri = mongoUriBuilder({
        username: dbConfig.dbAuthUser,
        password: dbConfig.dbAuthPwd,
        host: dbConfig.dbHost,
        port: dbConfig.dbPort,
        database: dbConfig.dbName,
        options: {
            authSource: dbConfig.dbAuthSource,
        },
    });
    let connRes = await mongoose.connect(connectionUri, { useNewUrlParser: true, useUnifiedTopology: true });
    let disConnRes = await mongoose.connection.close();
    return connRes;
};

let dump = async (dbConfig, key, backupPath) => {
    let mongoDumpCmd;
    let connectionUri = mongoUriBuilder({
        username: dbConfig.dbAuthUser,
        password: dbConfig.dbAuthPwd,
        host: dbConfig.dbHost,
        port: dbConfig.dbPort,
        database: dbConfig.dbName,
        options: {
            authSource: dbConfig.dbAuthSource,
        },
    });

    if (dbConfig.dbIsCompressionEnabled) {
        mongoDumpCmd = `mongodump \
        --uri ${connectionUri} \
        --gzip \
        --archive=${backupPath}`;
    } else {
        mongoDumpCmd = `mongodump \
        --uri ${connectionUri} \
        --archive=${backupPath}`;
    }
    let dbDump = await exec(mongoDumpCmd);
    if (dbConfig.backupEncryptionEnabled) {
        await files.encrypt(backupPath, key);
    }
    return dbDump;
};

let restore = async (dbConfig, key, backupFilename) => {
    let backupFilePath = path.join(dbConfig.dbBackupPath, backupFilename);
    let isEncrypted = await encryptionCheck.isEncrypted(backupFilePath);
    if (isEncrypted) {
        await files.decrypt(backupFilePath, key);
        backupFilePath = `${backupFilePath}_unenc`;
    }
    let isCompressed = isGzip(backupFilePath);
    let mongoRestoreCmd;
    let connectionUri = mongoUriBuilder({
        username: dbConfig.dbAuthUser,
        password: dbConfig.dbAuthPwd,
        host: dbConfig.dbHost,
        port: dbConfig.dbPort,
        database: dbConfig.dbName,
        options: {
            authSource: dbConfig.dbAuthSource,
        },
    });
    if (isCompressed) {
        mongoRestoreCmd = `mongorestore \
        --uri ${connectionUri} \
        --drop \
        --gzip \
        --archive=${backupFilePath}`;
    } else {
        mongoRestoreCmd = `mongorestore \
        --uri ${connectionUri} \
        --drop \
        --archive=${backupFilePath}`;
    }

    try {
        let dbRestore = await exec(mongoRestoreCmd);
        return dbRestore;
    } catch (e) {
        throw e;
    } finally {
        if (isEncrypted) {
            files.deleteFile(backupFilePath);
        }
    }
};

module.exports = {
    connect,
    dump,
    restore,
};
