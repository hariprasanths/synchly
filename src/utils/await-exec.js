const exec = require('child_process').exec;

const Exec = async (command, options = {log: false, cwd: process.cwd()}) => {
    if (options.log) console.log(command);
    let promise = new Promise((resolve, reject) => {
        exec(command, {...options}, (err, stdout, stderr) => {
            if (err) {
                err.stdout = stdout;
                err.stderr = stderr;
                reject(err);
                return;
            }

            resolve({stdout, stderr});
        });
    });
    return await promise;
};

module.exports = Exec;
