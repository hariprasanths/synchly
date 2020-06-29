const path = require('path');
const configstore = require('conf');
const constants = require('./utils/constants');
const strings = require('./utils/strings');
const files = require('./utils/files');
const db = require('./database/database');
const remoteSync = require('./remoteSync/remoteSync');
const smtp = require('./smtp/smtp');

const confStore = new configstore();

const dtf = new Intl.DateTimeFormat('en', {year: 'numeric', month: '2-digit', day: '2-digit'});

function isFirstSunday(date) {
    return date.getDay() == 0 && date.getDate() <= 7 ? true : false;
}

function getBackupDirName(date) {
    let [{value: mo}, , {value: da}, , {value: ye}] = dtf.formatToParts(date);
    const backupDir = `${constants.DB_BACKUP_DIR_PREFIX}${mo}-${da}-${ye}`;
    return backupDir;
}

let deletedBackups = [];
let isRemoteError = false;

let backupDatabase = async () => {
    const confObj = confStore.store;
    deletedBackups = [];
    isRemoteError = false;

    const remoteSyncEnabled = confObj.remoteSyncEnabled;

    const currentDate = new Date();
    const newBackupDir = getBackupDirName(currentDate);
    const backupPath = confObj.dbBackupPath;
    const newBackupPath = path.join(backupPath, newBackupDir);

    const dbNoOfDays = Number(confObj.dbNoOfDays);
    const dbNoOfWeeks = Number(confObj.dbNoOfWeeks);
    const dbNoOfMonths = Number(confObj.dbNoOfMonths);

    let dbDump = await db.dump(newBackupPath);

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
            oldBackupDirs.push(getBackupDirName(deletionWeek));
        }

        const deletionMonth = new Date(currentDate);
        const deletionMonthDate = dbNoOfMonths * 28 + dbNoOfWeeks * 7 + dbNoOfDaysMod;
        deletionMonth.setDate(currentDate.getDate() - deletionMonthDate);
        oldBackupDirs.push(getBackupDirName(deletionMonth));
    }

    const deletionDay = new Date(currentDate);
    deletionDay.setDate(currentDate.getDate() - dbNoOfDays);
    if (deletionDay.getDay() != 0) {
        oldBackupDirs.push(getBackupDirName(deletionDay));
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
            let remoteUploadResp = await remoteSync.uploadFile(newBackupDir, newBackupPath);
            for (let j = 0; j < deletedBackups.length; j++) {
                let remoteDeleteResp = await remoteSync.deleteFile(deletedBackups[j]);
            }
        }
    } catch (err) {
        isRemoteError = true;
        throw err;
    }

    return deletedBackups;
};

let backupCheck = async (isDebug) => {
    const confObj = confStore.store;
    const dbBackupPath = confObj.dbBackupPath;
    const smtpEnabled = confObj.smtpEnabled;

    if (!files.directoryExists(dbBackupPath)) {
        console.error(`db: Given directory "${dbBackupPath}" for storing local backups does not exist.`);
        return;
    }

    const currentDate = new Date();
    const newBackupDir = getBackupDirName(currentDate);
    try {
        let cDate = new Date();
        let deletedBackups = await backupDatabase(cDate);

        const statusReportLog = strings.statusReportLog(true, deletedBackups, undefined, true, undefined);
        console.log(statusReportLog);

        if (smtpEnabled) {
            const htmlBody = strings.statusReportTemplate(true, deletedBackups, undefined, true, undefined);
            smtp.sendMailScheduler('Daily Status Report', htmlBody, isDebug);
        }
    } catch (err) {
        let statusReportLog;
        if (isRemoteError) {
            statusReportLog = strings.statusReportLog(true, deletedBackups, undefined, false, err);
        } else {
            statusReportLog = strings.statusReportLog(false, [], err, false, undefined);
        }

        console.log(statusReportLog);

        if (smtpEnabled) {
            let htmlBody;
            if (isRemoteError) {
                htmlBody = strings.statusReportTemplate(true, deletedBackups, undefined, false, err);
            } else {
                htmlBody = strings.statusReportTemplate(false, [], err, false, undefined);
            }
            smtp.sendMailScheduler('Daily Status Report', htmlBody, isDebug);
        }
    }
};

module.exports = backupCheck;
