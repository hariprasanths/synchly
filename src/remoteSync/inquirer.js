const inquirer = require('inquirer');
const files = require('../utils/files');
const configstore = require('conf');
const gDriveInquirer = require('./gDrive/inquirer');
const sftpInquirer = require('./sftp/inquirer');
const s3Inquirer = require('./s3/inquirer');

let askConfig = async (jobName, key) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfigObj = jobConfStore.store;

    let questions = [];
    questions.push({
        type: 'list',
        name: 'remoteType',
        message: 'Choose the remote service:',
        choices: ['Google Drive', 'SFTP', 'S3'],
        default: jobConfigObj.remoteType || 'Google Drive',
    });

    let retObj = await inquirer.prompt(questions);
    if (retObj.remoteType == 'Google Drive') {
        let gdConfig = await gDriveInquirer.askConfig(jobName, key);
        retObj = Object.assign(retObj, gdConfig);
    } else if (retObj.remoteType == 'SFTP') {
        let sftpConfig = await sftpInquirer.askConfig(jobName, key);
        retObj = Object.assign(retObj, sftpConfig);
    } else if (retObj.remoteType == 'S3') {
        let s3Config = await s3Inquirer.askConfig(jobName, key);
        retObj = Object.assign(retObj, s3Config);
    }
    return retObj;
};

module.exports = {
    askConfig,
};
