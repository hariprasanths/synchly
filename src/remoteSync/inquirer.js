const inquirer = require('inquirer');
const files = require('../utils/files');
const configstore = require('conf');

const confStore = new configstore();

let askConfig = async () => {

    const configObj = confStore.store;

    let questions  = [];
    questions.push({
        type: 'list',
        name: 'remoteType',
        message: 'Choose the remote service:',
        choices: ['Google Drive', 'SFTP'],
        default: configObj.remoteType || 'Google Drive'
    });

    let retObj = await inquirer.prompt(questions);
    if(retObj.remoteType == "Google Drive") {
        
        retObj = Object.assign(retObj, gdConfig);
    } else if (retObj.remoteType == "SFTP") {
        
        retObj = Object.assign(retObj, sftpConfig);
    }
    return retObj;
};

module.exports = {
    askConfig
}