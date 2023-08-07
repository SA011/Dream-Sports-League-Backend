const playerDatabase = require('../database/players.js');

const positionNameConverter = {
    "goalkeeper": "GK",
    "defender": "DEF",
    "midfielder": "MID",
    "forward": "FWD"
};

const invertPositionNameConverter = {
    "GK": "goalkeeper",
    "DEF": "defender",
    "MID": "midfielder",
    "FWD": "forward"
};
module.exports.allPlayerWithPosition = async (request, response) => {
    var { position } = request.params;
    position = positionNameConverter[position];
    const ret = await playerDatabase.getPlayerByPosition(position);
    response.send(ret);
};

module.exports.getPlayerPosition = async (playerid) => {
    // console.log(playerid);
    res = (await playerDatabase.getPlayerById(playerid));
    if(res.length == 0)return 'none';
    return invertPositionNameConverter[res[0].position];
};

module.exports.playerPrice = async (playerid) => {
    res = (await playerDatabase.getPlayerById(playerid));
    if(res.length == 0)return -1;
    return res[0].price;
};
