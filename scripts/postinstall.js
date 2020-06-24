const omelette = require('omelette');

const completion = omelette('synchly');

try {
    completion.setupShellInitFile();
} catch (err) {
    console.log(err);
}