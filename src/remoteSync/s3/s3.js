const AWS = require('aws-sdk');
const configstore = require('conf');
const fs = require('fs');

let init = (jobName, key, awsCreds = undefined) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    if (!awsCreds) awsCreds = jobConfStore.store;
    else {
        awsCreds = require(awsCreds.s3AccKeyLoc);
    }
    const s3Auth = new AWS.S3({accessKeyId: awsCreds.aws_access_key_id, secretAccessKey: awsCreds.aws_secret_access_key, region: awsCreds.region});
    return s3Auth;
};

let cloneServiceAccKey = async (jobName, key, serviceKeyLoc) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    console.log(serviceKeyLoc);
    const awsCreds = require(serviceKeyLoc);
    return await jobConfStore.set(awsCreds);
};

let listFolders = async (jobName, key, s3Config) => {
    let s3 = init(jobName, key, s3Config);
    const s3params = {
        Bucket: s3Config.s3ParentBucket,
        MaxKeys: 20,
        Delimiter: '/',
    };
    const folders = await s3.listObjectsV2(s3params).promise()
    let folder = new Array();
    for(let i=0;i<folders.CommonPrefixes.length;i++){
        var json = new Object();
        json.Name = folders.CommonPrefixes[i].Prefix;
        folder.push(json);
    }
    return folder;
};

let listBuckets = async (jobName, key, s3Config) => {
    let s3 = init(jobName, key, s3Config);
    const { Buckets } = await s3.listBuckets().promise();
    return Buckets;
};

let uploadFile = async (jobName, key, fileName, filePath) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    let s3 = init(jobName, key);
    const fileContent = fs.readFileSync(filePath);

    const params = {
        Bucket: jobConfStore.get('s3ParentBucket'),
        Key: jobConfStore.get('s3ParentFolder')+'/'+fileName,
        Body: fileContent
    };
    const res = await s3.upload(params).promise();
    console.log(res)
    //jobConfStore.set({[res.data.name]: res.data.id});
    return res;
};

let deleteFile = async (jobName, key, fileName) => {
    const jobConfStore = new configstore({configName: jobName, encryptionKey: key});
    let s3 = init(jobName, key);
    const params = {
        Bucket: jobConfStore.get('s3ParentBucket'),
        Key: jobConfStore.get('s3ParentFolder')+'/'+fileName,
    };
    let res = await s3.deleteObject(params).promise();
    jobConfStore.delete(fileName);
    return res;
};

module.exports = {
    init,
    cloneServiceAccKey,
    listFolders,
    listBuckets,
    uploadFile,
    deleteFile,
};
