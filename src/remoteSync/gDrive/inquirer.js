const inquirer = require('inquirer');
const files = require('../../utils/files');
const gDrive = require('./gDrive');
const ora = require('ora');
const configstore = require('conf');

const confStore = new configstore();

let askConfig = async () => {

    const configObj = confStore.store;

    let questions = [];
    questions.push({
        name: 'gDriveServiceAccKeyLoc',
        type: 'input',
        message: 'Enter the absolute path of the service account key file:',
        default: configObj.gDriveServiceAccKeyLoc,
        validate: function (value) {
            if (value.length) {
                if(!files.directoryExists(value)) {
                    return `No Such file, '${value}'`;
                }
                let isFile = files.isFile(value);
                if (!isFile) {
                    return `'${value}' is a directory.`;
                }
                return true;
            } else {
                return 'Please enter the absolute path of the service account key file.';
            }
        }
    });

    let gdConfig = await inquirer.prompt(questions);

    let remoteStatus;
    let folders;
    try {
        remoteStatus = ora('Authenticating you, please wait...');
        remoteStatus.start();
        folders = await gDrive.listFolders(gdConfig);
        remoteStatus.succeed("Authentication success");
    } catch (e) {
        remoteStatus.fail("Authentication failed");
        throw e;
    }

    folders = folders.map(f => { return { name: f.name, value: f.id } });

    let retObj = await inquirer.prompt({
        type: 'list',
        name: 'gDriveParentFolderId',
        message: 'Choose the remote folder in which backups will be stored:',
        choices: folders,
        default: 0,
        pageSize: 4
    });

    retObj = Object.assign(retObj, gdConfig);

    let cloneKeyRes = await gDrive.cloneServiceAccKey(gdConfig.gDriveServiceAccKeyLoc);
    return retObj;
};

module.exports = {
    askConfig
}