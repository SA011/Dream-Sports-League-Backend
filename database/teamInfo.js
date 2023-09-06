const { getConnection , release} = require('./connect.js');

const findTeamInfo = 'SELECT * FROM epl_teams WHERE id = $1::integer';
const getAllTeamsCommand = 'SELECT * FROM epl_teams';
const updateTeamInfoCommand = 'UPDATE epl_teams SET goal_difference = goal_difference + $2::integer, played = played + $3::integer, win = win + $4::integer, draw = draw + $5::integer, loss = loss + $6::integer WHERE id = $1::integer';
module.exports.getTeamInfo = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(findTeamInfo, [id])).rows;
    release(pool);
    if(res.length != 1)return null;
    return res[0];
}

module.exports.getAllTeams = async () => {
    const pool = await getConnection();
    const res = (await pool.query(getAllTeamsCommand)).rows;
    release(pool);
    return res;
}

module.exports.updateTeamInfo = async (id, goalDiff, cnt) => {
    const pool = await getConnection();
    const res = (await pool.query(updateTeamInfoCommand, [id, goalDiff * cnt, cnt, goalDiff > 0 ? cnt : 0, goalDiff == 0 ? cnt : 0, goalDiff < 0 ? cnt : 0])).rows;
    release(pool);
    return res;
}