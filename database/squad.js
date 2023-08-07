const { pool } = require('./connect.js');


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

module.exports.buildSquad = async (userid, userSquad, curBalance) => {
    var params = [];
    for(var position in userSquad){
        userSquad[position].forEach((x) => {
            params.push(x);
        });
    }
    params.push(userid);
    // console.log(params);
    await pool.query(buildSquadCommand, params);
    await pool.query(updateBalance, [curBalance, userid]);
};