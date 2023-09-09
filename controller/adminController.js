const matchDatabase = require('../database/match');
const eventDatabase = require('../database/event');
const matchController = require('./matchController');
const teamDatabase = require('../database/teamInfo');
const playerDatabase = require('../database/players');
const playingXIDatabase = require('../database/playingXI');


const invertPositionNameConverter = {
    "GK": "goalkeepers",
    "DEF": "defenders",
    "MID": "midfielders",
    "FWD": "forwards"
};
module.exports.login = async (request, response) => {
    if(request.user.role != 'admin'){
        request.logout((err) => {
            if(err){
                console.log(err);
            }
        });
        response.status(401).send("Unauthorized");
    }else
        response.status(200).send("Admin logged in");
};

module.exports.logout = async (request, response) => {
    if(request.user == null){
        response.status(400).send("Admin not Logged in yet");
    }else{
        request.logout((err) => {
            if(err){
                console.log(err);
            }
        });
        response.status(200).send("Admin logged out");
    }
};


module.exports.getMatchWeek = async (request, response) => {
    var matchWeek = await matchDatabase.getMatchesByWeek(request.params.week);
    if(matchWeek == null){
        response.status(400).send("Match week not found");
    }else{
        for(let i = 0; i < matchWeek.length; i++){
            if(matchWeek[i].finished == 1){
                const score = await eventDatabase.getScoreLine(matchWeek[i]);
                matchWeek[i].score = `${score.home} - ${score.away}`;
            }
            matchWeek[i].home = (await teamDatabase.getTeamInfo(matchWeek[i].home)).name;
            matchWeek[i].away = (await teamDatabase.getTeamInfo(matchWeek[i].away)).name;
            
        }
        // console.log(matchWeek);
        response.status(200).send(matchWeek);
    }
};

module.exports.simulateMatch = async (request, response) => {
    // console.log(request.params);
    const matchInfo = await matchDatabase.getMatchInfo(request.params.match_id);
    if(matchInfo == null){
        response.status(400).send("Match not found");
    }else if(matchInfo.finished == 1){
        response.status(400).send("Match already finished");
    }else{
        //Match simulation here. 
        matchController.simulateMatch(matchInfo).then(() => {
            response.status(200).send("Match simulated");
        }).catch((err) => {
            console.log(err);
            response.status(500).send("Internal Server Error");
        });
    }
}

module.exports.unSimulateMatch = async (request, response) => {
    // console.log(request.params);
    const matchInfo = await matchDatabase.getMatchInfo(request.params.match_id);
    if(matchInfo == null){
        response.status(400).send("Match not found");
    }else if(matchInfo.finished == 0){
        response.status(400).send("Match is not finished");
    }else{
        //Match unSimulation here.
        matchController.unSimulateMatch(matchInfo).then(() => {
            response.status(200).send("Match unSimulated");
        }).catch((err) => {
            console.log(err);
            response.status(500).send("Internal Server Error");
        });
    }
}



async function getBestXIBasedOnOverall(formation){
    const form = formation.split('-');
    var goalkeepers = await playerDatabase.getPlayerByPositionWithSortedOrderDESC('GK', 1);
    var defenders = await playerDatabase.getPlayerByPositionWithSortedOrderDESC('DEF', form[0]);
    var midfielders = await playerDatabase.getPlayerByPositionWithSortedOrderDESC('MID', form[1]);
    var forwards = await playerDatabase.getPlayerByPositionWithSortedOrderDESC('FWD', form[2]);
    bestXI = [...goalkeepers, ...defenders, ...midfielders, ...forwards];
    var cap = 0;
    for(var i = 1; i < 11; i++){
        if(bestXI[i].overall > bestXI[cap].overall){
            cap = i;
        }
    }
    var ret = {
        formation: formation,
        captain: bestXI[cap].id,
        players: []
    }
    for(var i = 0; i < 11; i++){
        ret.players.push(bestXI[i].id);
    }
    return ret;
}

