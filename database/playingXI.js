const { getConnection , release} = require('./connect.js');


const findPlayingXIByUserIDandMatchID = 'SELECT * FROM epl_playing_xi WHERE user_id = $1::text AND match_id = $2::integer';
const addPlayingXICommand = 'INSERT INTO epl_playing_xi \
        (user_id, match_id, formation, captain, player_1, player_2, player_3, player_4, player_5, player_6, player_7, player_8, player_9, player_10, player_11) \
VALUES ($1::text, $2::integer, $3::text, $4::integer, $5::integer, $6::integer, $7::integer, $8::integer, $9::integer, $10::integer, $11::integer, $12::integer, $13::integer, $14::integer, $15::integer)';

const updatePlayingXICommand = 'UPDATE epl_playing_xi SET \
        formation = $3::text, \
        captain = $4::integer, \
        player_1 = $5::integer, \
        player_2 = $6::integer, \
        player_3 = $7::integer, \
        player_4 = $8::integer, \
        player_5 = $9::integer, \
        player_6 = $10::integer, \
        player_7 = $11::integer, \
        player_8 = $12::integer, \
        player_9 = $13::integer, \
        player_10 = $14::integer, \
        player_11 = $15::integer \
        WHERE user_id = $1::text AND match_id = $2::integer';

const getUsersByMatchAndPlayerCommand = 'SELECT user_id FROM epl_playing_xi WHERE match_id = $1::integer AND \
        (player_1 = $2::integer OR \
            player_2 = $2::integer OR \
            player_3 = $2::integer OR \
            player_4 = $2::integer OR \
            player_5 = $2::integer OR \
            player_6 = $2::integer OR \
            player_7 = $2::integer OR \
            player_8 = $2::integer OR \
            player_9 = $2::integer OR \
            player_10 = $2::integer OR \
            player_11 = $2::integer)';

const getBestXICommand = 'SELECT * FROM epl_playing_xi WHERE user_id = \'EPL\' AND match_id = 0';

async function addPlayingXI(user_id, match_id, players){
    var params = [user_id, match_id, players.formation, players.captain];
    for(var i = 0; i < 11; i++){
        params.push(players.players[i]);
    }
    // console.log(params);
    const pool = await getConnection();
    await pool.query(addPlayingXICommand, params);
    release(pool);
};

async function updatePlayingXI(user_id, match_id, players){
    var params = [user_id, match_id, players.formation, players.captain];
    for(var i = 0; i < 11; i++){
        params.push(players.players[i]);
    }
    const pool = await getConnection();
    await pool.query(updatePlayingXICommand, params);
    release(pool);
};

module.exports.getPlayingXI = async (userid, matchid) => {
    // console.log(userid, matchid);
    const pool = await getConnection();
    const res = (await pool.query(findPlayingXIByUserIDandMatchID, [userid, matchid])).rows;
    release(pool);
    if(res.length != 1)return null;
    return res[0];
};

module.exports.setPlayingXI = async (user_id, match_id, players) => {
    const ret = await this.getPlayingXI(user_id, match_id);
    // console.log(ret);
    if(ret == null || ret.length == 0){
        console.log("Adding Playing XI");
        return await addPlayingXI(user_id, match_id, players);
    }else{
        return await updatePlayingXI(user_id, match_id, players);
    }
}

module.exports.getUsersByMatchAndPlayer = async (match_id, player_id) => {
    const pool = await getConnection();
    const res = (await pool.query(getUsersByMatchAndPlayerCommand, [match_id, player_id])).rows;
    release(pool);
    return res;
}


module.exports.getBestXI = async () => {
    const pool = await getConnection();
    const res = (await pool.query(getBestXICommand)).rows;
    // console.log(res);
    release(pool);
    if(res.length != 1)return null;
    return res[0];
}

