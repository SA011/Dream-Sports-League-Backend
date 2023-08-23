const playerDatabase = require('../database/players.js');
const squadDatabase = require('../database/squad.js');

const positionNameConverter = {
    "goalkeepers": "GK",
    "defenders": "DEF",
    "midfielders": "MID",
    "forwards": "FWD",
    "goalkeeper": "GK",
    "defender": "DEF",
    "midfielder": "MID",
    "forward": "FWD"
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

module.exports.squadPlayerWithPosition = async (request, response) => {
    try{
        var { position } = request.params;
        const ret = await squadDatabase.getSquad(request.user.user_id);
        var ret2 = [];
        var cnt = 5;
        if(position[position.length - 1] == 's')position = position.slice(0, position.length - 1);
        if(position == 'goalkeeper')cnt = 2;
        if(position == 'forward')cnt = 4;
        // console.log(position);
        // console.log(ret);
        for(var i = 1; i <= cnt; i++){
            const id = ret[`${position}_${i}`];
            if(id != null){
                ret2.push(id);
            }
        }
        const ret3 = await playerDatabase.getPlayersByIdWithTeam(ret2);
        response.send(ret3);

    }catch(error){
        response.status(400);
    }
};

module.exports.getPlayerPosition = async (playerid) => {
    // console.log(playerid);
    var res = (await playerDatabase.getPlayerById(playerid));
    if(res.length == 0)return 'none';
    return invertPositionNameConverter[res[0].position];
};

module.exports.playerPrice = async (playerid) => {
    var res = (await playerDatabase.getPlayerById(playerid));
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

module.exports.getPlayerById = async(id) => {
    var res = await playerDatabase.getPlayerById(id);
    res.position = invertPositionNameConverter[res.position];
    return res;
}
