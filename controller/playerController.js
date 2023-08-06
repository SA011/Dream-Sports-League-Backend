const playerDatabase = require('../database/players.js');

const positiveNameConverter = {
    "goalkeeper": "GK",
    "defender": "DEF",
    "midfielder": "MID",
    "forward": "FWD"
};
module.exports.allPlayerWithPosition = async (request, response) => {
    var { position } = request.params;
    position = positiveNameConverter[position];
    const ret = await playerDatabase.getPlayerByPosition(position);
    response.send(ret);
};

module.exports.validPlayer = async (playerid) => {
    res = (await playerDatabase.getPlayerById(playerid));
    if(res.length == 0)return 'none';
    return res[0].position;
};

module.exports.playerPrice = async (playerid) => {
    res = (await playerDatabase.getPlayerById(playerid));
    if(res.length == 0)return -1;
    return res[0].price;
};
