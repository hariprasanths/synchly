const files = require('./../../utils/files');

const s3ConfigKeys = {
    s3AccKeyLoc: 's3CredentialsFilePath',
};

const validateInitConfig = async (config) => {
    let validatedConfig = {};

    if (!config[s3ConfigKeys.s3AccKeyLoc]) {
        throw new Error(`Invalid config: Missing required field - '${s3ConfigKeys.s3AccKeyLoc}'`);
    }
    if (!files.directoryExists(config[s3ConfigKeys.s3AccKeyLoc])) {
        throw new Error(`Invalid config: No such file, '${config[s3ConfigKeys.s3AccKeyLoc]}'`);
    }
    let isFile = files.isFile(config[s3ConfigKeys.s3AccKeyLoc]);
    if (!isFile) {
        throw new Error(`Invalid config: '${config[s3ConfigKeys.s3AccKeyLoc]}' is a directory.`);
    }
    validatedConfig.s3AccKeyLoc = config[s3ConfigKeys.s3AccKeyLoc];

    return validatedConfig;
};

module.exports = {
    validateInitConfig,
};
