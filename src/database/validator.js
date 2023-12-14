const files = require('./../utils/files');

const dbConfigKeys = {
    dbType: 'databaseType',
    dbAuthUser: 'username',
    dbAuthPwd: 'password',
    dbHost: 'host',
    dbPort: 'port',
    dbName: 'databaseName',
    dbCert: 'databaseCertificate',
    dbAuthSource: 'authSource',
    dbBackupPath: 'backupPath',
    dbIsCompressionEnabled: 'enableCompression',
    dbBackupTime: 'backupTime',
    dbNoOfDays: 'noOfDailies',
    dbNoOfWeeks: 'noOfWeeklies',
    dbNoOfMonths: 'noOfMonthlies',
};

const validateInitConfig = async (config) => {
    let validatedConfig = {};

    if (!config[dbConfigKeys.dbType]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbType}'`);
    }
    if (!['MongoDB', 'MySQL', 'PostgreSQL'].includes(config[dbConfigKeys.dbType])) {
        throw new Error(`Invalid config: Unrecognised '${dbConfigKeys.dbType}' - ${config[dbConfigKeys.dbType]}`);
    }
    validatedConfig.dbType = config[dbConfigKeys.dbType];

    if (!config[dbConfigKeys.dbAuthUser]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbAuthUser}'`);
    }
    validatedConfig.dbAuthUser = config[dbConfigKeys.dbAuthUser];

    if (!config[dbConfigKeys.dbAuthPwd]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbAuthPwd}'`);
    }
    validatedConfig.dbAuthPwd = config[dbConfigKeys.dbAuthPwd];

    if (!config[dbConfigKeys.dbHost]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbHost}'`);
    }
    validatedConfig.dbHost = config[dbConfigKeys.dbHost];

    if (!config[dbConfigKeys.dbPort]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbPort}'`);
    }
    if (isNaN(config[dbConfigKeys.dbPort]) || Number(config[dbConfigKeys.dbPort]) == 0) {
        throw new Error(`Invalid config: Not a valid '${dbConfigKeys.dbPort}' - ${config[dbConfigKeys.dbPort]}`);
    }
    validatedConfig.dbPort = config[dbConfigKeys.dbPort].toString();

    if (!config[dbConfigKeys.dbName]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbName}'`);
    }
    validatedConfig.dbName = config[dbConfigKeys.dbName];

    if (validatedConfig.dbType == 'PostgreSQL') {
        if (!config[dbConfigKeys.dbCert]) {
            throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbAuthSource}'`);
        }
        validatedConfig.dbCert = config[dbConfigKeys.dbCert];
    }

    if (validatedConfig.dbType == 'MongoDB') {
        if (!config[dbConfigKeys.dbAuthSource]) {
            throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbAuthSource}'`);
        }
    }
    validatedConfig.dbAuthSource = config[dbConfigKeys.dbAuthSource];

    if (!config[dbConfigKeys.dbBackupPath]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbBackupPath}'`);
    }
    if (!files.directoryExists(config[dbConfigKeys.dbBackupPath])) {
        throw new Error(`Invalid config: No such directory, '${config[dbConfigKeys.dbBackupPath]}'`);
    }
    let isFile = files.isFile(config[dbConfigKeys.dbBackupPath]);
    if (isFile) {
        throw new Error(`Invalid config: '${config[dbConfigKeys.dbBackupPath]}' is a file.`);
    }
    validatedConfig.dbBackupPath = config[dbConfigKeys.dbBackupPath];

    if (!config.hasOwnProperty(dbConfigKeys.dbIsCompressionEnabled)) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbIsCompressionEnabled}'`);
    }
    if (typeof config[dbConfigKeys.dbIsCompressionEnabled] != 'boolean') {
        throw new Error(
            `Invalid config: Expected a boolean but got a '${typeof config[
                dbConfigKeys.dbIsCompressionEnabled
            ]}' for the field '${dbConfigKeys.dbIsCompressionEnabled}'`
        );
    }
    validatedConfig.dbIsCompressionEnabled = config[dbConfigKeys.dbIsCompressionEnabled];

    if (!config[dbConfigKeys.dbBackupTime]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbBackupTime}'`);
    }
    if (config[dbConfigKeys.dbBackupTime].indexOf(':') == -1) {
        throw new Error(
            `Invalid config: Invalid ${dbConfigKeys.dbBackupTime} - '${config[dbConfigKeys.dbBackupTime]}'`
        );
    }
    const backupTime = config[dbConfigKeys.dbBackupTime].split(':');
    const backupTimeHours = backupTime[0];
    const backupTimeMinutes = backupTime[1];
    if (
        backupTimeHours.length == 0 ||
        backupTimeMinutes.length == 0 ||
        backupTimeHours.length > 2 ||
        backupTimeMinutes.length > 2
    ) {
        throw new Error(
            `Invalid config: Invalid ${dbConfigKeys.dbBackupTime} - '${config[dbConfigKeys.dbBackupTime]}'`
        );
    }
    if (backupTimeHours < 0 || backupTimeHours > 23 || backupTimeMinutes < 0 || backupTimeMinutes > 59) {
        throw new Error(
            `Invalid config: Invalid ${dbConfigKeys.dbBackupTime} - '${config[dbConfigKeys.dbBackupTime]}'`
        );
    }
    validatedConfig.dbBackupTime = new Date(1970, 1, 1, backupTimeHours, backupTimeMinutes);

    if (!config[dbConfigKeys.dbNoOfDays]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbNoOfDays}'`);
    }
    if (isNaN(config[dbConfigKeys.dbNoOfDays]) || Number(config[dbConfigKeys.dbNoOfDays]) == 0) {
        throw new Error(
            `Invalid config: Not a valid Number - ${config[dbConfigKeys.dbNoOfDays]} for the field '${
                dbConfigKeys.dbNoOfDays
            }'`
        );
    }
    validatedConfig.dbNoOfDays = config[dbConfigKeys.dbNoOfDays].toString();

    if (!config[dbConfigKeys.dbNoOfWeeks]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbNoOfWeeks}'`);
    }
    if (isNaN(config[dbConfigKeys.dbNoOfWeeks]) || Number(config[dbConfigKeys.dbNoOfWeeks]) == 0) {
        throw new Error(
            `Invalid config: Not a valid Number - ${config[dbConfigKeys.dbNoOfWeeks]} for the field '${
                dbConfigKeys.dbNoOfWeeks
            }'`
        );
    }
    validatedConfig.dbNoOfWeeks = config[dbConfigKeys.dbNoOfWeeks].toString();

    if (!config[dbConfigKeys.dbNoOfMonths]) {
        throw new Error(`Invalid config: Missing required field - '${dbConfigKeys.dbNoOfMonths}'`);
    }
    if (isNaN(config[dbConfigKeys.dbNoOfMonths]) || Number(config[dbConfigKeys.dbNoOfMonths]) == 0) {
        throw new Error(
            `Invalid config: Not a valid Number - ${config[dbConfigKeys.dbNoOfMonths]} for the field '${
                dbConfigKeys.dbNoOfMonths
            }'`
        );
    }
    validatedConfig.dbNoOfMonths = config[dbConfigKeys.dbNoOfMonths].toString();

    return validatedConfig;
};

module.exports = {
    validateInitConfig,
};
