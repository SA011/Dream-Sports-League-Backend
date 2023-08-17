const { getConnection,  release} = require('./connect.js');

const findMatchInfo = 'SELECT * FROM matches WHERE id = $1::integer';

const findMatchesByWeek = 'SELECT * FROM matches WHERE week = $1::integer';

const updateSimulatedMatch = 'UPDATE matches SET home_score = $1::integer, away_score = $2::integer, finished = true WHERE id = $3::integer';

module.exports.getMatchInfo = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(findMatchInfo, [id])).rows;
    release(pool);
    if(res.length != 1)return null;
    return res[0];
}

module.exports.getMatchesByWeek = async (week) => {
    const pool = await getConnection();
    const res = (await pool.query(findMatchesByWeek, [week])).rows;
    release(pool);
    return res;
}

module.exports.updateSimulatedMatch = async (home_score, away_score, id) => {
    const pool = await getConnection();
    const res = (await pool.query(updateSimulatedMatch, [home_score, away_score, id])).rows;
    release(pool);
}