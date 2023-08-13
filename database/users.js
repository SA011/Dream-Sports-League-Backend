const { getConnection, release} = require('./connect.js');


const findUserById = 'SELECT * FROM users WHERE user_id = $1::text';
const findUserByIdShow = 'SELECT u.user_id, u.name, u.email, u.team_name, e.name AS favorite_team, u.balance, u.point, u.wildcard, u.triple_point \
                            FROM users u JOIN  epl_teams e ON u.favorite_team = e.id WHERE u.user_id = $1::text';
const findUserByEmail = 'SELECT * FROM users WHERE email = $1::text';
const addUserQuery = 'INSERT INTO \
    users (user_id, name, email, team_name, favorite_team, password, balance, point, wildcard, triple_point) \
    VALUES ($1::text, $2::text, $3::text, $4::text, $5, $6::text, $7, $8, $9, $10)';
const addEmptySquad = 'INSERT INTO squad (user_id) VALUES ($1::text)';


module.exports.userBalance = async (userid) => {
    const pool = await getConnection();
    const res = (await pool.query(findUserById, [userid])).rows;
    release(pool);
    if(res.length == 0)return -1;
    return res[0].balance;
};

module.exports.getUser = async (userid) => {
    const pool = await getConnection();
    const res = (await pool.query(findUserById, [userid])).rows;
    release(pool);
    if(res.length == 0)return null;
    return res[0];
}

module.exports.getUserByEmail = async (email) => {
    const pool = await getConnection();
    const res = (await pool.query(findUserByEmail, [email])).rows;
    release(pool);
    if(res.length == 0)return null;
    return res[0];
}

module.exports.addUser = async (userid, name, email, team_name, favorite_team, password) => {
    const pool = await getConnection();
    const res = await pool.query(addUserQuery, [userid, name, email, team_name, favorite_team, password, 100, 0, 2, 2]);
    if(res.rowCount == 1){
        await pool.query(addEmptySquad, [userid]);
    }
    release(pool);
    return res.rowCount == 1;
}
module.exports.getUserToShow = async (userid) => {
    const pool = await getConnection();
    // console.log(userid);
    const res = (await pool.query(findUserByIdShow, [userid])).rows;
    release(pool);
    if(res.length == 0)return null;
    return res[0];
}
