const inquirer = require('inquirer');
const configstore = require('conf');
const utils = require('./../utils/utils');

let askConfig = async (jobName) => {
    const jobConfStore = new configstore({configName: jobName});
    const jobConfigObj = jobConfStore.store;

    inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

    let questions = [];
    questions.push({
        name: 'smtpHost',
        type: 'input',
        message: 'Enter your SMTP hostname:',
        default: jobConfigObj.smtpHost,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the SMTP hostname.';
            }
        },
    });

    questions.push({
        name: 'smtpPort',
        type: 'list',
        message: 'Enter your SMTP port:',
        default: jobConfigObj.smtpPort,
        choices: [465, 587, 25],
        default: 465,
    });

    questions.push({
        name: 'smtpUser',
        type: 'input',
        message: 'Enter the SMTP username:',
        default: jobConfigObj.smtpUser,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the SMTP username.';
            }
        },
    });

    questions.push({
        name: 'smtpPwd',
        type: 'password',
        message: 'Enter the SMTP password:',
        default: jobConfigObj.smtpPwd,
        mask: true,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the SMTP password.';
            }
        },
    });

    questions.push({
        name: 'smtpSenderMail',
        type: 'input',
        message: 'Enter the SMTP sender e-mail:',
        default: jobConfigObj.smtpSenderMail,
        validate: function (value) {
            if (value.length) {
                if (!utils.validateEmail(value)) return 'Please enter a valid sender e-mail.';
                return true;
            } else {
                return 'Please enter the SMTP sender e-mail.';
            }
        },
    });

    questions.push({
        name: 'smtpRecipientMail',
        type: 'input',
        message: 'Enter the SMTP recipient e-mail:',
        default: jobConfigObj.smtpRecipientMail,
        validate: function (value) {
            if (value.length) {
                if (!utils.validateEmail(value)) return 'Please enter a valid recipient e-mail.';
                return true;
            } else {
                return 'Please enter the SMTP recipient e-mail.';
            }
        },
    });

    const smtpNotifyTimeString = jobConfigObj.smtpNotifyTime || '1970-01-01 00:00';

    questions.push({
        type: 'datetime',
        name: 'smtpNotifyTime',
        message: 'Enter the time to send the status updates every day:',
        format: ['H', ':', 'MM', ' ', 'Z'],
        initial: new Date(smtpNotifyTimeString),
    });

    let smtpConfig = await inquirer.prompt(questions);

    return smtpConfig;
};

module.exports = {
    askConfig,
};
