const matchDatabase = require('../database/match');
const eventDatabase = require('../database/event');
const playingXIController = require('./playingXIController');
const usersDatabase = require('../database/users');
const playerDatabase = require('../database/players');
const teamDatabase = require('../database/teamInfo');

module.exports.simulateMatch = async (matchInfo) => {
    const events = await eventDatabase.getEventByMatch(matchInfo.id);

    for(var i = 0; i < events.length; i++){
        // console.log(events[i]);
        const points = await eventDatabase.getPoints(events[i].category);
        // console.log(points);
        const {captain, notCaptain} = await playingXIController.getUsersByMatchAndPlayer(matchInfo.id, events[i].player_id);
        await usersDatabase.updateUserPoints(captain, points* 2);
        await usersDatabase.updateUserPoints(notCaptain, points);
        await playerDatabase.updatePlayerPoints(events[i].player_id, points, events[i].category, 1);
    }
    const scoreline = await eventDatabase.getScoreLine(matchInfo);
    await teamDatabase.updateTeamInfo(matchInfo.home, scoreline.home - scoreline.away, 1);
    await teamDatabase.updateTeamInfo(matchInfo.away, scoreline.away - scoreline.home, 1);
    console.log('Match simulated');
    await matchDatabase.setMatchFinished(matchInfo.id);

    
}
module.exports.unSimulateMatch = async (matchInfo) => {
    const events = await eventDatabase.getEventByMatch(matchInfo.id);

    for(var i = 0; i < events.length; i++){
        // console.log(events[i]);
        const points = await eventDatabase.getPoints(events[i].category);
        // console.log(points);
        const {captain, notCaptain} = await playingXIController.getUsersByMatchAndPlayer(matchInfo.id, events[i].player_id);
        await usersDatabase.updateUserPoints(captain, -points* 2);
        await usersDatabase.updateUserPoints(notCaptain, -points);
        await playerDatabase.updatePlayerPoints(events[i].player_id, -points, events[i].category, -1);
    }
    const scoreline = await eventDatabase.getScoreLine(matchInfo);
    await teamDatabase.updateTeamInfo(matchInfo.home, scoreline.home - scoreline.away, -1);
    await teamDatabase.updateTeamInfo(matchInfo.away, scoreline.away - scoreline.home, -1);
    console.log('Match unSimulated');
    await matchDatabase.setMatchUnFinished(matchInfo.id);

    
}