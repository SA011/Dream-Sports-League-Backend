const { getConnection , release} = require('./connect.js');


const buildSquadCommand = 'UPDATE squad SET \
    goalkeeper_1 = $1,\
    goalkeeper_2 = $2,\
    defender_1 = $3,\
    defender_2 = $4,\
    defender_3 = $5,\
    defender_4 = $6,\
    defender_5 = $7,\
    midfielder_1 = $8,\
    midfielder_2 = $9,\
    midfielder_3 = $10,\
    midfielder_4 = $11,\
    midfielder_5 = $12,\
    forward_1 = $13,\
    forward_2 = $14,\
    forward_3 = $15,\
    forward_4 = $16 \
    WHERE user_id = $17::text'

const updateBalance = 'UPDATE users SET \
    balance = $1 \
    WHERE user_id = $2::text'

const getSquadCommand = 'SELECT * FROM squad WHERE user_id = $1::text'


const updateWildCardCommand = 'UPDATE users SET wildcard = $1::integer WHERE user_id = $2::text'

module.exports.buildSquad = async (userid, userSquad, curBalance) => {
    var params = [];
    for(var position in userSquad){
        userSquad[position].forEach((x) => {
            params.push(x);
        });
    }
    params.push(userid);
    // console.log(params);
    const pool = await getConnection();
    await pool.query(buildSquadCommand, params);
    await pool.query(updateBalance, [curBalance, userid]);
    release(pool);
};

module.exports.getSquad = async (userid) => {
    const pool = await getConnection();
    const res = (await pool.query(getSquadCommand, [userid])).rows;
    release(pool);
    if(res.length != 1)return null;
    return res[0];
}

module.exports.updatePlayer = async (userid, oldplayerid, newplayerid) => {
    // console.log(userid);
    const squad = await this.getSquad(userid);
    // console.log(squad);
    // console.log(oldplayerid);
    // console.log(newplayerid);
    for(var position in squad){
        if(position == 'user_id')continue;
        if(squad[position] == newplayerid){
            return false;
        }
    }
    var pos = null;
    for(var position in squad){
        if(position == 'user_id')continue;
        if(squad[position] == oldplayerid){
            pos = position;
        }
    }
    if(pos == null)return false;
    // console.log(pos);
    const pool = await getConnection();

    const updatePlayerCommand = `UPDATE squad SET ${pos} = $1::integer WHERE user_id = $2::text`;
    await pool.query(updatePlayerCommand, [newplayerid, userid]);
    release(pool);
    return true;
}

module.exports.updateWildCard = async (userid, wildcard) => {
    const pool = await getConnection();
    await pool.query(updateWildCardCommand, [wildcard, userid]);
    release(pool);
    return true;
}
