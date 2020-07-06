const files = require('./../utils/files');
const utils = require('./../utils/utils');

const smtpConfigKeys = {
    smtpHost: 'host',
    smtpPort: 'port',
    smtpUser: 'username',
    smtpPwd: 'password',
    smtpSenderMail: 'senderMail',
    smtpRecipientMail: 'recipientMail',
    smtpNotifyTime: 'notificationTime',
};

const validateInitConfig = async (config) => {
    let validatedConfig = {};

    if (!config[smtpConfigKeys.smtpHost]) {
        throw new Error(`Invalid config: Missing required field - '${smtpConfigKeys.smtpHost}'`);
    }
    validatedConfig.smtpHost = config[smtpConfigKeys.smtpHost];

    if (!config[smtpConfigKeys.smtpPort]) {
        throw new Error(`Invalid config: Missing required field - '${smtpConfigKeys.smtpPort}'`);
    }
    if (isNaN(config[smtpConfigKeys.smtpPort]) || Number(config[smtpConfigKeys.smtpPort]) == 0) {
        throw new Error(
            `Invalid config: Not a valid '${smtpConfigKeys.smtpPort}' - ${config[smtpConfigKeys.smtpPort]}`
        );
    }
    validatedConfig.smtpPort = config[smtpConfigKeys.smtpPort].toString();

    if (!config[smtpConfigKeys.smtpUser]) {
        throw new Error(`Invalid config: Missing required field - '${smtpConfigKeys.smtpUser}'`);
    }
    validatedConfig.smtpUser = config[smtpConfigKeys.smtpUser];

    if (!config[smtpConfigKeys.smtpPwd]) {
        throw new Error(`Invalid config: Missing required field - '${smtpConfigKeys.smtpPwd}'`);
    }
    validatedConfig.smtpPwd = config[smtpConfigKeys.smtpPwd];

    if (!config[smtpConfigKeys.smtpSenderMail]) {
        throw new Error(`Invalid config: Missing required field - '${smtpConfigKeys.smtpSenderMail}'`);
    }
    if (!utils.validateEmail(config[smtpConfigKeys.smtpSenderMail])) {
        throw new Error(`Invalid config: Invalid email - ${config[smtpConfigKeys.smtpSenderMail]}`);
    }
    validatedConfig.smtpSenderMail = config[smtpConfigKeys.smtpSenderMail];

    if (!config[smtpConfigKeys.smtpRecipientMail]) {
        throw new Error(`Invalid config: Missing required field - '${smtpConfigKeys.smtpRecipientMail}'`);
    }
    if (!utils.validateEmail(config[smtpConfigKeys.smtpRecipientMail])) {
        throw new Error(`Invalid config: Invalid email - ${config[smtpConfigKeys.smtpRecipientMail]}`);
    }
    validatedConfig.smtpRecipientMail = config[smtpConfigKeys.smtpRecipientMail];

    if (!config[smtpConfigKeys.smtpNotifyTime]) {
        throw new Error(`Invalid config: Missing required field - '${smtpConfigKeys.smtpNotifyTime}'`);
    }
    if (config[smtpConfigKeys.smtpNotifyTime].indexOf(':') == -1) {
        throw new Error(
            `Invalid config: Invalid ${smtpConfigKeys.smtpNotifyTime} - '${config[smtpConfigKeys.smtpNotifyTime]}'`
        );
    }
    const notifyTime = config[smtpConfigKeys.smtpNotifyTime].split(':');
    const notifyTimeHours = notifyTime[0];
    const notifyTimeMinutes = notifyTime[1];
    if (
        notifyTimeHours.length == 0 ||
        notifyTimeMinutes.length == 0 ||
        notifyTimeHours.length > 2 ||
        notifyTimeMinutes.length > 2
    ) {
        throw new Error(
            `Invalid config: Invalid ${smtpConfigKeys.smtpNotifyTime} - '${config[smtpConfigKeys.smtpNotifyTime]}'`
        );
    }
    if (notifyTimeHours < 0 || notifyTimeHours > 23 || notifyTimeMinutes < 0 || notifyTimeMinutes > 59) {
        throw new Error(
            `Invalid config: Invalid ${smtpConfigKeys.smtpNotifyTime} - '${config[smtpConfigKeys.smtpNotifyTime]}'`
        );
    }
    validatedConfig.smtpNotifyTime = new Date(1970, 1, 1, notifyTimeHours, notifyTimeMinutes);

    return validatedConfig;
};

module.exports = {
    validateInitConfig,
};
