const constants = require('./../utils/constants');
const strings = require('./../utils/strings');
const configstore = require('conf');
const mongoDb = require('./mongoDb/mongoDb');
const mysql = require('./mysql/mysql');
const inquirer = require('./inquirer');
const ora = require('ora');
const validator = require('./validator');

const setupConfig = async (jobName, isDebug, filePath = undefined) => {
    const jobConfStore = new configstore({configName: jobName});
    let dbConnStatus;
    dbConnStatus = ora('Authenticating you, please wait...');
    try {
        let config;
        if (filePath) {
            config = require(filePath);
            dbConnStatus.start();
            config = await validator.validateInitConfig(config);
        } else {
            config = await inquirer.askConfig(jobName);
            dbConnStatus.start();
        }

        const dbConnRes = await connect(config);
        dbConnStatus.succeed('Authentication success');

        config.dbSetupComplete = true;
        jobConfStore.set(config);
        console.log('Database configuration updated successfully.');

        return config;
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
    }
    return resp;
};

let dump = async (jobName, backupDirName) => {
    const jobConfStore = new configstore({configName: jobName});
    const jobConfigObj = jobConfStore.store;
    const dbType = jobConfigObj.dbType;

    let resp;
    if (dbType == 'MongoDB') {
        resp = await mongoDb.dump(jobConfigObj, backupDirName);
    } else if (dbType == 'MySQL') {
        resp = await mysql.dump(jobConfigObj, backupDirName);
    }
    return resp;
};

let setupRestore = async (jobName, isDebug) => {
    const jobConfStore = new configstore({configName: jobName});
    const jobConfigObj = jobConfStore.store;
    let restoreStatus = ora('Restoring, please wait...');
    try {
        let restoreConfig = await inquirer.askRestoreConfig(jobName);
        if (restoreConfig.restoreConfrimation) {
            let backupFileName = restoreConfig.backupFileName;
            restoreStatus.start();
            let dbRestoreRes = await restore(jobConfigObj, backupFileName);
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

let restore = async (dbConfig, backupFileName) => {
    let resp;
    const dbType = dbConfig.dbType;
    if (dbType == 'MongoDB') {
        resp = await mongoDb.restore(dbConfig, backupFileName);
    } else if (dbType == 'MySQL') {
        resp = await mysql.restore(dbConfig, backupFileName);
    }
    return resp;
};

module.exports = {
    setupConfig,
    connect,
    dump,
    setupRestore,
};
