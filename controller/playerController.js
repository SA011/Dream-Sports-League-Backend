const playerDatabase = require('../database/players.js');

module.exports.allPlayerWithPosition = async (request, response) => {
    const { position } = request.params;
    // console.log(position);
    // console.log(await playerDatabase.getPlayerByPosition(position));
    response.send(await playerDatabase.getPlayerByPosition(position));
};