const {getConnection, release} = require('./connect.js');
const squadController = require('../controller/squadController.js');

const findAllTeamsInfo = 'SELECT *, (win*3+draw) as points FROM epl_teams ORDER BY points';

const findAllPlayersInfo = 'SELECT p.*, t.name as team FROM players p join epl_teams t on p.team=t.id order by points desc';

const findFantasyStandings = 'SELECT u.user_id, u.name, u.team_name, u.point FROM users u JOIN roles r ON r.user_id = u.user_id WHERE r.role = \'user\'';

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
    var res = (await pool.query(findFantasyStandings)).rows;
    release(pool);
    // console.log(res);
    for(var i = 0; i < res.length; i++){
        var user = res[i];
        var worth = 0;
        const squad = await squadController.getSquad(user.user_id, 0);
        // console.log(squad);
        squad.players.goalkeepers.forEach((player, index) => {
            worth += player.price;
        });
        squad.players.defenders.forEach((player, index) => {
            worth += player.price;
        });
        squad.players.midfielders.forEach((player, index) => {
            worth += player.price;
        });
        squad.players.forwards.forEach((player, index) => {
            worth += player.price;
        });
        user.worth = worth;
        // console.log(user);
        res[i] = user;
    }
    // console.log(res);
    return res;
}

