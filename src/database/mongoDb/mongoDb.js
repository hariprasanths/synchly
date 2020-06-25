const mongoose = require('mongoose');
const mongoUriBuilder = require('./mongoUriBuilder');
const exec = require('./../../utils/await-exec');
const path = require('path');

let connect = async (dbConfig) => {
    
    let connectionUri = mongoUriBuilder({
        username: dbConfig.dbAuthUser,
        password: dbConfig.dbAuthPwd,
        host: dbConfig.dbHost,
        port: dbConfig.dbPort,
        database: dbConfig.dbName,
    });

    let connRes = await mongoose.connect(connectionUri, {useNewUrlParser: true, useUnifiedTopology: true });
    let disConnRes = await mongoose.connection.close();
    return connRes;
}

let dump = async (dbConfig, backupPath) => {


    const mongoDumpCmd =
    `mongodump \
    --db ${dbConfig.dbName} \
    --host ${dbConfig.dbHost} \
    --port ${dbConfig.dbPort} \
    --username ${dbConfig.dbAuthUser} \
    --password ${dbConfig.dbAuthPwd} \
    --gzip \
    --archive=${backupPath}`;

    let dbDump = await exec(mongoDumpCmd);
    return dbDump;
}

module.exports = {
    connect,
    dump
}