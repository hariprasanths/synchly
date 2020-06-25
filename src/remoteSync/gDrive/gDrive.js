const { google } = require('googleapis');
const configstore = require('conf');
const fs = require('fs');

const confStore = new configstore();

let drive;

let init = (googleCreds = undefined) => {
    
    if(!googleCreds)
        googleCreds = confStore.store;
    else {
        googleCreds = require(googleCreds.gDriveServiceAccKeyLoc);
    }

    const scopes = [
        'https://www.googleapis.com/auth/drive'
    ];
    const gDriveAuth = new google.auth.JWT(
        googleCreds.client_email, null,
        googleCreds.private_key, scopes
    );
    drive = google.drive({ version: "v3", auth: gDriveAuth });
};

let cloneServiceAccKey = async (serviceKeyLoc) => {

    const googleCreds = require(serviceKeyLoc);
    return await confStore.set(googleCreds);
};

let listFolders = async (gdConfig) => {
    init(gdConfig);
    let res = await drive.files.list({
        q: "mimeType = 'application/vnd.google-apps.folder'"
    });
    const files = res.data.files;
    return files;
}

let uploadFile = async (fileName, filePath) => {
    init();
    let res = await drive.files.create({
        requestBody: {
            name: fileName,
            mimeType: 'application/x-gzip',
            parents: [confStore.get('gDriveParentFolderId')]
        },
        media: {
            mimeType: 'application/x-gzip',
            body: fs.createReadStream(filePath)
        }
    });

    confStore.set({[res.data.name]: res.data.id});
    return res;
}

let deleteFile = async (fileName) => {
    init();
    let fileId = confStore.get(fileName);
    let res = await drive.files.delete({fileId: fileId});
    confStore.delete(fileName);
    return res;
}

module.exports = {
    init,
    cloneServiceAccKey,
    listFolders,
    uploadFile,
    deleteFile
}