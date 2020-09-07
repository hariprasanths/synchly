const backupDb = require('./backup');
const cron = require('node-cron');
const constants = require('./utils/constants');
const strings = require('./utils/strings');
const configstore = require('conf');

let cronScheduler = (jobNames, isDebug) => {
    console.log(strings.synchlyStartedDesc);
    
    for(let i in jobNames) {
        const currentJob = jobNames[i];
        const jobConfStore = new configstore({configName: currentJob});
        const jobConfObj = jobConfStore.store;

        console.log(strings.jobConfigsLog(currentJob, jobConfObj));
        const backupTime = new Date(jobConfObj.dbBackupTime);
        const backupHours = backupTime.getHours();
        const backupMinutes = backupTime.getMinutes();
        const cronExp = `${backupMinutes} ${backupHours} * * *`;
        cron.schedule(cronExp, () => {
            backupDb(currentJob, isDebug);
        });
    }

    console.log(`Started ${jobNames.length} job(s)`)
    if(jobNames.length == 0)
        console.log(strings.enableJobsWarning)
};

module.exports = cronScheduler;
