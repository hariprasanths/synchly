const path = require('path');
const configstore = require('conf');
const constants = require('./utils/constants');
const strings = require('./utils/strings');
const files = require('./utils/files');
const db = require('./database/database');
const remoteSync = require('./remoteSync/remoteSync');
const smtp = require('./smtp/smtp');
const database = require('./database/database');
const ora = require('ora');

const dtf = new Intl.DateTimeFormat('en', {year: 'numeric', month: '2-digit', day: '2-digit'});

function isFirstSunday(date) {
    return date.getDay() == 0 && date.getDate() <= 7 ? true : false;
}

function getBackupDirName(jobName, date, isInstant) {
    let [{value: mo}, , {value: da}, , {value: ye}] = dtf.formatToParts(date);
    let backupDir;
    if (!isInstant) {
        backupDir = `${jobName}${constants.DB_BACKUP_DIR_PREFIX}${mo}-${da}-${ye}`;
    } else {
        backupDir = `${jobName}${constants.DB_MANUAL_BACKUP_DIR_PREFIX}${mo}-${da}-${ye}`;
    }
    return backupDir;
}

let backupDatabase = async (jobName, key) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfObj = jobConfStore.store;
    let deletedBackups = [];

    const remoteSyncEnabled = jobConfObj.remoteSyncEnabled;

    const currentDate = new Date();
    const newBackupDir = getBackupDirName(jobName, currentDate);
    const backupPath = jobConfObj.dbBackupPath;
    const newBackupPath = path.join(backupPath, newBackupDir);

    const dbNoOfDays = Number(jobConfObj.dbNoOfDays);
    const dbNoOfWeeks = Number(jobConfObj.dbNoOfWeeks);
    const dbNoOfMonths = Number(jobConfObj.dbNoOfMonths);

    let dbDump = await db.dump(jobName, key, newBackupPath);

    let oldBackupDirs = [];
    if (currentDate.getDay() == 0) {
        const deletionWeek = new Date(currentDate);

        let dbNoOfDaysMod = dbNoOfDays;
        if (dbNoOfDays % 7 != 0) {
            dbNoOfDaysMod = dbNoOfDays + (7 - (dbNoOfDays % 7));
        }

        const deletionWeekDate = dbNoOfWeeks * 7 + dbNoOfDaysMod;
        deletionWeek.setDate(currentDate.getDate() - deletionWeekDate);
        if (!isFirstSunday(deletionWeek)) {
            oldBackupDirs.push(getBackupDirName(jobName, deletionWeek));
        }

        const deletionMonth = new Date(currentDate);
        const deletionMonthDate = dbNoOfMonths * 28 + dbNoOfWeeks * 7 + dbNoOfDaysMod;
        deletionMonth.setDate(currentDate.getDate() - deletionMonthDate);
        oldBackupDirs.push(getBackupDirName(jobName, deletionMonth));
    }

    const deletionDay = new Date(currentDate);
    deletionDay.setDate(currentDate.getDate() - dbNoOfDays);
    if (deletionDay.getDay() != 0) {
        oldBackupDirs.push(getBackupDirName(jobName, deletionDay));
    }

    for (let j = 0; j < oldBackupDirs.length; j++) {
        let oldBackupPath = path.join(backupPath, oldBackupDirs[j]);
        if (files.directoryExists(oldBackupPath)) {
            let deleteOldDump = await files.deleteFile(oldBackupPath);

            deletedBackups.push(oldBackupDirs[j]);
        }
    }

    try {
        if (remoteSyncEnabled) {
            let remoteUploadResp = await remoteSync.uploadFile(jobName, key, newBackupDir, newBackupPath);
            for (let j = 0; j < deletedBackups.length; j++) {
                let remoteDeleteResp = await remoteSync.deleteFile(jobName, key, deletedBackups[j]);
            }
        }
    } catch (err) {
        err.isRemoteError = true;
        throw err;
    }

    return deletedBackups;
};

let backupCheck = async (jobName, key, isDebug) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const jobConfObj = jobConfStore.store;
    const dbBackupPath = jobConfObj.dbBackupPath;
    const smtpEnabled = jobConfObj.smtpEnabled;

    if (!files.directoryExists(dbBackupPath)) {
        console.error(`db: Given directory "${dbBackupPath}" for storing local backups does not exist.`);
        return;
    }

    let deletedBackups = [];
    const currentDate = new Date();
    const newBackupDir = getBackupDirName(jobName, currentDate);
    try {
        deletedBackups = await backupDatabase(jobName, key);

        const statusReportLog = strings.statusReportLog(jobName, key, true, deletedBackups, undefined, true, undefined);
        console.log(statusReportLog);

        if (smtpEnabled) {
            const htmlBody = strings.statusReportTemplate(
                jobName,
                key,
                true,
                deletedBackups,
                undefined,
                true,
                undefined
            );
            smtp.sendMailScheduler(jobName, key, 'Daily Status Report', htmlBody, isDebug);
        }
    } catch (err) {
        let statusReportLog;
        if (err.isRemoteError) {
            statusReportLog = strings.statusReportLog(jobName, key, true, deletedBackups, undefined, false, err);
        } else {
            statusReportLog = strings.statusReportLog(jobName, key, false, [], err, false, undefined);
        }

        console.log(statusReportLog);

        if (smtpEnabled) {
            let htmlBody;
            if (err.isRemoteError) {
                htmlBody = strings.statusReportTemplate(jobName, key, true, deletedBackups, undefined, false, err);
            } else {
                htmlBody = strings.statusReportTemplate(jobName, key, false, [], err, false, undefined);
            }
            smtp.sendMailScheduler(jobName, key, 'Daily Status Report', htmlBody, isDebug);
        }
    }
};

let instantBackup = async (jobName, key, isDebug) => {
    let instantBackupStatus = ora('Backup in progress, please wait...');
    try {
        const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
        const jobConfObj = jobConfStore.store;
        const remoteSyncEnabled = jobConfObj.remoteSyncEnabled;
        const backupPath = jobConfObj.dbBackupPath;
        const currentDate = new Date();
        const backupFileName = getBackupDirName(jobName, currentDate, true);
        const absoluteBackupPath = path.join(backupPath, backupFileName);
        instantBackupStatus.start();
        await database.dump(jobName, key, absoluteBackupPath);
        if (remoteSyncEnabled) {
            await remoteSync.uploadFile(jobName, key, backupFileName, absoluteBackupPath);
        }
        instantBackupStatus.succeed('Success');
    } catch (err) {
        instantBackupStatus.fail('Failed');
        if (isDebug) {
            console.error('Stacktrace:');
            console.error(err);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

module.exports = {
    backupCheck,
    instantBackup,
};
