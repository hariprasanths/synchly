const mysql = require('mysql');
const exec = require('./../../utils/await-exec');
const isGzip = require('./../../utils/isGzip');
const files = require('./../../utils/files');
const path = require('path');
const encryptionCheck = require('../../utils/isEncrypted');

let awaitMysqlConnect = (connection) => {
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

let awaitMysqlEnd = (connection) => {
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
    const connection = mysql.createConnection({
        user: dbConfig.dbAuthUser,
        password: dbConfig.dbAuthPwd,
        host: dbConfig.dbHost,
        port: dbConfig.dbPort,
        database: dbConfig.dbName,
    });

    const connRes = await awaitMysqlConnect(connection);
    const disConnRes = await awaitMysqlEnd(connection);

    return connRes;
};

let dump = async (dbConfig, key, backupPath) => {
    const mysqlDumpCmd = `mysqldump \
    --host=${dbConfig.dbHost} \
    --port=${dbConfig.dbPort} \
    --user=${dbConfig.dbAuthUser} \
    --password=${dbConfig.dbAuthPwd} \
    --databases ${dbConfig.dbName} \
    --compress \
    --routines \
    --result-file=${backupPath}`;

    let dbDump = await exec(mysqlDumpCmd);

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
    const mysqlDumpCmd = `mysql \
    --host=${dbConfig.dbHost} \
    --port=${dbConfig.dbPort} \
    --protocol=TCP \
    -u ${dbConfig.dbAuthUser} \
    -p${dbConfig.dbAuthPwd} \
    ${dbConfig.dbName} \
    < ${backupFilePath}`;
    try {
        let dbRestore = await exec(mysqlDumpCmd);
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
