const {google} = require('googleapis');
const configstore = require('conf');
const fs = require('fs');

let init = (jobName, googleCreds = undefined) => {
    const jobConfStore = new configstore({configName: jobName});
    if (!googleCreds) googleCreds = jobConfStore.store;
    else {
        googleCreds = require(googleCreds.gDriveServiceAccKeyLoc);
    }

    const scopes = ['https://www.googleapis.com/auth/drive'];
    const gDriveAuth = new google.auth.JWT(googleCreds.client_email, null, googleCreds.private_key, scopes);
    return drive = google.drive({version: 'v3', auth: gDriveAuth});
};

let cloneServiceAccKey = async (jobName, serviceKeyLoc) => {
    const jobConfStore = new configstore({configName: jobName});
    const googleCreds = require(serviceKeyLoc);
    return await jobConfStore.set(googleCreds);
};

let listFolders = async (jobName, gdConfig) => {
    let drive = init(jobName, gdConfig);
    let res = await drive.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder'",
    });
    const files = res.data.files;
    return files;
};

let uploadFile = async (jobName, fileName, filePath) => {
    const jobConfStore = new configstore({configName: jobName});
    let drive = init(jobName);
    let res = await drive.files.create({
        requestBody: {
            name: fileName,
            mimeType: 'application/x-gzip',
            parents: [jobConfStore.get('gDriveParentFolderId')],
        },
        media: {
            mimeType: 'application/x-gzip',
            body: fs.createReadStream(filePath),
        },
    });

    jobConfStore.set({[res.data.name]: res.data.id});
    return res;
};

let deleteFile = async (jobName, fileName) => {
    const jobConfStore = new configstore({configName: jobName});
    let drive = init(jobName);
    let fileId = jobConfStore.get(fileName);
    let res = await drive.files.delete({fileId: fileId});
    jobConfStore.delete(fileName);
    return res;
};

module.exports = {
    init,
    cloneServiceAccKey,
    listFolders,
    uploadFile,
    deleteFile,
};
