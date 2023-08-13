const playerDatabase = require('../database/players.js');

const positionNameConverter = {
    "goalkeepers": "GK",
    "defenders": "DEF",
    "midfielders": "MID",
    "forwards": "FWD"
};

const invertPositionNameConverter = {
    "GK": "goalkeepers",
    "DEF": "defenders",
    "MID": "midfielders",
    "FWD": "forwards"
};
module.exports.allPlayerWithPosition = async (request, response) => {
    try{
        var { position } = request.params;
        position = positionNameConverter[position];
        const ret = await playerDatabase.getPlayerByPosition(position);
        response.send(ret);
    }catch(error){
        response.status(400);
    }
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

module.exports.getPlayersByIdWithTeam = async(ids) => {
    const res = await playerDatabase.getPlayersByIdWithTeam(ids);
    for(var i = 0; i < res.length; i++){
        res[i].position = invertPositionNameConverter[res[i].position];
    }
    return res;
};