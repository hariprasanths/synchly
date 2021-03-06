const redis = require("redis");

const exec = require('./../../utils/await-exec');
const isGzip = require('./../../utils/isGzip');
const files = require('./../../utils/files');
const path = require('path');
const encryptionCheck = require('../../utils/isEncrypted');

let awaitRedisConnect = (connection) => {
    return new Promise((resolve, reject) => {
        connection.connect(function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(connection);
        });
    });
};

let awaitRedisEnd = (connection) => {
    return new Promise((resolve, reject) => {
        connection.end(function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(connection);
        });
    });
};

let connect = async (dbConfig) => {
    const connection = redis.createClient({
        password: dbConfig.dbAuthPwd,
        host: dbConfig.dbHost,
        port: dbConfig.dbPort
    });

    const connRes = await awaitRedisConnect(connection);
    const disConnRes = await awaitRedisEnd(connection);

    return connRes;
};

let dump = async (dbConfig, key, backupPath) => {
    const postgresqlDumpCmd = `pg_dump --dbname=postgresql://${dbConfig.dbAuthUser}:${dbConfig.dbAuthPwd}@${dbConfig.dbHost}:${dbConfig.dbPort}/${dbConfig.dbName} \
    --compress=0..9 \
    --format=c \
    > ${backupPath}`;

    let dbDump = await exec(postgresqlDumpCmd);

    if (dbConfig.dbIsCompressionEnabled) {
        await files.compressFile(backupPath);
    }
    if (dbConfig.backupEncryptionEnabled) {
        await files.encrypt(backupPath, key);
    }
    return dbDump;
};

let restore = async (dbConfig, key, backupFilename) => {
    let backupFilePath = path.join(dbConfig.dbBackupPath, backupFilename);
    let decryptFileName;
    let isEncrypted = await encryptionCheck.isEncrypted(backupFilePath);
    if (isEncrypted) {
        await files.decrypt(backupFilePath, key);
        backupFilePath = `${backupFilePath}_unenc`;
        decryptFileName = backupFilePath;
    }
    let isCompressed = isGzip(backupFilePath);
    if (isCompressed) {
        await files.decompressFile(backupFilePath);
        backupFilePath = `${backupFilePath}.sql`;
    }
    const postgresqlRestoreCmd = `pg_restore --dbname=postgresql://${dbConfig.dbAuthUser}:${dbConfig.dbAuthPwd}@${dbConfig.dbHost}:${dbConfig.dbPort}/${dbConfig.dbName} --clean \
    < ${backupFilePath}`;
    try {
        let dbRestore = await exec(postgresqlRestoreCmd);
        return dbRestore;
    } catch (err) {
        throw err;
    } finally {
        if (isCompressed) {
            files.deleteFile(backupFilePath);
        }
        if (isEncrypted) {
            files.deleteFile(decryptFileName);
        }
    }
};

module.exports = {
    connect,
    dump,
    restore,
};