const inquirer = require('inquirer');

let askConfig = async () => {
    let questions = [];
    questions.push({
        name: 'encryptionKey',
        type: 'password',
        message: 'Enter the key for encryption',
        mask: true,
        validate: function (value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter the key for encryption';
            }
        },
    });
    let secureConfig;
    secureConfig = await inquirer.prompt(questions);
    return secureConfig;
};

let askConfirmation = async () => {
    let questions = [];
    questions.push({
        name: 'encryptionKey',
        type: 'password',
        message: 'Enter the encryption key',
        mask: true,
    });
    questions.push({
        type: 'confirm',
        name: 'disableConfirmation',
        message: 'Are you sure you want to disable the encryption globally ?',
    });
    let disableConfirmation;
    disableConfirmation = await inquirer.prompt(questions);
    return disableConfirmation;
};

module.exports = {
    askConfig,
    askConfirmation,
};
