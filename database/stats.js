const {getConnection, release} = require('./connect.js');

const findAllTeamsInfo = 'SELECT *, (win*3+draw) as points FROM epl_teams ORDER BY points';

const findAllPlayersInfo = 'SELECT * FROM players order by points desc';

const findFantasyStandings = 'SELECT u.name, u.team_name, u.point FROM users u JOIN roles r ON r.user_id = u.user_id WHERE r.role = \'user\'';

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

module.exports.getFantasyStandings = async() => {
    const pool = await getConnection();
    const res = (await pool.query(findFantasyStandings)).rows;
    release(pool);
    return res;
}

