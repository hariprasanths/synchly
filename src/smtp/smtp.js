const nodemailer = require('nodemailer');
const configstore = require('conf');
const constants = require('./../utils/constants');
const strings = require('./../utils/strings');
const date = require('./../utils/date');
var cron = require('node-cron');
const ora = require('ora');
const inquirer = require('./inquirer');
const validator = require('./validator');

const setupConfig = async (jobName, key, isDebug, filePath = undefined) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    let smtpConnStatus = ora('Authenticating you, please wait...');
    try {
        let config;
        if (filePath) {
            config = require(filePath);
            smtpConnStatus.start();
            config = await validator.validateInitConfig(config);
        } else {
            config = await inquirer.askConfig(jobName, key);
            smtpConnStatus.start();
        }

        const testEmailSub = `SMTP configuration updation successfull`;
        const testEmailBody = `Status notifications will be sent everyday to:<br/> ${config.smtpRecipientMail}`;
        const smtpConnRes = await sendMail(jobName, key, testEmailSub, testEmailBody, config);

        smtpConnStatus.succeed('Authentication succeess');

        config.smtpSetupComplete = true;
        jobConfStore.set(config);
        console.log('SMTP configuration updated successfully.');

        return config;
    } catch (err) {
        smtpConnStatus.fail('Authentication failed');
        console.error('SMTP configuration update failed.');
        console.error(`${err.name}: ${err.message}`);
        console.error('Re run with --config smtp to finish the configuration');
        if (isDebug) {
            console.error('Stacktrace:');
            console.error(err);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

let init = (jobName, key, smtpConfig = undefined) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    if (!smtpConfig) smtpConfig = jobConfStore.store;

    //port 587, 25 - not secure  & port 465 - secure
    return nodemailer.createTransport({
        host: smtpConfig.smtpHost,
        port: smtpConfig.smtpPort,
        secure: smtpConfig.smtpPort == 465,
        auth: {
            user: smtpConfig.smtpUser,
            pass: smtpConfig.smtpPwd,
        },
    });
};

let sendMail = async (jobName, key, subject, htmlBody, smtpConfig = undefined) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    if (!smtpConfig) smtpConfig = jobConfStore.store;

    let smtpTransport = init(jobName, key, smtpConfig);

    const mailOptions = {
        from: `Synchly backups <${smtpConfig.smtpSenderMail}>`,
        to: smtpConfig.smtpRecipientMail,
        generateTextFromHTML: true,
        subject: subject,
        html: htmlBody,
    };

    let res = await smtpTransport.sendMail(mailOptions);
    smtpTransport.close();
    return res;
};

let sendMailScheduler = (jobName, key, subject, htmlBody, isDebug) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfigObj = jobConfStore.store;

    const smtpNotifyTime = new Date(jobConfigObj.smtpNotifyTime);
    const notifyHours = smtpNotifyTime.getHours();
    const notifyMinutes = smtpNotifyTime.getMinutes();
    let cronExp = `${notifyMinutes} ${notifyHours} * * *`;

    const dbBackupTime = new Date(jobConfigObj.dbBackupTime);

    // send status updates as soon as the backup finishes if schedule is missed
    const isNotifyMissed = date.isBetween(smtpNotifyTime, dbBackupTime, new Date());
    if (isNotifyMissed) {
        cronExp = `*/1 * * * *`;
    }

    const sendMailTask = cron.schedule(cronExp, async () => {
        try {
            let smtpRes = await sendMail(jobName, key, subject, htmlBody, jobConfigObj);
        } catch (e) {
            console.error(`smtp: failed to send status mail: ${e.message}`);
            if (isDebug) {
                console.error('Stacktrace:');
                console.error(err);
            } else {
                console.error(strings.debugModeDesc);
            }
        }

        sendMailTask.stop();
        sendMailTask.destroy();
    });
};

module.exports = {
    setupConfig,
    sendMail,
    sendMailScheduler,
};
