const replaceAll = (str, find, replace) => {
    return str.replace(new RegExp(find, 'g'), replace);
};

let validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

let createJobsListTable = () => {
    const Table = require('cli-table3');

    const jobInfoTable = new Table({
        head: ['JOB', 'JOB STATUS', 'DB TYPE', 'DB NAME', 'BACKUP TIME', 'REMOTE SYNC', 'SMTP'],
        style: {
            head: ['bold'],
            border: [],
        },
        colWidths: [16, 14, 12, 16, 16, 14, 12],
    });

    return jobInfoTable;
};

module.exports = {
    replaceAll,
    validateEmail,
    createJobsListTable,
};
