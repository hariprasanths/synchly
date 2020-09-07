const inquirer = require('inquirer');
const files = require('../utils/files');
const configstore = require('conf');
const gDriveInquirer = require('./gDrive/inquirer');
const sftpInquirer = require('./sftp/inquirer');


let askConfig = async (jobName) => {
    const jobConfStore = new configstore({configName: jobName});
    const jobConfigObj = jobConfStore.store;

    let questions = [];
    questions.push({
        type: 'list',
        name: 'remoteType',
        message: 'Choose the remote service:',
        choices: ['Google Drive', 'SFTP'],
        default: jobConfigObj.remoteType || 'Google Drive',
    });

    let retObj = await inquirer.prompt(questions);
    if (retObj.remoteType == 'Google Drive') {
        let gdConfig = await gDriveInquirer.askConfig(jobName);
        retObj = Object.assign(retObj, gdConfig);
    } else if (retObj.remoteType == 'SFTP') {
        let sftpConfig = await sftpInquirer.askConfig(jobName);
        retObj = Object.assign(retObj, sftpConfig);
    }
    return retObj;
};

module.exports = {
    askConfig,
};