async function getBestXIBasedOnPoints(formation){
    const form = formation.split('-');
    var goalkeepers = await playerDatabase.getPlayerByPositionWithSortedOrderPointsDESC('GK', 1);
    var defenders = await playerDatabase.getPlayerByPositionWithSortedOrderPointsDESC('DEF', form[0]);
    var midfielders = await playerDatabase.getPlayerByPositionWithSortedOrderPointsDESC('MID', form[1]);
    var forwards = await playerDatabase.getPlayerByPositionWithSortedOrderPointsDESC('FWD', form[2]);
    bestXI = [...goalkeepers, ...defenders, ...midfielders, ...forwards];
    var cap = 0;
    for(var i = 1; i < 11; i++){
        if(bestXI[i].points > bestXI[cap].points){
            cap = i;
        }
    }
    var ret = {
        formation: formation,
        captain: bestXI[cap].id,
        players: []
    }
    for(var i = 0; i < 11; i++){
        ret.players.push(bestXI[i].id);
    }
    return ret;
}

async function getBestXIBasedOnBoth(formation, ratioOfOverallToPoints){
    const form = formation.split('-');
    var goalkeepers = await playerDatabase.getPlayerByPositionWithSortedOrderRatioDESC('GK', 1, ratioOfOverallToPoints);
    var defenders = await playerDatabase.getPlayerByPositionWithSortedOrderRatioDESC('DEF', form[0], ratioOfOverallToPoints);
    var midfielders = await playerDatabase.getPlayerByPositionWithSortedOrderRatioDESC('MID', form[1], ratioOfOverallToPoints);
    var forwards = await playerDatabase.getPlayerByPositionWithSortedOrderRatioDESC('FWD', form[2], ratioOfOverallToPoints);
    bestXI = [...goalkeepers, ...defenders, ...midfielders, ...forwards];
    var cap = 0;
    for(var i = 1; i < 11; i++){
        if(bestXI[i].RATIO > bestXI[cap].RATIO){
            cap = i;
        }
    }
    var ret = {
        formation: formation,
        captain: bestXI[cap].id,
        players: []
    }
    for(var i = 0; i < 11; i++){
        ret.players.push(bestXI[i].id);
    }
    return ret;
}

async function generateBestXI(){
    const formation = '4-3-3';
    const ratio = 0.9;
    const bestXI = await getBestXIBasedOnBoth(formation, ratio);
    // const bestXI = await getBestXIBasedOnOverall(formation);
    // const bestXI = await getBestXIBasedOnPoints(formation);
    return bestXI;
}

async function updateWithAutoGeneratedBestXI(){
    const bestXI = await generateBestXI();
    await playingXIDatabase.setPlayingXI('EPL', 0, bestXI);
}

module.exports.getBestXI = async (request, response) => {
    var bestXI = await playingXIDatabase.getBestXI();
    // console.log(bestXI);
    if(bestXI == null || bestXI.captain == null){
        await updateWithAutoGeneratedBestXI().then(() => {
            bestXI = playingXIDatabase.getBestXI();
        }).catch((err) => {
            console.log(err);
            response.status(500).send("Internal Server Error");
        });
    }

    var ret = {
        formation: bestXI.formation,
        captain: bestXI.captain,
        players: {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            forwards: []
        }
    }

    for(var i = 0; i < 11; i++){
        const player = await playerDatabase.getPlayerByIdWithTeam(bestXI[`player_${i + 1}`]);
        ret.players[invertPositionNameConverter[player.position]].push(player);
    }

    response.send(ret);
}

module.exports.setBestXI = async (request, response) => {
    const bestXI = request.body;
    // console.log(bestXI);
    if(bestXI == null || bestXI.captain == null){
        response.status(400).send("Bad Request");
    }else{
        await playingXIDatabase.setPlayingXI('EPL', 0, bestXI);
        response.status(200).send("Best XI updated");
    }
}

module.exports.setBestXIWithAutoGenerated = async (request, response) => {
    await updateWithAutoGeneratedBestXI().then(() => {
        response.status(200).send("Best XI updated");
    }).catch((err) => {
        console.log(err);
        response.status(500).send("Internal Server Error");
    });
}
