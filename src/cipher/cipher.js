const keytar = require('keytar');
const configstore = require('conf');
const inquirer = require('./inquirer');
const ora = require('ora');
const strings = require('../utils/strings');
const { isKeytarSupported } = require('../utils/isEncrypted');
const setupConfig = async (isDebug) => {
    let secureConfig;
    const confStore = new configstore();
    const config = confStore.store;
    const keytarSupported = await isKeytarSupported();
    if (!keytarSupported) {
        console.error('Encryption is not supported on this system');
        return;
    }
    let setupConfigStatus = ora('Encrypting the configurations, please wait...');
    try {
        secureConfig = await inquirer.askConfig();
        let setKey;
        setupConfigStatus.start();
        setKey = await keytar.setPassword(strings.serviceName, strings.accountName, secureConfig.encryptionKey);
        await enableConfig(config);
        setupConfigStatus.succeed('Success');
        confStore.set('isEncrypted', true);
    } catch (err) {
        setupConfigStatus.fail('Failed');
        console.error('Encryption failed.');
        console.error('Re run with --enable crypt to finish the encryption');
        if (isDebug) {
            console.error('Stacktrace:');
            console.error(err);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

const enableConfig = async (config) => {
    const keytarSupported = await isKeytarSupported();
    if (!keytarSupported) {
        console.error('Encryption is not supported on this system');
        return;
    }
    let key;
    key = await keytar.getPassword(strings.serviceName, strings.accountName);
    for (let currentJob in config) {
        if (currentJob == 'isEncrypted') {
            continue;
        }
        let jobConfStore = new configstore({configName: currentJob, encryptionKey: null});
        let jobConfigObj = jobConfStore.store;
        jobConfStore = new configstore({configName: currentJob, encryptionKey: key});
        jobConfStore.set(jobConfigObj);
    }
};

const deleteConfig = async (key) => {
    const keytarSupported = await isKeytarSupported();
    if (!keytarSupported) {
        console.error('Encryption is not supported on this system');
        return;
    }
    let confStore = new configstore();
    let config = confStore.store;
    let deleteConfigStatus = ora('Decrypting the configurations, please wait...');
    let userPermission;
    try {
        userPermission = await inquirer.askConfirmation();
        deleteConfigStatus.start();
        if (userPermission.encryptionKey !== key) {
            console.log('Authentication error');
            throw {
                name: 'Authentication failed',
                message: 'wrong encryption key',
            };
        }
        if (userPermission.disableConfirmation) {
            await keytar.deletePassword(strings.serviceName, strings.accountName);
            config.isEncrypted = false;
            confStore.set(config);
            for (let currentJob in config) {
                if (currentJob == 'isEncrypted') {
                    continue;
                }
                let jobConfStore = new configstore({configName: currentJob, encryptionKey: key});
                let jobConfigObj = jobConfStore.store;
                jobConfStore = new configstore({configName: currentJob, encryptionKey: null});
                jobConfigObj.backupEncryptionEnabled = false;
                jobConfStore.set(jobConfigObj);
            }
            deleteConfigStatus.succeed('Success');
        } else {
            deleteConfigStatus.succeed('Cancelled');
        }
    } catch (err) {
        deleteConfigStatus.fail('Failed');
        throw err;
    }
};

module.exports = {
    setupConfig,
    enableConfig,
    deleteConfig,
};
