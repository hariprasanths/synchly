const files = require('./../../utils/files');

const sftpConfigKeys = {
    sftpHost: 'host',
    sftpPort: 'port',
    sftpAuthUser: 'username',
    sftpAuthPwd: 'password',
    sftpBackupPath: 'backupPath',
};

const validateInitConfig = async (config) => {
    let validatedConfig = {};

    if (!config[sftpConfigKeys.sftpHost]) {
        throw new Error(`Invalid config: Missing required field - '${sftpConfigKeys.sftpHost}'`);
    }
    validatedConfig.sftpHost = config[sftpConfigKeys.sftpHost];

    if (!config[sftpConfigKeys.sftpPort]) {
        throw new Error(`Invalid config: Missing required field - '${sftpConfigKeys.sftpPort}'`);
    }
    if (isNaN(config[sftpConfigKeys.sftpPort]) || Number(config[sftpConfigKeys.sftpPort]) == 0) {
        throw new Error(
            `Invalid config: Not a valid '${sftpConfigKeys.sftpPort}' - ${config[sftpConfigKeys.sftpPort]}`
        );
    }
    validatedConfig.sftpPort = config[sftpConfigKeys.sftpPort].toString();

    if (!config[sftpConfigKeys.sftpAuthUser]) {
        throw new Error(`Invalid config: Missing required field - '${sftpConfigKeys.sftpAuthUser}'`);
    }
    validatedConfig.sftpAuthUser = config[sftpConfigKeys.sftpAuthUser];

    if (!config[sftpConfigKeys.sftpAuthPwd]) {
        throw new Error(`Invalid config: Missing required field - '${sftpConfigKeys.sftpAuthPwd}'`);
    }
    validatedConfig.sftpAuthPwd = config[sftpConfigKeys.sftpAuthPwd];

    if (!config[sftpConfigKeys.sftpBackupPath]) {
        throw new Error(`Invalid config: Missing required field - '${sftpConfigKeys.sftpBackupPath}'`);
    }
    validatedConfig.sftpBackupPath = config[sftpConfigKeys.sftpBackupPath];

    return validatedConfig;
};

module.exports = {
    validateInitConfig,
};
