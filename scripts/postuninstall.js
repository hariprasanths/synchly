const omelette = require('omelette');
const configstore = require('conf');

const confStore = new configstore();
confStore.clear();

const completion = omelette('synchly');

try {
    completion.cleanupShellInitFile();
} catch (err) {
    console.log(err);
}
