const inquirer = require('inquirer');
const files = require('../../utils/files');
const ora = require('ora');
const configstore = require('conf');
const constants = require('./../../utils/constants');
const strings = require('./../../utils/strings');
const sftp = require('./sftp');

const confStore = new configstore();

let askConfig = async () => {

    const configObj = confStore.store;

    let questions = [];

    questions.push({
        name: 'sftpHost',
        type: 'input',
        message: 'Enter the hostname or IP of the remote server:',
        default: configObj.sftpHost,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the hostname or IP of the remote server.';
            }
        }
    });

    questions.push({
        name: 'sftpPort',
        type: 'input',
        message: 'Enter the port number of the remote server:',
        default: configObj.sftpPort,
        validate: function (value) {
            if (value.length) {
                if(isNaN(value) || Number(value) == 0) {
                    return strings.validNoWarning
                }
                return true;
            } else {
                return 'Please enter the hostname or IP of the remote server.';
            }
        }
    });

    questions.push({
        name: 'sftpAuthUser',
        type: 'input',
        message: 'Enter the username for authentication:',
        default: configObj.sftpAuthUser,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the username for authentication.';
            }
        }
    });

    questions.push({
        name: 'sftpAuthPwd',
        type: 'password',
        mask: true,
        message: 'Enter the password for authentication:',
        default: configObj.sftpAuthPwd,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the password for authentication.';
            }
        }
    });

    questions.push({
        name: 'sftpBackupPath',
        type: 'input',
        message: 'Enter the directory path for storing backups on the remote server:',
        default: configObj.sftpBackupPath,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the directory path for storing backups on the remote server.';
            }
        }
    });

    let sftpConfig = await inquirer.prompt(questions);

    let sftpStatus;
    let isExists;
    try {
        sftpStatus = ora('Authenticating you, please wait...');
        sftpStatus.start();
        isExists = await sftp.exists(sftpConfig);
        sftpStatus.succeed("Authentication success");
    } catch (e) {
        sftpStatus.fail("Authentication failed");
        throw e;
    }

    return sftpConfig;
};

module.exports = {
    askConfig
}