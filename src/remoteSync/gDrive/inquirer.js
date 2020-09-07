const inquirer = require('inquirer');
const files = require('../../utils/files');
const gDrive = require('./gDrive');
const ora = require('ora');
const configstore = require('conf');

let askConfig = async (jobName) => {
    const jobConfStore = new configstore({configName: jobName});
    const jobConfigObj = jobConfStore.store;

    let questions = [];
    questions.push({
        name: 'gDriveServiceAccKeyLoc',
        type: 'input',
        message: 'Enter the absolute path of the service account key file:',
        default: jobConfigObj.gDriveServiceAccKeyLoc,
        validate: function (value) {
            if (value.length) {
                if (!files.directoryExists(value)) {
                    return `No Such file, '${value}'`;
                }
                let isFile = files.isFile(value);
                if (!isFile) {
                    return `'${value}' is a directory.`;
                }
                return true;
            } else {
                return 'Please enter the absolute path of the service account key file.';
            }
        },
    });

    let gdConfig = await inquirer.prompt(questions);
    return gdConfig;
};

const askRemoteLoc = async (folders) => {
    let retObj = await inquirer.prompt({
        type: 'list',
        name: 'gDriveParentFolderId',
        message: 'Choose the remote folder in which backups will be stored:',
        choices: folders,
        default: 0,
        pageSize: 4,
    });

    return retObj;
};

module.exports = {
    askConfig,
    askRemoteLoc,
};
