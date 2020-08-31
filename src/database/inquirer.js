const inquirer = require('inquirer');
const files = require('./../utils/files');
const configstore = require('conf');
const strings = require('./../utils/strings');

const confStore = new configstore();

let askConfig = async () => {
    const configObj = confStore.store;

    inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

    let questions = [];

    questions.push({
        type: 'list',
        name: 'dbType',
        message: 'Choose the type of database to backup',
        choices: ['MongoDB', 'MySQL'],
        default: configObj.dbType || 'MongoDB',
    });

    questions.push({
        name: 'dbAuthUser',
        type: 'input',
        message: 'Enter your database username:',
        default: configObj.dbAuthUser,
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
        default: configObj.dbAuthPwd,
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
        default: configObj.dbHost || 'localhost',
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
            return configObj.dbPort || defaultPort;
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
        default: configObj.dbName,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter your database name to be backed up.';
            }
        },
    });

    questions.push({
        name: 'dbBackupPath',
        type: 'input',
        message: 'Enter the absolute path of the directory for storing local backups:',
        default: configObj.dbBackupPath,
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
        name: 'dbIsCompressionEnabled',
        message: 'Do you want to enable backup compression?',
    });

    const dbBackupTimeString = configObj.dbBackupTime || '1970-01-01 00:00';

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
        default: configObj.dbNoOfDays || '7',
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
        default: configObj.dbNoOfWeeks || '8',
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
        default: configObj.dbNoOfMonths || '6',
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

module.exports = {
    askConfig,
};
