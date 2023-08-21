const {getConnection, release} = require('./connect.js');
const playerDatabase = require('./players.js');


const findEventsByMatch = 'SELECT * FROM events WHERE match_id = $1::integer';

const catagoryPointQuery = 'SELECT * FROM categories WHERE category = $1::text';
module.exports.getEventByMatch = async (match) => {
    const pool = await getConnection();
    const res = (await pool.query(findEventsByMatch, [match])).rows;
    release(pool);
    return res;
};

module.exports.getScoreLine = async (matchInfo) => {
    const pool = await getConnection();
    const res = (await pool.query(findEventsByMatch, [matchInfo.id])).rows;
    release(pool);
    console.log(res);
    var score = {
        home: 0,
        away: 0
    }

    for(var i = 0; i < res.length; i++){
        if(res[i].category == 'GOAL'){
            const player_team_id = (await playerDatabase.getPlayerById(res[i].player_id)).team;
            console.log(player_team_id);
            if(player_team_id == matchInfo.home){
                score.home++;
            }else if(player_team_id == matchInfo.away){
                score.away++;
            }
        }else if(res[i].category == 'OWN_GOAL'){
            const player_team_id = await playerDatabase.getPlayerById(res[i].player_id).team;
            if(player_team_id == matchInfo.home){
                score.away++;
            }else if(player_team_id == matchInfo.away){
                score.home++;
            }
        }
    }

    return score;
}

module.exports.getPoints = async (category) => {
    const pool = await getConnection();
    const res = (await pool.query(catagoryPointQuery, [category])).rows;
    console.log(res);
    release(pool);
    if(res.length != 1)return null;
    return res[0].points;
}