const fs = require('fs');

const isGzip = function (path) {
    let buffer = fs.readFileSync(path);
    if (!buffer || buffer.length < 3) {
        return false;
    }

    return buffer[0] === 0x1f && buffer[1] === 0x8b && buffer[2] === 0x08;
};

module.exports = isGzip;
