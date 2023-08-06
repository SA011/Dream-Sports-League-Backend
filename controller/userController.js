const userDatabase = require('../database/users.js');

module.exports.getBalance = async (userid) => {
    return await userDatabase.userBalance(userid);
};