const {getConnection, release} = require('./connect.js');

const findLeaguesOfUser = 'SELECT * FROM friends_league f JOIN friends_league_members m ON f.id = m.fl_id WHERE m.user_id = $1::text';

const findAllLeagues = 'SELECT * FROM friends_league';

const findLeagueByID = 'SELECT * FROM friends_league WHERE id = $1::integer';

const addLeagueCommand = 'INSERT INTO friends_league \
        (name, min_teams, max_teams, start_date, matchdays, match_time, timezone, team_player_count, auto_join) \
        VALUES ($1::text, $2::integer, $3::integer, $4::date, $5::text[], $6::time, $7::text, $8::integer, $9::boolean) RETURNING *';

const addMemberCommand = 'INSERT INTO friends_league_members \
        (fl_id, user_id, role) \
        VALUES ($1::integer, $2::text, $3::text) RETURNING *';
const removeMemberCommand = 'DELETE FROM friends_league_members WHERE fl_id = $1::integer AND user_id = $2::text';

const removeAllMembersCommand = 'DELETE FROM friends_league_members WHERE fl_id = $1::integer';

const deleteLeagueCommand = 'DELETE FROM friends_league WHERE id = $1::integer';

const updateLeagueCommand = 'UPDATE friends_league SET \
        name = $2::text, \
        min_teams = $3::integer, \
        max_teams = $4::integer, \
        start_date = $5::date, \
        matchdays = $6::text[], \
        match_time = $7::time, \
        timezone = $8::text, \
        team_player_count = $9::integer, \
        auto_join = $10::boolean \
        WHERE id = $1::integer RETURNING *';

const getLeagueMembersCommand = 'SELECT * FROM friends_league_members WHERE fl_id = $1::integer';

const getLeagueMembersWithUserCommand = 'SELECT * FROM friends_league_members m JOIN users u ON m.user_id = u.user_id WHERE fl_id = $1::integer AND (role = \'member\' OR role = \'admin\')';

const getLeagueRequestsCommand = 'SELECT * FROM friends_league_members WHERE fl_id = $1::integer AND role = \'request\'';

const updateRoleCommand = 'UPDATE friends_league_members SET role = $3::text WHERE fl_id = $1::integer AND user_id = $2::text';

const deleteAllMatchesCommand = 'DELETE FROM fl_matches WHERE friends_league = $1::integer';

const addMatchesCommand = 'INSERT INTO fl_matches \
        (friends_league, home, away, time, scoreline) \
        VALUES ($1::integer, $2::text, $3::text, $4::timestamp, $5::text) RETURNING *';

const getMatchByIdCommand = 'SELECT * FROM fl_matches WHERE id = $1::integer';

const updateScoreCommand = 'UPDATE fl_matches SET scoreline = $2::text WHERE id = $1::integer RETURNING *';

const getPlayingXICommand = 'SELECT * FROM fl_playing_xi WHERE match_id = $1::integer AND user_id = $2::text';

const addPlayingXICommand = 'INSERT INTO fl_playing_xi \
        (match_id, user_id, formation, captain, player_1, player_2, player_3, player_4, player_5, player_6, player_7, player_8, player_9, player_10, player_11, player_12, player_13, player_14, player_15, player_16) \
        VALUES ($1::integer, $2::text, $3::text, $4::integer, $5::integer, $6::integer, $7::integer, $8::integer, $9::integer, $10::integer, $11::integer, $12::integer, $13::integer, $14::integer, $15::integer, $16::integer, $17::integer, $18::integer, $19::integer, $20::integer) RETURNING *';

const deletePlayingXICommand = 'DELETE FROM fl_playing_xi WHERE match_id = $1::integer AND user_id = $2::text';

const getMatchesCommand = 'SELECT * FROM fl_matches WHERE friends_league = $1::integer';

const getMatchesOfUserCommand = 'SELECT * FROM fl_matches WHERE friends_league = $1::integer AND (home = $2::text OR away = $2::text)';

const getUserRoleCommand = 'SELECT role FROM friends_league_members WHERE fl_id = $1::integer AND user_id = $2::text';

module.exports.getFriendsLeaguesOfUser = async (user_id) => {
    const pool = await getConnection();
    const res = (await pool.query(findLeaguesOfUser, [user_id])).rows;
    release(pool);
    return res;
}


module.exports.getAllFriendsLeagues = async () => {
    const pool = await getConnection();
    const res = (await pool.query(findAllLeagues)).rows;
    release(pool);
    return res;
}


module.exports.getFriendsLeagueByID = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(findLeagueByID, [id])).rows;
    release(pool);
    if(res == null || res.length != 1)return null;
    return res[0];
}

