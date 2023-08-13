const { request, response } = require('express');
const playingXIDatabase = require('../database/playingXI.js');
const squadDatabase = require('../database/squad.js');
const playerController = require('./playerController.js');
// const playerDatabase = require('../database/players.js');
const matchDatabase = require('../database/match.js');


function checkFormation(formation, playingXI){
    return true;
}

function checkSquadWithPlayingXI(squad, playingXI){
    var playerSet = new Set();
    for(var i = 1; i <= 11; i++){
        playerSet.add(playingXI.players[i - 1]);
    }

    var count = 0;
    for(var i = 1; i <= 2; i++){
        if(squad[`goalkeeper_${i}`] != null && playerSet.has(squad[`goalkeeper_${i}`])){
            count++;
        }
    }

    for(var i = 1; i <= 5; i++){
        if(squad[`defender_${i}`] != null && playerSet.has(squad[`defender_${i}`])){
            count++;
        }
    }  

    for(var i = 1; i <= 5; i++){
        if(squad[`midfielder_${i}`] != null && playerSet.has(squad[`midfielder_${i}`])){
            count++;
        }
    }
    
    for(var i = 1; i <= 4; i++){
        if(squad[`forward_${i}`] != null && playerSet.has(squad[`forward_${i}`])){
            count++;
        }
    }

    return count == 11 && playerSet.size == 11 && playerSet.has(playingXI.captain);
}

function changeFormate(formation, captain, playingXI){
    // console.log(playingXI);
    var ret = {
        formation: formation,
        captain: captain,
        players: []
    };
    for(var position in playingXI){
        const players = playingXI[position];
        for(var i = 0; i < players.length; i++){
            ret.players.push(players[i]);
        }
    }
    return ret;
}

module.exports.getPlayingXI = async (request, response) => {
    try {
        const {user_id} = request.user;
        var match_id;
        if(request.params.match_id == null || request.params.match_id == 'default'){
            match_id = 0;
        }
        else{
            match_id = request.params.match_id;
        }
        const playingXI = await playingXIDatabase.getPlayingXI(user_id, match_id);
        const squad = await squadDatabase.getSquad(user_id);
        const matchInfo = await matchDatabase.getMatchInfo(match_id);
        // console.log(matchInfo);
        // console.log(playingXI);
        // console.log(squad);
        var ret = {
            match_id: match_id,
            match_time: matchInfo.time,
            home: matchInfo.home,
            away: matchInfo.away,
            formation: playingXI.formation,
            captain: playingXI.captain,
            playingxi: {
                goalkeepers: [],
                defenders: [],
                midfielders: [],
                forwards: []
            },
            bench: {
                goalkeepers: [],
                defenders: [],
                midfielders: [],
                forwards: []
            }
        };

        var all = [];
        if(playingXI != null){
            
            for(var i = 1; i <= 11; i++){
                const id = playingXI[`player_${i}`];
                all.push(id);
            }

            const playerInfos = await playerController.getPlayersByIdWithTeam(all);

            // console.log(playerInfos);
            for(var i = 0; i < 11; i++){
                // console.log(playerInfos[i]);
                ret.playingxi[playerInfos[i].position].push(playerInfos[i]);
            }
        }
        // console.log(ret);
        temp = [];
        for(var i = 1; i <= 2; i++){
            if(squad[`goalkeeper_${i}`] != null && !all.includes(squad[`goalkeeper_${i}`])){
                // ret.bench.goalkeepers.push(await playerDatabase.getPlayerByIdWithTeam(squad[`goalkeeper_${i}`]));
                temp.push(squad[`goalkeeper_${i}`]);
            }
        }
        // console.log(temp);

        for(var i = 1; i <= 5; i++){
            if(squad[`defender_${i}`] != null && !all.includes(squad[`defender_${i}`])){
                // ret.bench.defenders.push(await playerDatabase.getPlayerByIdWithTeam(squad[`defender_${i}`]));
                temp.push(squad[`defender_${i}`]);
            }
        }

        for(var i = 1; i <= 5; i++){
            if(squad[`midfielder_${i}`] != null && !all.includes(squad[`midfielder_${i}`])){
                // ret.bench.midfielders.push(await playerDatabase.getPlayerByIdWithTeam(squad[`midfielder_${i}`]));
                temp.push(squad[`midfielder_${i}`]);
            }
        }

        for(var i = 1; i <= 4; i++){
            if(squad[`forward_${i}`] != null && !all.includes(squad[`forward_${i}`])){
                // ret.bench.forwards.push(await playerDatabase.getPlayerByIdWithTeam(squad[`forward_${i}`]));
                temp.push(squad[`forward_${i}`]);
            }
        }
        // console.log(temp);
        const playerInfos = await playerController.getPlayersByIdWithTeam(temp);
        // console.log(playerInfos);
        for(var i = 0; i < playerInfos.length; i++){
            ret.bench[playerInfos[i].position].push(playerInfos[i]);
        }

        response.send(ret);

    } catch (error) {
        response.status(400);
    }
};


module.exports.setPlayingXI = async (request, response) => {
    // console.log(request.body);
    try {
        const {user_id} = request.user;
        var match_id;
        if(request.params.match_id == null || request.params.match_id == 'default'){
            match_id = 0;
        }
        else{
            match_id = request.params.match_id;
        }
        const {formation, captain, playingxi} = request.body;
        if(formation == null || captain == null || playingxi == null){
            response.status(400);
            return;
        }
        // console.log(formation, captain, playingxi);

        if(checkFormation(formation, playingxi) == false){
            response.status(400);
            return;
        }

        const squad = await squadDatabase.getSquad(user_id);
        
        console.log(squad);
        if(squad == null){
            response.status(400);
            return;
        }

        modifiedPlayingXI = changeFormate(formation, captain, playingxi);

        // console.log(modifiedPlayingXI);

        if(checkSquadWithPlayingXI(squad, modifiedPlayingXI) == false){
            response.status(400);
            return;
        }
        // console.log(modifiedPlayingXI);
        await playingXIDatabase.setPlayingXI(user_id, match_id, modifiedPlayingXI);

        response.sendStatus(202);
    } catch (error) {
        response.status(400);
    }
};