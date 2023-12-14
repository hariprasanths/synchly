const inquirer = require('inquirer');
const files = require('./../utils/files');
const configstore = require('conf');
const constants = require('../utils/constants');
const strings = require('./../utils/strings');

let askConfig = async (jobName, key) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfigObj = jobConfStore.store;

    inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

    let questions = [];

    questions.push({
        type: 'list',
        name: 'dbType',
        message: 'Choose the type of database to backup',
        choices: ['MongoDB', 'MySQL', 'PostgreSQL'],
        default: jobConfigObj.dbType || 'MongoDB',
    });

    questions.push({
        name: 'dbAuthUser',
        type: 'input',
        message: 'Enter your database username:',
        default: jobConfigObj.dbAuthUser,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter your database username.';
            }
        },
    });

    questions.push({
        name: 'dbAuthPwd',
        type: 'password',
        message: 'Enter your database password:',
        default: jobConfigObj.dbAuthPwd,
        mask: true,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter your database password.';
            }
        },
    });

    questions.push({
        name: 'dbHost',
        type: 'input',
        message: 'Enter the database hostname:',
        default: jobConfigObj.dbHost || 'localhost',
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the database hostname.';
            }
        },
    });

    questions.push({
        name: 'dbPort',
        type: 'input',
        message: 'Enter the database server port:',
        default: function (ans) {
            let defaultPort;
            if (ans.dbType == 'MongoDB') defaultPort = '27017';
            else if (ans.dbType == 'MySQL') defaultPort = '3306';
            else if(ans.dbType == 'PostgreSQL') defaultPort = '5432';
            return jobConfigObj.dbPort || defaultPort;
        },
        validate: function (value) {
            if (value.length) {
                if (isNaN(value) || Number(value) == 0) {
                    return strings.validNoWarning;
                }
                return true;
            } else {
                return 'Please enter the database server port.';
            }
        },
    });

    questions.push({
        name: 'dbName',
        type: 'input',
        message: 'Enter the database name to backup:',
        default: jobConfigObj.dbName,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter your database name to be backed up.';
            }
        },
    });

    questions.push({
        name: 'dbCert',
        type: 'input',
        message: 'Enter the absolute path of the certificate file:',
        validate: function (value) {
            if (value.length) {
                let isFile = files.isFile(value);
                if (!isFile) {
                    return `'${value}' is not a file.`;
                }
                return true;
            } else {
                return 'Please enter the absolute path of the certificate file.';
            }
        },
        when: function (answers) {
            return answers.dbType == 'PostgreSQL';
        },
    });
    
    questions.push({
        name: 'dbAuthSource',
        type: 'input',
        message: 'Enter the database name associated with the user credentials (i.e. authSource):',
        default: 'admin',
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the database name associated with the user credentials.';
            }
        },
        when: function (answers) {
            return answers.dbType == 'MongoDB';
        },
    });

    questions.push({
        name: 'dbBackupPath',
        type: 'input',
        message: 'Enter the absolute path of the directory for storing local backups:',
        default: jobConfigObj.dbBackupPath,
        validate: function (value) {
            if (value.length) {
                if (!files.directoryExists(value)) {
                    return `No such directory, '${value}'`;
                }
                let isFile = files.isFile(value);
                if (isFile) {
                    return `'${value}' is a file.`;
                }
                return true;
            } else {
                return 'Please enter the absolute path of the directory for storing local backups.';
            }
        },
    });
    questions.push({
        type: 'confirm',
        name: 'backupEncryptionEnabled',
        message: 'Do you want the backup files to be encrypted?',
        when: function () {
            if (key) {
                return true;
            }
        },
    });

    questions.push({
        type: 'confirm',
        name: 'dbIsCompressionEnabled',
        message: 'Do you want to enable backup compression?',
    });

    const dbBackupTimeString = jobConfigObj.dbBackupTime || '1970-01-01 00:00';

    questions.push({
        type: 'datetime',
        name: 'dbBackupTime',
        message: 'Enter the time to run the backups every day:',
        format: ['H', ':', 'MM', ' ', 'Z'],
        initial: new Date(dbBackupTimeString),
    });

    questions.push({
        name: 'dbNoOfDays',
        type: 'input',
        message: 'Enter the No. of days to persist backups for (1 backup per day):',
        default: jobConfigObj.dbNoOfDays || '7',
        validate: function (value) {
            if (value.length) {
                if (isNaN(value) || Number(value) == 0) {
                    return strings.validNoWarning;
                }
                return true;
            } else {
                return 'Please enter No. of days to persist backups for.';
            }
        },
    });

    questions.push({
        name: 'dbNoOfWeeks',
        type: 'input',
        message: 'Enter the No. of weeks to persist backups for (1 backup per week):',
        default: jobConfigObj.dbNoOfWeeks || '8',
        validate: function (value) {
            if (value.length) {
                if (isNaN(value) || Number(value) == 0) {
                    return strings.validNoWarning;
                }
                return true;
            } else {
                return 'Please enter No. of weeks to persist backups for.';
            }
        },
    });

    questions.push({
        name: 'dbNoOfMonths',
        type: 'input',
        message: 'Enter the No. of months to persist backups for (1 backup per month):',
        default: jobConfigObj.dbNoOfMonths || '6',
        validate: function (value) {
            if (value.length) {
                if (isNaN(value) || Number(value) == 0) {
                    return strings.validNoWarning;
                }
                return true;
            } else {
                return 'Please enter No. of months to persist backups for.';
            }
        },
    });

    let dbConfig;
    try {
        dbConfig = await inquirer.prompt(questions);
    } catch (e) {
        throw e;
    }

    return dbConfig;
};

let askRestoreConfig = async (jobName, key) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfigObj = jobConfStore.store;
    let questions = [];
    let fileList = [];
    let choices = [];

    fileList = await files.listFileNames(jobConfigObj.dbBackupPath);
    choices = getJobSpecificBackups(jobName, fileList);
    if (choices.length == 0) {
        throw {
            name: 'Empty directory',
            message: 'No backups have been found',
        };
    }
    questions.push({
        type: 'list',
        name: 'backupFileName',
        message: 'Choose the backup to restore :',
        choices: choices,
        default: choices[0],
    });
    questions.push({
        type: 'confirm',
        name: 'restoreConfirmation',
        message: 'Restoring database from the backup will flush the existing database, are you sure want to conitnue ?',
    });
    let restoreConfig;
    restoreConfig = await inquirer.prompt(questions);
    return restoreConfig;
};

var getJobSpecificBackups = (jobName, fileList) => {
    let choices = [];
    for (let index in fileList) {
        let fileName = fileList[index];
        let jobNameAutomatic = fileName.split(constants.DB_BACKUP_DIR_PREFIX);
        let jobNameManual = fileName.split(constants.DB_MANUAL_BACKUP_DIR_PREFIX);
        if (jobNameAutomatic[0] == jobName || jobNameManual[0] == jobName) {
            choices.push(fileName);
        }
    }
    return choices;
};

module.exports = {
    askConfig,
    askRestoreConfig,
};
