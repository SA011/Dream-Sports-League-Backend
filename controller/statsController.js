const statsDatabase = require('../database/stats.js');

module.exports.getAllTeams = async (request, response) => {
    try{
        const ret = await statsDatabase.getAllTeams();
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}

module.exports.getAllPlayers = async (request, response) => {
    try{
        const ret = await statsDatabase.getAllPlayers();
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}

module.exports.getFantasyStandings = async (request, response) => {
    try{
        const ret = await statsDatabase.getFantasyStandings();
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}