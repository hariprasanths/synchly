const nodemailer = require("nodemailer");
const configstore = require('conf');
const constants = require('./../utils/constants');
const strings = require('./../utils/strings');
const date = require('./../utils/date');
var cron = require('node-cron');

const confStore = new configstore();

const setupConfig = async (isDebug) => {

    const inquirer = require('./inquirer');
    try {
        let config = await inquirer.askConfig();
        config.smtpSetupComplete = true;
        confStore.set(config);
        console.log("SMTP configuration updated successfully.");

        return config;
    } catch (err) {
        console.error("SMTP configuration update failed.");
        console.error(`${err.name}: ${err.message}`);
        console.error('Re run with --config smtp to finish the configuration');
        if(isDebug) {
            console.error("Stacktrace:");
            console.error(err);
        } else {
            console.error(strings.debugModeDesc);
        }
    }
};

let validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

let init = async (smtpConfig = undefined) => {


};

let sendMail = async (subject, htmlBody, smtpConfig = undefined) => {

    
};

let sendMailScheduler = (subject, htmlBody, isDebug) => {

    
}

module.exports = {
    setupConfig,
    validateEmail,
    sendMail,
    sendMailScheduler
}