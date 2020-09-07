const constants = require('./../utils/constants');
const strings = require('./../utils/strings');
const configstore = require('conf');
const mongoDb = require('./mongoDb/mongoDb');
const mysql = require('./mysql/mysql');
const inquirer = require('./inquirer');
const ora = require('ora');
const validator = require('./validator');

const confStore = new configstore();

const setupConfig = async (isDebug, filePath = undefined) => {
    let dbConnStatus;
    dbConnStatus = ora('Authenticating you, please wait...');
    try {
        let config;
        if (filePath) {
            config = require(filePath);
            dbConnStatus.start();
            config = await validator.validateInitConfig(config);
        } else {
            config = await inquirer.askConfig();
            dbConnStatus.start();
        }

        const dbConnRes = await connect(config);
        dbConnStatus.succeed('Authentication success');

        config.dbSetupComplete = true;
        confStore.set(config);
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

let dump = async (backupDirName) => {
    const dbType = confStore.get('dbType');
    const configObj = confStore.store;

    let resp;
    if (dbType == 'MongoDB') {
        resp = await mongoDb.dump(configObj, backupDirName);
    } else if (dbType == 'MySQL') {
        resp = await mysql.dump(configObj, backupDirName);
    }
    return resp;
};

let dbRestore = async (isDebug) => {
    let restoreStatus;
    try {
        let restoreConfig = await inquirer.askRestoreConfig();
        if (restoreConfig.restoreConfrimation) {
            let backupFileName = restoreConfig.backupFileName;
            restoreStatus = ora('Restoring, please wait...');
            const dbType = confStore.get('dbType');
            const configObj = confStore.store;
            let resp;
            if (dbType == 'MongoDB') {
                restoreStatus.start();
                resp = await mongoDb.restore(configObj, backupFileName);
            } else if (dbType == 'MySQL') {
                restoreStatus.start();
                resp = await mysql.restore(configObj, backupFileName);
            }
            restoreStatus.succeed('Restore success');
            return resp;
        }
    } catch (error) {
        if (restoreStatus != null) restoreStatus.fail('Restore failed');
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

module.exports = {
    setupConfig,
    connect,
    dump,
    dbRestore,
};
