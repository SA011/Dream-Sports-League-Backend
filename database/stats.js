const {getConnection, release} = require('./connect.js');

const findAllTeamsInfo = 'SELECT *, (win*3+draw) as points FROM epl_teams ORDER BY points';

const findAllPlayersInfo = 'SELECT * FROM players order by points desc';

module.exports.getAllTeams = async() => {
    const pool = await getConnection();
    const res = (await pool.query(findAllTeamsInfo)).rows;
    release(pool);
    return res;
}

module.exports.getAllPlayers = async() => {
    const pool = await getConnection();
    const res = (await pool.query(findAllPlayersInfo)).rows;
    release(pool);
    return res;
}

