const replaceAll = (str, find, replace) => {
    return str.replace(new RegExp(find, 'g'), replace);
};

module.exports = {
    replaceAll,
};
