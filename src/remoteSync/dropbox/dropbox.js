const {google} = require('googleapis');
const configstore = require('conf');
const fs = require('fs');

let init = (jobName, key, googleCreds = undefined) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    if (!googleCreds) googleCreds = jobConfStore.store;
    else {
        googleCreds = require(googleCreds.gDriveServiceAccKeyLoc);
    }

    const scopes = ['https://www.googleapis.com/auth/drive'];
    const gDriveAuth = new google.auth.JWT(googleCreds.client_email, null, googleCreds.private_key, scopes);
    return (drive = google.drive({version: 'v3', auth: gDriveAuth}));
};

let cloneServiceAccKey = async (jobName, key, serviceKeyLoc) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    const googleCreds = require(serviceKeyLoc);
    return await jobConfStore.set(googleCreds);
};

let listFolders = async (jobName, key, gdConfig) => {
    let drive = init(jobName, key, gdConfig);
    let res = await drive.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder'",
    });
    const files = res.data.files;
    return files;
};

let uploadFile = async (jobName, key, fileName, filePath) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    let drive = init(jobName, key);
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

let deleteFile = async (jobName, key, fileName) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    let drive = init(jobName, key);
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
