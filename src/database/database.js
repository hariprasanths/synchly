const strings = require('./../utils/strings');
const configstore = require('conf');
const mongoDb = require('./mongoDb/mongoDb');
const mysql = require('./mysql/mysql');
const postgresql = require('./postgresql/postgresql');
const redis = require('./redis/redis');
const inquirer = require('./inquirer');
const ora = require('ora');
const validator = require('./validator');

const setupConfig = async (jobName, key, isDebug, filePath = undefined) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    let dbConnStatus;
    dbConnStatus = ora('Authenticating you, please wait...');
    try {
        let config;
        if (filePath) {
            config = require(filePath);
            dbConnStatus.start();
            config = await validator.validateInitConfig(config);
        } else {
            config = await inquirer.askConfig(jobName, key);
            dbConnStatus.start();
        }
        const dbConnRes = await connect(config);
        dbConnStatus.succeed('Authentication success');

        config.dbSetupComplete = true;
        jobConfStore.set(config);
        console.log('Database configuration updated successfully.');

        return dbConnRes;
    } catch (err) {
        dbConnStatus.fail('Authentication failed');
        console.error('Database configuration update failed.');
        console.error(`${err.name}: ${err.message}`);
        console.error('Re run with --config db to finish the configuration');
        if (isDebug) {
            console.error('Stacktrace:');
            console.error(err);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

let connect = async (dbConfig) => {
    let resp;
    if (dbConfig.dbType == 'MongoDB') {
        resp = await mongoDb.connect(dbConfig);
    } else if (dbConfig.dbType == 'MySQL') {
        resp = await mysql.connect(dbConfig);
    } else if (dbConfig.dbType == 'PostgreSQL') {
        resp = await postgresql.connect(dbConfig);
    } else if (dbConfig.dbType == 'Redis') {
        resp = await redis.connect(dbConfig);
    }
    return resp;
};

let dump = async (jobName, key, backupDirName) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfigObj = jobConfStore.store;
    const dbType = jobConfigObj.dbType;

    let resp;
    if (dbType == 'MongoDB') {
        resp = await mongoDb.dump(jobConfigObj, key, backupDirName);
    } else if (dbType == 'MySQL') {
        resp = await mysql.dump(jobConfigObj, key, backupDirName);
    } else if (dbType == 'PostgreSQL') {
        resp = await postgresql.dump(jobConfigObj, key, backupDirName);
    } else if (dbType == 'Redis') {
        resp = await redis.dump(jobConfigObj, key, backupDirName);
    }
    return resp;
};

let setupRestore = async (jobName, key, isDebug) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfigObj = jobConfStore.store;
    let restoreStatus = ora('Restoring, please wait...');
    try {
        let restoreConfig = await inquirer.askRestoreConfig(jobName, key);
        if (restoreConfig.restoreConfirmation) {
            let backupFileName = restoreConfig.backupFileName;
            restoreStatus.start();
            let dbRestoreRes = await restore(jobConfigObj, key, backupFileName);
            restoreStatus.succeed('Restore success');
            return dbRestoreRes;
        }
    } catch (error) {
        restoreStatus.fail('Restore failed');
        console.error('Restoration of database from the backup failed.');
        console.error(`${error.name}: ${error.message}`);
        console.error('Re run with --restore to restore the backup');
        if (isDebug) {
            console.error('Stacktrace:');
            console.error(error);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

let restore = async (dbConfig, key, backupFileName) => {
    let resp;
    const dbType = dbConfig.dbType;
    if (dbType == 'MongoDB') {
        resp = await mongoDb.restore(dbConfig, key, backupFileName);
    } else if (dbType == 'MySQL') {
        resp = await mysql.restore(dbConfig, key, backupFileName);
    } else if (dbType == 'PostgreSQL') {
        resp = await postgresql.restore(dbConfig, key, backupFileName);
    } else if (dbType == 'redis') {
        resp = await redis.restore(dbConfig, key, backupFileName);
    }
    return resp;
};

module.exports = {
    setupConfig,
    connect,
    dump,
    setupRestore,
};
