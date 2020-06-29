const getMinutes = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return minutes + hours * 60;
};

const isBetween = (date, intialDate, finalDate) => {
    const dateMinutes = getMinutes(date);
    const initialDateMinutes = getMinutes(intialDate);
    const finalDateMinutes = getMinutes(finalDate);

    return dateMinutes >= initialDateMinutes && dateMinutes <= finalDateMinutes;
};

module.exports = {
    getMinutes,
    isBetween,
};
