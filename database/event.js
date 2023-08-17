const {getConnection, release} = require('./connect.js');

const findEventsByMatch = 'SELECT * FROM events WHERE match = $1::integer';

module.exports.getEventByMatch = async (match) => {
    const pool = await getConnection();
    const res = (await pool.query(findEventsByMatch, [match])).rows;
    release(pool);
    return res;
};