const configstore = require('conf');
const constants = require('./../utils/constants');
const strings = require('./../utils/strings');
const inquirer = require('./inquirer');
const gDrive = require('./gDrive/gDrive');
const gDriveInquirer = require('./gDrive/inquirer');
const sftp = require('./sftp/sftp');
const ora = require('ora');
const validator = require('./validator');

const confStore = new configstore();

const setupConfig = async (isDebug, filePath = undefined) => {
    let connStatus;
    connStatus = ora('Authenticating you, please wait...');
    try {
        let config;
        if (filePath) {
            config = require(filePath);
            connStatus.start();
            config = await validator.validateInitConfig(config);
        } else {
            config = await inquirer.askConfig();
            connStatus.start();
        }

        if (config.remoteType == 'Google Drive') {
            let folders;
            folders = await gDrive.listFolders(config);
            connStatus.succeed('Authentication success');
            folders = folders.map((f) => {
                return {name: f.name, value: f.id};
            });
            let gdConfig = await gDriveInquirer.askRemoteLoc(folders);
            config = Object.assign(config, gdConfig);
            let cloneKeyRes = await gDrive.cloneServiceAccKey(config.gDriveServiceAccKeyLoc);
        } else if (config.remoteType == 'SFTP') {
            let isExists = await sftp.exists(config);
            connStatus.succeed('Authentication success');
        }

        config.remoteSetupComplete = true;
        confStore.set(config);
        console.log('Remote Sync configuration updated successfully.');

        return config;
    } catch (err) {
        connStatus.fail('Authentication failed');
        console.error('Remote Sync configuration update failed.');
        console.error(`${err.name}: ${err.message}`);
        console.error('Re run with --config remote-sync to finish the configuration');
        if (isDebug) {
            console.error('Stacktrace:');
            console.error(err);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

let uploadFile = async (fileName, filePath) => {
    let remoteType = confStore.get('remoteType');
    let resp;

    if (remoteType == 'Google Drive') {
        resp = await gDrive.uploadFile(fileName, filePath);
    } else if (remoteType == 'SFTP') {
        resp = await sftp.uploadFile(fileName, filePath);
    }
    return resp;
};

let deleteFile = async (fileName) => {
    let remoteType = confStore.get('remoteType');
    let resp;

    if (remoteType == 'Google Drive') {
        resp = await gDrive.deleteFile(fileName);
    } else if (remoteType == 'SFTP') {
        resp = await sftp.deleteFile(fileName);
    }
    return resp;
};

module.exports = {
    setupConfig,
    uploadFile,
    deleteFile,
};
