const { getConnection, release} = require('./connect.js');
const emailValidator = require('deep-email-validator');


const findUserById = 'SELECT * FROM users u JOIN roles r ON u.user_id = r.user_id WHERE u.user_id = $1::text';

const findUserByIdShow = 'SELECT u.user_id, u.name, u.email, u.team_name, e.name AS favorite_team, u.balance, u.point, u.wildcard, u.triple_point \
                            FROM users u JOIN  epl_teams e ON u.favorite_team = e.id WHERE u.user_id = $1::text';

const findUserByEmail = 'SELECT * FROM users WHERE email = $1::text';

const addUserQuery = 'INSERT INTO \
    users (user_id, name, email, team_name, favorite_team, password, balance, point, wildcard, triple_point) \
    VALUES ($1::text, $2::text, $3::text, $4::text, $5, $6::text, $7, $8, $9, $10)';

const addEmptySquad = 'INSERT INTO squad (user_id) VALUES ($1::text)';

const addRoleQuery = 'INSERT INTO roles (user_id, role) VALUES ($1::text, $2::text)';

const addEmptyPlayingXI = 'INSERT INTO epl_playing_xi (user_id, match_id, formation) VALUES ($1::text, $2::integer, $3::text)';

const findUserRoleById = 'SELECT role FROM roles WHERE user_id = $1::text';

const updateUserPointsCommand = 'UPDATE users SET point = point + $1::integer WHERE user_id = $2::text';

const updateUserBalanceCommand = 'UPDATE users SET balance = $1::integer WHERE user_id = $2::text';

const findUsers = 'SELECT u.user_id FROM users u JOIN roles r ON r.user_id = u.user_id WHERE r.role = \'user\'';

async function isEmailValid(email) {
    const valid = await emailValidator.validate(email);
    // return valid.valid;
    return valid.validators.regex.valid;
}


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
module.exports.getUsers = async () => {
    const pool = await getConnection();
    const res = (await pool.query(findUsers)).rows;
    release(pool);
    return res;
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
        await pool.query(addRoleQuery, [userid, 'user']);
        await pool.query(addEmptyPlayingXI, [userid, 0, '4-3-3']);
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

module.exports.getUserRole = async (userid) => {
    const pool = await getConnection();
    const res = (await pool.query(findUserRoleById, [userid])).rows;
    release(pool);
    if(res.length != 1)return null;
    return res[0].role;
}

module.exports.updateUserPoints = async (userids, points) => {
    const pool = await getConnection();
    for(var i = 0; i < userids.length; i++){
        await pool.query(updateUserPointsCommand, [points, userids[i]]);
    }
    release(pool);
}

module.exports.updateUserBalance = async (userid, balance) => {
    const pool = await getConnection();
    const res = await pool.query(updateUserBalanceCommand, [balance, userid]);
    release(pool);
}

module.exports.createUser = async (user_id, name, email, team_name, favorite_team, password) => {
    if(!(await isEmailValid(email)))return null;
    const user = await this.getUser(user_id);
    if(user != null)return null;
    const userByEmail = await this.getUserByEmail(email);
    if(userByEmail != null)return null;

    const added = await this.addUser(user_id, name, email, team_name, favorite_team, password);
    if(!added)return null;
    return await this.getUser(user_id);
}