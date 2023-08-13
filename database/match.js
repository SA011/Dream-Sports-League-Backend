const { getConnection,  release} = require('./connect.js');

const findMatchInfo = 'SELECT * FROM matches WHERE id = $1::integer';

module.exports.getMatchInfo = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(findMatchInfo, [id])).rows;
    release(pool);
    if(res.length != 1)return null;
    return res[0];
}