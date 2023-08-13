const { request } = require('express');
const userDatabase = require('../database/users.js');

module.exports.getBalance = async (userid) => {
    return await userDatabase.userBalance(userid);
};

module.exports.getUserInfo = async (request, response) => {
    try {
        const {user_id} = request.user;
        const user = await userDatabase.getUserToShow(user_id);
        // console.log(user);
        response.send(user);
    } catch (error) {
        response.status(400);
    }
}
