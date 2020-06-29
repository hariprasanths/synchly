const backupDb = require('./backup');
var cron = require('node-cron');
const constants = require('./utils/constants');
const strings = require('./utils/strings');
const configstore = require('conf');

const confStore = new configstore();

let cronScheduler = (isDebug) => {
    console.log(strings.synchlyStartedDesc);
    const backupTime = new Date(confStore.get('dbBackupTime'));
    const backupHours = backupTime.getHours();
    const backupMinutes = backupTime.getMinutes();
    const cronExp = `${backupMinutes} ${backupHours} * * *`;
    cron.schedule(cronExp, () => {
        backupDb(isDebug);
    });
};

module.exports = cronScheduler;
