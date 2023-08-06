const playerDatabase = require('../database/players.js');

module.exports.allPlayerWithPosition = async (request, response) => {
    var { position } = request.params;
    const dict = {
        "goalkeeper": "GK",
        "defender": "DEF",
        "midfielder": "MID",
        "forward": "FWD"
    };
    position = dict[position];
    const ret = await playerDatabase.getPlayerByPosition(position);
    response.send(ret);
};