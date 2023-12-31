module.exports.getCurrentTime = (timeZone) => {
    const add = parseFloat(timeZone.slice(3));
    const date = new Date();
    date.setSeconds(date.getSeconds() + (add - 6) * 3600);
    return date;
}

module.exports.convertTime = (date, time) => {
    const t = time.split(':');
    date.setHours(date.getHours() + t[0]);
    if(t.length > 1){
        date.setMinutes(date.getMinutes() + t[1]);
    }
    if(t.length > 2){
        date.setSeconds(date.getSeconds() + t[2]);
    }

    return date;
}

module.exports.getDate = (date) => {
    // console.log(date);
    var ret = new Date(date);
    return ret;
}

module.exports.weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
