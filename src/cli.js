const arg = require('arg');
const constants = require('./utils/constants');
const strings = require('./utils/strings');
const db = require('./database/database');
const remoteSync = require('./remoteSync/remoteSync');
const smtp = require('./smtp/smtp');
const backupScheduler = require('./backupScheduler');
const configstore = require('conf');
const packageJson = require('./../package.json');

const confStore = new configstore();

const parseArgumentsIntoOptions = (rawArgs) => {
    const args = arg(
        {
            '--enable': String,
            '--disable': String,
            '--config': String,
            '--start': Boolean,
            '--stacktrace': Boolean,
            '--debug': Boolean,
            '--reset': Boolean,
            '--version': Boolean,
            '--help': Boolean,
            '-c': '--config',
            '-v': '--version',
            '-h': '--help',
            '-r': '--reset',
            '-e': '--enable',
            '-d': '--disable',
            '-S': '--stacktrace',
            '-D': '--debug',
        },
        {
            argv: rawArgs.slice(2),
        }
    );
    return {
        config: args['--config'],
        enable: args['--enable'],
        disable: args['--disable'],
        start: args['--start'],
        debug: args['--stacktrace'] || args['--debug'],
        version: args['--version'],
        help: args['--help'],
        reset: args['--reset'],
    };
};

const configAllowedArgs = ['db', 'remote-sync', 'smtp'];
const modAllowedArgs = ['remote-sync', 'smtp'];

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

        if (options.reset) {
            confStore.clear();
            console.log(strings.resetSuccessLog);
            return;
        }

        if (
            !options.start &&
            !options.disable &&
            !options.enable &&
            !options.help &&
            !options.version &&
            !options.config &&
            !options.reset
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
        if (options.enable || options.disable) {
            let givenArg;
            if (options.enable) givenArg = options.enable;
            else givenArg = options.disable;
            if (modAllowedArgs.indexOf(givenArg) == -1) {
                console.error(`Unknown or unexpected argument: ${givenArg}`);
                console.error(`Allowed arguments are ${modAllowedArgs}`);
            }
        }

        if (options.config == 'db') {
            let dbSetupRes = await db.setupConfig(isDebug);
        } else if (options.config == 'remote-sync') {
            let remoteSetupRes = await remoteSync.setupConfig(isDebug);
        } else if (options.config == 'smtp') {
            let smtpSetupRes = await smtp.setupConfig(isDebug);
        }

        const configObj = confStore.store;

        if (options.enable == 'remote-sync') {
            if (!configObj.remoteSetupComplete) {
                console.log('Finish the remote sync configuration below before enabling');
                let remoteSetupRes = await remoteSync.setupConfig(isDebug);
                if (remoteSetupRes) {
                    console.log('remote-sync enabled');
                    confStore.set('remoteSyncEnabled', true);
                }
            } else {
                console.log('remote-sync enabled');
                confStore.set('remoteSyncEnabled', true);
            }
        } else if (options.enable == 'smtp') {
            if (!configObj.smtpSetupComplete) {
                console.log('Finish the smtp configuration below before enabling');
                let smtpSetupRes = await smtp.setupConfig(isDebug);
                if (smtpSetupRes) {
                    console.log('smtp enabled');
                    confStore.set('smtpEnabled', true);
                }
            } else {
                console.log('smtp enabled');
                confStore.set('smtpEnabled', true);
            }
        }

        if (options.disable == 'remote-sync') {
            console.log('remote-sync disabled');
            confStore.set('remoteSyncEnabled', false);
        } else if (options.disable == 'smtp') {
            console.log('smtp disabled');
            confStore.set('smtpEnabled', false);
        }

        if (options.start) {
            if (!configObj.dbSetupComplete) {
                console.log('Finish the db configuration below before starting an instance');
                let dbSetup = await db.setupConfig(isDebug);
                if (dbSetup) {
                    backupScheduler(isDebug);
                }
            } else {
                backupScheduler(isDebug);
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

module.exports = {
    cli,
};
