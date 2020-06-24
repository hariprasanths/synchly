const configstore = require('conf');
const constants = require('./../utils/constants');
const strings = require('./../utils/strings');

const confStore = new configstore();

const setupConfig = async (isDebug) => {

    const inquirer = require('./inquirer');
    try {
        let config = await inquirer.askConfig();
        config.remoteSetupComplete = true;
        confStore.set(config);
        console.log("Remote Sync configuration updated successfully.");

        return config;
    } catch (err) {
        console.error("Remote Sync configuration update failed.");
        console.error(`${err.name}: ${err.message}`);
        console.error('Re run with --config remote-sync to finish the configuration');
        if(isDebug) {
            console.error("Stacktrace:");
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
        
    } else if (remoteType == 'SFTP') {
    
    }
    return resp;
}

let deleteFile = async (fileName) => {
    
    let remoteType = confStore.get('remoteType');
    let resp;

    if (remoteType == 'Google Drive') {
        
    } else if (remoteType == 'SFTP') {
        
    }
    return resp;
}

module.exports = {
    setupConfig,
    uploadFile,
    deleteFile
}