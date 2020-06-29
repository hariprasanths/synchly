const inquirer = require('inquirer');
const files = require('../utils/files');
const ora = require('ora');
const configstore = require('conf');
const constants = require('./../utils/constants');
const smtp = require('./smtp');

const confStore = new configstore();

let askConfig = async () => {
    const configObj = confStore.store;

    inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'));

    let questions = [];
    questions.push({
        name: 'smtpHost',
        type: 'input',
        message: 'Enter your SMTP hostname:',
        default: configObj.smtpHost,
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
        default: configObj.smtpPort,
        choices: [465, 587, 25],
        default: 465,
    });

    questions.push({
        name: 'smtpUser',
        type: 'input',
        message: 'Enter the SMTP username:',
        default: configObj.smtpUser,
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
        default: configObj.smtpPwd,
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
        default: configObj.smtpSenderMail,
        validate: function (value) {
            if (value.length) {
                if (!smtp.validateEmail(value)) return 'Please enter a valid sender e-mail.';
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
        default: configObj.smtpRecipientMail,
        validate: function (value) {
            if (value.length) {
                if (!smtp.validateEmail(value)) return 'Please enter a valid recipient e-mail.';
                return true;
            } else {
                return 'Please enter the SMTP recipient e-mail.';
            }
        },
    });

    const smtpNotifyTimeString = configObj.smtpNotifyTime || '1970-01-01 00:00';

    questions.push({
        type: 'datetime',
        name: 'smtpNotifyTime',
        message: 'Enter the time to send the status updates every day:',
        format: ['H', ':', 'MM', ' ', 'Z'],
        initial: new Date(smtpNotifyTimeString),
    });

    let smtpConfig = await inquirer.prompt(questions);

    let smtpConnStatus = ora('Authenticating you, please wait...');
    try {
        smtpConnStatus.start();
        const testEmailSub = `SMTP configuration updation successfull`;
        const testEmailBody = `Status notifications will be sent everyday to:<br/> ${smtpConfig.smtpRecipientMail}`;
        const smtpConnRes = await smtp.sendMail(testEmailSub, testEmailBody, smtpConfig);
        smtpConnStatus.succeed('Authentication success');
        return smtpConfig;
    } catch (e) {
        smtpConnStatus.fail('Authentication failed');
        throw e;
    }
};

module.exports = {
    askConfig,
};
