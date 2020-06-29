const exec = require('child_process').exec;

function Exec(command, options = {log: false, cwd: process.cwd()}) {
    if (options.log) console.log(command);

    return new Promise((resolve, reject) => {
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
}

module.exports = Exec;
