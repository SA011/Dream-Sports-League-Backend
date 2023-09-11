const { getConnection,  release} = require('./connect.js');

const findMatchInfo = 'SELECT * FROM matches WHERE id = $1::integer';

const findMatchesByWeek = 'SELECT * FROM matches WHERE game_week = $1::integer';

const updateSimulatedMatch = 'UPDATE matches SET finished = $2::boolean WHERE id = $1::integer';

const getAllMatchesWhichAreNotFinished = 'SELECT * FROM matches WHERE finished = false ORDER BY time';

const getTeamName = 'SELECT name FROM epl_teams WHERE id = $1::integer';

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

module.exports.setMatchFinished = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(updateSimulatedMatch, [id, true])).rows;
    release(pool);
}

module.exports.setMatchUnFinished = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(updateSimulatedMatch, [id, false])).rows;
    release(pool);
}

module.exports.getAllMatchesWhichAreNotFinished = async () => {
    // console.log('getAllMatchesWhichAreNotFinished');
    const pool = await getConnection();
    var res = (await pool.query(getAllMatchesWhichAreNotFinished)).rows;
    
    for(var i = 0; i < res.length; i++){
        const home = (await pool.query(getTeamName, [res[i].home])).rows;
        const away = (await pool.query(getTeamName, [res[i].away])).rows;
        res[i].home = home[0].name;
        res[i].away = away[0].name;
    }
    // console.log(res);
    release(pool);
    return res;
}