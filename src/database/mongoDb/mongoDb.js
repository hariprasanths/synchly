const mongoose = require('mongoose');
const mongoUriBuilder = require('./mongoUriBuilder');
const exec = require('./../../utils/await-exec');
const isGzip = require('./../../utils/isGzip');
const path = require('path');

let connect = async (dbConfig) => {
    let connectionUri = mongoUriBuilder({
        username: dbConfig.dbAuthUser,
        password: dbConfig.dbAuthPwd,
        host: dbConfig.dbHost,
        port: dbConfig.dbPort,
        database: dbConfig.dbName,
    });

    let connRes = await mongoose.connect(connectionUri, {useNewUrlParser: true, useUnifiedTopology: true});
    let disConnRes = await mongoose.connection.close();
    return connRes;
};

let dump = async (dbConfig, backupPath) => {
    let mongoDumpCmd;

    if (dbConfig.dbIsCompressionEnabled) {
        mongoDumpCmd = `mongodump \
        --db ${dbConfig.dbName} \
        --host ${dbConfig.dbHost} \
        --port ${dbConfig.dbPort} \
        --username ${dbConfig.dbAuthUser} \
        --password ${dbConfig.dbAuthPwd} \
        --gzip \
        --archive=${backupPath}`;
    } else {
        mongoDumpCmd = `mongodump \
        --db ${dbConfig.dbName} \
        --host ${dbConfig.dbHost} \
        --port ${dbConfig.dbPort} \
        --username ${dbConfig.dbAuthUser} \
        --password ${dbConfig.dbAuthPwd} \
        --archive=${backupPath}`;
    }

    let dbDump = await exec(mongoDumpCmd);
    return dbDump;
};

let restore = async (dbConfig, backupFilename) => {
    let backupFilePath = path.join(dbConfig.dbBackupPath, backupFilename);
    let isCompressed = isGzip(backupFilePath);
    let mongoRestoreCmd;
    if (isCompressed) {
        mongoRestoreCmd = `mongorestore \
        --db ${dbConfig.dbName} \
        --host ${dbConfig.dbHost}:${dbConfig.dbPort} \
        --drop \
        --gzip \
        --archive=${backupFilePath}`;
    } else {
        mongoRestoreCmd = `mongorestore \
        --db ${dbConfig.dbName} \
        --host ${dbConfig.dbHost}:${dbConfig.dbPort} \
        --drop \
        --archive=${backupFilePath}`;
    }

    let dbRestore = await exec(mongoRestoreCmd);
    return dbRestore;
};

module.exports = {
    connect,
    dump,
    restore,
};
