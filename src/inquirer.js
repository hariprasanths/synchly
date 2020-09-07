const inquirer = require('inquirer');

let askResetConfirmation = async (jobName) => {
    let questions = [];

    questions.push({
        type: 'confirm',
        name: 'resetConfirmation',
        message: `Are you sure you want to clear all the saved configurations for the job '${jobName}'?`,
    });

    return await inquirer.prompt(questions);
};

module.exports = {
    askResetConfirmation,
};
