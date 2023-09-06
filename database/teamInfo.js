const { getConnection , release} = require('./connect.js');

const findTeamInfo = 'SELECT * FROM epl_teams WHERE id = $1::integer';

module.exports.getTeamInfo = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(findTeamInfo, [id])).rows;
    release(pool);
    if(res.length != 1)return null;
    return res[0];
}