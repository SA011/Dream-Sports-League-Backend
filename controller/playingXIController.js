const { request, response } = require('express');
const playingXIDatabase = require('../database/playingXI.js');
const squadDatabase = require('../database/squad.js');
const playerController = require('./playerController.js');
const userDatabase = require('../database/users.js');
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
    // console.log(playerSet);
    // console.log(playingXI);
    // console.log(squad);
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
    // console.log(count);
    return count == 11 && playerSet.size == 11 && playerSet.has(playingXI.captain);
}

function changeFormate(playingXI){
    var ret = {
        captain: playingXI.captain,
        formation: playingXI.formation,
        players: []
    }
    for(var i = 1; i <= 11; i++)
        ret.players.push(playingXI[`player_${i}`]);
    return ret;
}

async function createPlayingXI(user_id, squad, match_id){
    var players = {
        captain: null,
        formation: '4-3-3',
        players: []
    }
    for(var i = 1; i <= 2; i++){
        if(squad[`goalkeeper_${i}`] != null){
            players.players.push(squad[`goalkeeper_${i}`]);
            break;
        }
    }
    var cnt = 0;
    for(var i = 1; i <= 5; i++){
        if(cnt == 4){
            break;
        }
        if(squad[`defender_${i}`] != null){
            players.players.push(squad[`defender_${i}`]);
            cnt++;
        }
    }
    cnt = 0;
    for(var i = 1; i <= 5; i++){
        if(cnt == 3){
            break;
        }
        if(squad[`midfielder_${i}`] != null){
            players.players.push(squad[`midfielder_${i}`]);
            cnt++;
        }
    }
    cnt = 0;
    for(var i = 1; i <= 4; i++){
        if(cnt == 3){
            break;
        }
        if(squad[`forward_${i}`] != null){
            players.players.push(squad[`forward_${i}`]);
            cnt++;
        }
    }
    players.captain = players.players[0];
    // console.log(players);
    await playingXIDatabase.setPlayingXI(user_id, match_id, players);
}

async function setPlayingXIToDefault(user_id, squad, match_id){
    const defaultPlayingXI = await playingXIDatabase.getPlayingXI(user_id, 0);
    // console.log(defaultPlayingXI);
    if(defaultPlayingXI == null || !checkSquadWithPlayingXI(squad, changeFormate(defaultPlayingXI))){
        await createPlayingXI(user_id, squad, 0);
        if(match_id != 0){
            await createPlayingXI(user_id, squad, match_id);
        }
        return;
    }
    if(match_id == 0)return;
    var players = {
        captain: defaultPlayingXI.captain,
        formation: defaultPlayingXI.formation,
        players: []
    };

    for(var i = 1; i <= 11; i++){
        players.players.push(defaultPlayingXI[`player_${i}`]);
    }
    await playingXIDatabase.setPlayingXI(user_id, match_id, players);
}


module.exports.getPlayingXI = async (request, response) => {
    // console.log(request);
    try {
        const {user_id} = request.user;
        var match_id;
        if(request.params.match_id == null || request.params.match_id == 'default'){
            match_id = 0;
        }
        else{
            match_id = request.params.match_id;
        }
        // console.log(match_id);
        var playingXI = await playingXIDatabase.getPlayingXI(user_id, match_id);
        const squad = await squadDatabase.getSquad(user_id);
        const matchInfo = await matchDatabase.getMatchInfo(match_id);
        // console.log(matchInfo);
        // console.log(playingXI);
        // console.log(squad);
        
        if(playingXI == null){ 
            await setPlayingXIToDefault(user_id, squad, match_id).then(async () => {
                playingXI = await playingXIDatabase.getPlayingXI(user_id, match_id);
            });
            // console.log(playingXI);
        }else if(!checkSquadWithPlayingXI(squad, changeFormate(playingXI))){
            // console.log('HERE');
            await setPlayingXIToDefault(user_id, squad, match_id).then(async () => {
                playingXI = await playingXIDatabase.getPlayingXI(user_id, match_id);
            });
        }
        // console.log(playingXI);
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
        
        // console.log('HERE');
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
        // console.log(all);
        // console.log(squad);
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
        // console.log(ret);
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
        
        // console.log(squad);
        if(squad == null){
            response.status(400);
            return;
        }

        var modifiedPlayingXI = {
            formation: formation,
            captain: captain,
            // players: []
            players: playingxi
        };

        // for(var position in playingxi){
        //     for(var i = 0; i < playingxi[position].length; i++){
        //         modifiedPlayingXI.players.push(playingxi[position][i]);
        //     }
        // }


        // console.log(modifiedPlayingXI);

        if(checkSquadWithPlayingXI(squad, modifiedPlayingXI) == false){
            // console.log('HERE');
            response.sendStatus(400);
            return;
        }
        // console.log(modifiedPlayingXI);
        await playingXIDatabase.setPlayingXI(user_id, match_id, modifiedPlayingXI).then((res) => {
            response.sendStatus(202);
        });
    } catch (error) {
        response.status(400);
    }
};

module.exports.getUsersByMatchAndPlayer = async (match_id, player_id) => {
    const users = await userDatabase.getUsers();
    var captain = [];
    var notCaptain = [];
    for(var i = 0; i < users.length; i++){
        var playingXI = await playingXIDatabase.getPlayingXI(users[i].user_id, match_id);
        const squad = await squadDatabase.getSquad(users[i].user_id);
        if(squad == null || squad.goalkeeper_1 == null)continue;
        if(playingXI == null){
            await setPlayingXIToDefault(users[i].user_id, squad, match_id);
            playingXI = await playingXIDatabase.getPlayingXI(users[i].user_id, match_id);
        }else if(!checkSquadWithPlayingXI(squad, changeFormate(playingXI))){
            // console.log('HERE');
            await setPlayingXIToDefault(user_id, squad, match_id).then(async () => {
                playingXI = await playingXIDatabase.getPlayingXI(user_id, match_id);
            });
        }
        for(var j = 1; j <= 11; j++){
            if(playingXI[`player_${j}`] == player_id){
                if(playingXI.captain == player_id){
                    captain.push(users[i].user_id);
                }else{
                    notCaptain.push(users[i].user_id);
                }
                break;
            }
        }
    }
    return {captain: captain, notCaptain: notCaptain};
}
