const files = require('./../../utils/files');

const gDriveConfigKeys = {
    gDriveServiceAccKeyLoc: 'serviceAccountKeyPath',
};

const validateInitConfig = async (config) => {
    let validatedConfig = {};

    if (!config[gDriveConfigKeys.gDriveServiceAccKeyLoc]) {
        throw new Error(`Invalid config: Missing required field - '${gDriveConfigKeys.gDriveServiceAccKeyLoc}'`);
    }

    if(process.env.USING_DOCKER) {
        config[gDriveConfigKeys.gDriveServiceAccKeyLoc] = `/app/subsystem/${config[gDriveConfigKeys.gDriveServiceAccKeyLoc].replace("/", "")}`
    }

    if (!files.directoryExists(config[gDriveConfigKeys.gDriveServiceAccKeyLoc])) {
        throw new Error(`Invalid config: No such file, '${config[gDriveConfigKeys.gDriveServiceAccKeyLoc]}'`);
    }
    let isFile = files.isFile(config[gDriveConfigKeys.gDriveServiceAccKeyLoc]);
    if (!isFile) {
        throw new Error(`Invalid config: '${config[gDriveConfigKeys.gDriveServiceAccKeyLoc]}' is a directory.`);
    }
    validatedConfig.gDriveServiceAccKeyLoc = config[gDriveConfigKeys.gDriveServiceAccKeyLoc];

    return validatedConfig;
};

module.exports = {
    validateInitConfig,
};