module.exports.createFriendsLeague = async (params) => {
    // console.log(params);
    const pool = await getConnection();
    const res = (await pool.query(addLeagueCommand, params.slice(1))).rows;
    // console.log(res);
    if(res == null || res.length != 1){
        release(pool);
        return false;
    }
    const ret = (await pool.query(addMemberCommand, [res[0].id, params[0], 'admin'])).rows;
    release(pool);
    return res[0];
}


module.exports.joinFriendsLeague = async (user_id, id) => {
    const pool = await getConnection();
    const res = (await pool.query(addMemberCommand, [id, user_id, 'member'])).rows;
    release(pool);
    return res;
}

module.exports.requestFriendsLeague = async (user_id, id) => {
    const pool = await getConnection();
    const res = (await pool.query(addMemberCommand, [id, user_id, 'request'])).rows;
    release(pool);
    return res;
}

module.exports.leaveFriendsLeague = async (user_id, id) => {
    const pool = await getConnection();
    const res = (await pool.query(removeMemberCommand, [id, user_id])).rows;
    release(pool);
    return res;
}

module.exports.deleteFriendsLeague = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(removeAllMembersCommand, [id])).rows;
    const res2 = (await pool.query(deleteLeagueCommand, [id])).rows;
    const res3 = (await pool.query(deleteAllMatchesCommand, [id])).rows;
    release(pool);
    return res2;
}

module.exports.updateFriendsLeague = async (id, params) => {
    // console.log(params);
    const pool = await getConnection();
    const res = (await pool.query(updateLeagueCommand, [id].concat(params))).rows;
    release(pool);
    return res;
}

module.exports.getFriendsLeagueTeams = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(getLeagueMembersWithUserCommand, [id])).rows;
    release(pool);
    return res;
}

module.exports.getFriendsLeagueRequests = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(getLeagueRequestsCommand, [id])).rows;
    release(pool);
    return res;
}

module.exports.handleFriendsLeagueRequest = async (id, user_id, status) => {
    // console.log(id, user_id, status);
    var res = null;
    const pool = await getConnection();
    if(status.toLowerCase() == 'accept'){
        res = (await pool.query(updateRoleCommand, [id, user_id, 'member'])).rows;
    }
    if(status.toLowerCase() == 'reject'){
        res = (await pool.query(removeMemberCommand, [id, user_id])).rows;
    }
    release(pool);
    return res;
} 

module.exports.deleteAllMatches = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(deleteAllMatchesCommand, [id])).rows;
    release(pool);
    return res;
}

module.exports.addMatches = async (id, matches) => {
    const pool = await getConnection();
    var res = [];
    for(var i = 0; i < matches.length; i++){
        res.push((await pool.query(addMatchesCommand, [id, matches[i].home, matches[i].away, matches[i].time, matches[i].scoreline])).rows);
    }
    release(pool);
    return res;
}

module.exports.getMatchById = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(getMatchByIdCommand, [id])).rows;
    release(pool);
    if(res == null || res.length != 1)return null;
    return res[0];
}

module.exports.updateScore = async (id, score) => {
    const pool = await getConnection();
    const res = (await pool.query(updateScoreCommand, [id, score])).rows;
    release(pool);
    return res;
}

module.exports.getPlayingXI = async (match_id, user_id) => {
    const pool = await getConnection();
    const res = (await pool.query(getPlayingXICommand, [match_id, user_id])).rows;
    release(pool);
    if(res == null || res.length != 1)return null;
    return res[0];
}
module.exports.deletePlayingXI = async (match_id, user_id) => {
    const pool = await getConnection();
    const res = (await pool.query(deletePlayingXICommand, [match_id, user_id])).rows;
    release(pool);
    return res;
}

module.exports.addPlayingXI = async (user_id, match_id, formation, captain, players) => {
    var params = [match_id, user_id, formation, captain];
    for(var i = 0; i < players.length; i++){
        params.push(players[i]);
    }
    while(params.length < 20){
        params.push(null);
    }
    const current = await this.getPlayingXI(match_id, user_id);
    if(current != null){
        const res = await this.deletePlayingXI(match_id, user_id);
    }
    
    const pool = await getConnection();
    const res = (await pool.query(addPlayingXICommand, params)).rows;
    release(pool);
    return res;
}

module.exports.getMatches = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(getMatchesCommand, [id])).rows;
    release(pool);
    return res;
}

module.exports.getMatchesOfUser = async (id, user_id) => {
    const pool = await getConnection();
    const res = (await pool.query(getMatchesOfUserCommand, [id, user_id])).rows;
    release(pool);
    return res;
}

module.exports.getRole = async (id, user_id) => {
    const pool = await getConnection();
    const res = (await pool.query(getUserRoleCommand, [id, user_id])).rows;
    release(pool);
    if(res == null || res.length != 1)return null;
    return res[0].role;
}