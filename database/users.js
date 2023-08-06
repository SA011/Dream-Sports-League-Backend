const { pool } = require('./connect.js');


const findUserById = 'SELECT * FROM users WHERE user_id = $1::text';
module.exports.userBalance = async (userid) => {
    const res = (await pool.query(findUserById, [userid])).rows;
    if(res.length == 0)return -1;
    return res[0].balance;
};