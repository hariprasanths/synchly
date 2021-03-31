const inquirer = require('inquirer');
const files = require('../../utils/files');
const s3 = require('./s3');
const ora = require('ora');
const configstore = require('conf');

let askConfig = async (jobName, key) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfigObj = jobConfStore.store;

    let questions = [];

    questions.push({
        name: 's3AccKeyLoc',
        type: 'input',
        message: 'Enter the absolute path of the aws sdk credentials file:',
        default: jobConfigObj.s3AccKeyLoc,
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
                return 'Please enter the absolute path of the aws sdk credentials file.';
            }
        },
    });

    let s3Config = await inquirer.prompt(questions);
    return s3Config;
};

const askRemoteBuck = async (buckets) => {
    let retObj = await inquirer.prompt({
        type: 'list',
        name: 's3ParentBucket',
        message: 'Choose the remote bucket in which backups will be stored:',
        choices: buckets,
        default: 0,
        pageSize: 4,
    });

    return retObj;
};

const askRemoteLoc = async (bucket, folders) => {
    let retObj = await inquirer.prompt({
        type: 'list',
        name: 's3ParentFolder',
        message: 'Choose the remote folder in ' + bucket + ' in which backups will be stored:',
        choices: folders,
        default: 0,
        pageSize: 4,
    });

    return retObj;
};

module.exports = {
    askConfig,
    askRemoteBuck,
    askRemoteLoc,
};
