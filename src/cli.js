const arg = require('arg');
const constants = require('./utils/constants');
const strings = require('./utils/strings');
const db = require('./database/database');
const remoteSync = require('./remoteSync/remoteSync');
const smtp = require('./smtp/smtp');
const backupScheduler = require('./backupScheduler');
const configstore = require('conf');
const packageJson = require('./../package.json');
const files = require('./utils/files');
const inquirer = require('./inquirer');
const utils = require('./utils/utils');
const cipher = require('./cipher/cipher');
const keytar = require('keytar');
const backupDb = require('./backup');
const { isKeytarSupported } = require('./utils/isEncrypted');

const defaultJobName = 'master';

const parseArgumentsIntoOptions = (rawArgs) => {
    const args = arg(
        {
            '--config': String,
            '--disable': String,
            '--debug': Boolean,
            '--disablejob': Boolean,
            '--enable': String,
            '--enablejob': Boolean,
            '--file': String,
            '--help': Boolean,
            '--job': String,
            '--jobs': Boolean,
            '--restore': Boolean,
            '--reset': Boolean,
            '--run': Boolean,
            '--start': Boolean,
            '--stacktrace': Boolean,
            '--version': Boolean,
            //Aliases
            '-c': '--config',
            '-d': '--disable',
            '-D': '--debug',
            '-e': '--enable',
            '-f': '--file',
            '-h': '--help',
            '-j': '--job',
            '-R': '--restore',
            '-r': '--reset',
            '-S': '--stacktrace',
            '-v': '--version',
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        config: args['--config'],
        debug: args['--stacktrace'] || args['--debug'],
        disablejob: args['--disablejob'],
        disable: args['--disable'],
        enable: args['--enable'],
        enablejob: args['--enablejob'],
        file: args['--file'],
        help: args['--help'],
        job: args['--job'],
        jobs: args['--jobs'],
        restore: args['--restore'],
        reset: args['--reset'],
        run: args['--run'],
        start: args['--start'],
        version: args['--version'],
    };
};

const configAllowedArgs = ['db', 'remote-sync', 'smtp'];
const modAllowedArgs = ['cipher', 'remote-sync', 'smtp'];

const cli = async (args) => {
    let dbStatus;

    let options;
    try {
        options = parseArgumentsIntoOptions(args);
    } catch (err) {
        console.error(`${err.name}: ${err.message}`);
        console.log(strings.usageInfo);
        return;
    }

    const isDebug = options.debug;
    try {
        if (options.version) {
            console.log(`${constants.PACKAGE_NAME} ${packageJson.version}`);
            return;
        }

        if (options.help) {
            console.log(strings.helpDesc);
            return;
        }
        
        const keytarSupported = await isKeytarSupported();
        const key = keytarSupported ?
            await keytar.getPassword(strings.serviceName, strings.accountName)
            :
            null;

        const confStore = new configstore();
        const jobName = options.job || defaultJobName;
        let jobConfStore = new configstore({ configName: jobName, encryptionKey: key });
        const jobConfigObj = jobConfStore.store;

        if (options.reset) {
            const resetConfirm = await inquirer.askResetConfirmation(jobName);
            if (resetConfirm.resetConfirmation) {
                console.log(`Resetting configurations for the job '${jobName}`);
                jobConfStore.clear();
                confStore.delete(jobName);
                console.log('Success');
                return;
            } else {
                return;
            }
        }

        if (options.jobs) {
            printJobsList(key);
        }

        if (
            !options.config &&
            !options.disablejob &&
            !options.disable &&
            !options.enablejob &&
            !options.enable &&
            !options.file &&
            !options.help &&
            !options.jobs &&
            !options.restore &&
            !options.reset &&
            !options.run &&
            !options.start &&
            !options.version
        ) {
            console.log(strings.usageInfo);
            return;
        }

        if (options.config) {
            if (configAllowedArgs.indexOf(options.config) == -1) {
                console.error(`Unknown or unexpected argument: ${options.config}`);
                console.error(`Allowed arguments are ${configAllowedArgs}`);
            }
        }

        if(options.file && process.env.USING_DOCKER) {
            options.file = `/app/subsystem/${options.file.replace("/", "")}`
        }

        if (!options.config && options.file) {
            console.error(strings.fileWoConfigArg);
            return;
        }

        if (options.enable || options.disable) {
            let givenArg;
            if (options.enable) givenArg = options.enable;
            else givenArg = options.disable;
            if (modAllowedArgs.indexOf(givenArg) == -1) {
                console.error(`Unknown or unexpected argument: ${givenArg}`);
                console.error(`Allowed arguments are ${modAllowedArgs}`);
            }
        }

        if (options.config && options.file) {
            if (options.file.length) {
                if (!files.directoryExists(options.file)) {
                    console.error(`No Such file, '${options.file}'`);
                    return;
                }
                let isFile = files.isFile(options.file);
                if (!isFile) {
                    console.log(`'${options.file}' is a directory.`);
                    return;
                }
            } else {
                return 'Flag --file requires the absolute path of the config init file as an argument.';
            }
        }

        if (options.config == 'db') {
            let dbSetupRes = await db.setupConfig(jobName, key, isDebug, options.file);
            if (dbSetupRes) {
                let enableJobRes = await enableJob(jobName, key, isDebug);
            }
        } else if (options.config == 'remote-sync') {
            let remoteSetupRes = await remoteSync.setupConfig(jobName, key, isDebug, options.file);
        } else if (options.config == 'smtp') {
            let smtpSetupRes = await smtp.setupConfig(jobName, key, isDebug, options.file);
        }

        if (options.enable == 'remote-sync') {
            if (!jobConfigObj.remoteSetupComplete) {
                console.log('Finish the remote sync configuration below before enabling');
                let remoteSetupRes = await remoteSync.setupConfig(jobName, key, isDebug);
                if (remoteSetupRes) {
                    console.log(`Enabling module 'remote-sync'`);
                    jobConfStore.set('remoteSyncEnabled', true);
                    console.log('Success');
                }
            } else if (jobConfigObj.remoteSyncEnabled) {
                console.log(`Module 'remote-sync' already enabled`);
            } else {
                console.log(`Enabling module 'remote-sync'`);
                jobConfStore.set('remoteSyncEnabled', true);
                console.log('Success');
            }
        } else if (options.enable == 'smtp') {
            if (!jobConfigObj.smtpSetupComplete) {
                console.log('Finish the smtp configuration below before enabling');
                let smtpSetupRes = await smtp.setupConfig(jobName, key, isDebug);
                if (smtpSetupRes) {
                    console.log(`Enabling module 'smtp'`);
                    jobConfStore.set('smtpEnabled', true);
                    console.log('Success');
                }
            } else if (jobConfigObj.smtpEnabled) {
                console.log(`Module 'smtp' already enabled`);
            } else {
                console.log(`Enabling module 'smtp'`);
                jobConfStore.set('smtpEnabled', true);
                console.log('Success');
            }
        } else if (options.enable == 'cipher') {
            let securitySetup = null;
            let config = confStore.store;
            if (!config.isEncrypted) {
                securitySetup = await cipher.setupConfig(isDebug);
            } else {
                console.log('Encyrption already enabled');
            }
        }

        if (options.disable == 'remote-sync') {
            if (!jobConfigObj.remoteSyncEnabled) {
                console.log(`Module 'remote-sync' already disabled`);
            } else {
                console.log(`Disabling module 'remote-sync'`);
                jobConfStore.set('remoteSyncEnabled', false);
                console.log('Success');
            }
        } else if (options.disable == 'smtp') {
            if (!jobConfigObj.smtpEnabled) {
                console.log(`Module 'smtp' already disabled`);
            } else {
                console.log(`Disabling module 'smtp'`);
                jobConfStore.set('smtpEnabled', false);
                console.log('Success');
            }
        } else if (options.disable == 'cipher') {
            let config = confStore.store;
            let deleteConfig;
            if (config.isEncrypted) {
                deleteConfig = await cipher.deleteConfig(key);
            } else {
                console.log('Encryption already disabled');
            }
        }

        if (options.enablejob) {
            let enableJobRes = await enableJob(jobName, key, isDebug);
        }

        if (options.disablejob) {
            if (!jobConfigObj.dbSetupComplete) {
                console.error(`Job '${jobName}' does not exist!`);
            } else if (!confStore.get(`${jobName}.enabled`)) {
                console.log(`Job '${jobName} already disabled`);
            } else {
                console.log(`Disabling job '${jobName}`);
                confStore.set(`${jobName}.enabled`, false);
                console.log('Success');
            }
        }
        if (options.run) {
            if (!jobConfigObj.dbSetupComplete) {
                console.error(`Job '${jobName}' does not exist!`);
            } else {
                await backupDb.instantBackup(jobName, key, isDebug);
            }
        }
        if (options.start) {
            const jobNamesConfig = confStore.store;
            let jobNames = [];
            for (let j in jobNamesConfig) {
                if (jobNamesConfig[j].enabled) jobNames.push(j);
            }
            backupScheduler(jobNames, key, isDebug);
        }

        if (options.restore) {
            let restoreSetup;
            if (jobConfigObj.dbSetupComplete) {
                restoreSetup = await db.setupRestore(jobName, key, isDebug);
            } else {
                console.log('Finish the db configuration before restoring from a backup');
            }
        }
    } catch (err) {
        console.error(`${err.name}: ${err.message}`);
        if (isDebug) {
            console.error('Stacktrace:');
            console.error(err);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

const enableJob = async (jobName, key, isDebug) => {
    const confStore = new configstore();
    const jobConfStore = new configstore({ configName: jobName, encryptionKey: key });
    const jobConfigObj = jobConfStore.store;

    if (!jobConfigObj.dbSetupComplete) {
        console.log('Finish the db configuration below before enabling a job');
        let dbSetup = await db.setupConfig(jobName, isDebug);
        if (dbSetup) {
            console.log(`Enabling job '${jobName}'`);
            confStore.set(`${jobName}.enabled`, true);
            console.log('Success');
        }
    } else if (confStore.get(`${jobName}.enabled`)) {
        console.log(`Job '${jobName}' already enabled`);
    } else {
        console.log(`Enabling job '${jobName}'`);
        confStore.set(`${jobName}.enabled`, true);
        console.log('Success');
    }
};

const printJobsList = (key) => {
    let jobsListTable = utils.createJobsListTable();
    const confStore = new configstore();
    const jobNamesConfig = confStore.store;
    const statusEnabled = strings.moduleStatusEnabled;
    const statusDisabled = strings.moduleStatusDisabled;
    for (let currentJob in jobNamesConfig) {
        if (currentJob == 'isEncrypted') {
            continue;
        }
        const jobConfStore = new configstore({ configName: currentJob, encryptionKey: key });
        const jobConfObj = jobConfStore.store;
        const currJobStatus = jobNamesConfig[currentJob].enabled == true ? statusEnabled : statusDisabled;
        const remoteSyncStatus = jobConfObj.remoteSyncEnabled == true ? statusEnabled : statusDisabled;
        const smtpStatus = jobConfObj.smtpEnabled == true ? statusEnabled : statusDisabled;
        const backupTime = new Date(jobConfObj.dbBackupTime).toTimeString().match(/([0-9]+:[0-9]+)/)[1];
        const backupTimeTz = new Date(jobConfObj.dbBackupTime).toString().match(/([A-Z]+[\+-][0-9]+)/)[1];
        const backupTimeString = `${backupTime} ${backupTimeTz}`;
        jobsListTable.push([
            currentJob,
            currJobStatus,
            jobConfObj.dbType,
            jobConfObj.dbName,
            backupTimeString,
            remoteSyncStatus,
            smtpStatus,
        ]);
    }

    console.log(jobsListTable.toString());
};

module.exports = {
    cli,
};
