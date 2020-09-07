const inquirer = require('inquirer');
const files = require('../../utils/files');
const ora = require('ora');
const configstore = require('conf');
const constants = require('./../../utils/constants');
const strings = require('./../../utils/strings');
const sftp = require('./sftp');

let askConfig = async (jobName) => {
    const jobConfStore = new configstore({configName: jobName});
    const jobConfigObj = jobConfStore.store;

    let questions = [];

    questions.push({
        name: 'sftpHost',
        type: 'input',
        message: 'Enter the hostname or IP of the remote server:',
        default: jobConfigObj.sftpHost,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the hostname or IP of the remote server.';
            }
        },
    });

    questions.push({
        name: 'sftpPort',
        type: 'input',
        message: 'Enter the port number of the remote server:',
        default: jobConfigObj.sftpPort,
        validate: function (value) {
            if (value.length) {
                if (isNaN(value) || Number(value) == 0) {
                    return strings.validNoWarning;
                }
                return true;
            } else {
                return 'Please enter the hostname or IP of the remote server.';
            }
        },
    });

    questions.push({
        name: 'sftpAuthUser',
        type: 'input',
        message: 'Enter the username for authentication:',
        default: jobConfigObj.sftpAuthUser,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the username for authentication.';
            }
        },
    });

    questions.push({
        name: 'sftpAuthPwd',
        type: 'password',
        mask: true,
        message: 'Enter the password for authentication:',
        default: jobConfigObj.sftpAuthPwd,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the password for authentication.';
            }
        },
    });

    questions.push({
        name: 'sftpBackupPath',
        type: 'input',
        message: 'Enter the absolute path of the directory for storing backups on the remote server:',
        default: jobConfigObj.sftpBackupPath,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the absolute path of the directory for storing backups on the remote server.';
            }
        },
    });

    let sftpConfig = await inquirer.prompt(questions);
    return sftpConfig;
};

module.exports = {
    askConfig,
};
