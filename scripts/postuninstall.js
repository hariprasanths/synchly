const omelette = require('omelette');
const configstore = require('conf');
const files = require('./../src/utils/files');

const confStore = new configstore();

const jobNamesConfig = confStore.store;
let jobNames = [];
for (let j in jobNamesConfig) {
    if(jobNamesConfig[j].enabled)
        jobNames.push(j);
}

for (let i in jobNames) {
    const jobConfStore = new configstore({configName: jobNames[i]});
    files.deleteFile(jobConfStore.path);
}

confStore.clear();

const completion = omelette('synchly');

try {
    completion.cleanupShellInitFile();
} catch (err) {
    console.log(err);
}
