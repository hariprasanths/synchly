const mysql = require('mysql');
const exec = require('./../../utils/await-exec');
const isGzip = require('./../../utils/isGzip');
const files = require('./../../utils/files');
const path = require('path');
const {promisify} = require('util');

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

let dump = async (dbConfig, backupPath) => {
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
        const compressFileRes = await files.compressFile(backupPath);
    }

    return dbDump;
};

let restore = async (dbConfig, backupFilename) => {
    let backupFilePath = path.join(dbConfig.dbBackupPath, backupFilename);
    let isCompressed = isGzip(backupFilePath);
    if (isCompressed) {
        const decompressFileRes = await files.decompressFile(backupFilePath);
        backupFilePath = backupFilePath + '.sql';
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
    }
};

module.exports = {
    connect,
    dump,
    restore,
};
