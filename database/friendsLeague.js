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

const getLeagueMembersWithUserCommand = 'SELECT * FROM friends_league_members m JOIN users u ON m.user_id = u.user_id WHERE fl_id = $1::integer';

const getLeagueRequestsCommand = 'SELECT * FROM friends_league_members WHERE fl_id = $1::integer AND role = \'request\'';

const updateRoleCommand = 'UPDATE friends_league_members SET role = $3::text WHERE fl_id = $1::integer AND user_id = $2::text';

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
    release(pool);
    return res2;
}

module.exports.updateFriendsLeague = async (id, params) => {
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

