const omelette = require('omelette');

const completion = omelette('synchly');

try {
    completion.cleanupShellInitFile();
} catch (err) {
    console.log(err);
}