const userDatabase = require('../database/users.js');
const levelDatabase = require('../database/level.js');
module.exports.getBalance = async (userid) => {
    return await userDatabase.userBalance(userid);
};

module.exports.getUserInfo = async (request, response) => {
    try {
        const {user_id} = request.user;
        var user = await userDatabase.getUserToShow(user_id);
        // console.log(user);
        const userLevel = await levelDatabase.getLevel(user.points);
        user.level = userLevel;
        response.send(user);
    } catch (error) {
        response.status(400);
    }
}
