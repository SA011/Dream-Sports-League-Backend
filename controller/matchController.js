const matchDatabase = require('../database/match');
const eventDatabase = require('../database/event');
const playingXIDatabase = require('../database/playingXI');
const usersDatabase = require('../database/users');
const playerDatabase = require('../database/players');

module.exports.simulateMatch = async (matchInfo) => {
    const events = await eventDatabase.getEventByMatch(matchInfo.id);

    for(var i = 0; i < events.length; i++){
        // console.log(events[i]);
        const points = await eventDatabase.getPoints(events[i].category);
        // console.log(points);
        const users = await playingXIDatabase.getUsersByMatchAndPlayer(matchInfo.id, events[i].player_id);
        await usersDatabase.updateUserPoints(users, points);
        await playerDatabase.updatePlayerPoints(events[i].player_id, points);
    }
    console.log('Match simulated');
    await matchDatabase.setMatchFinished(matchInfo.id);

    
}
module.exports.unSimulateMatch = async (matchInfo) => {
    const events = await eventDatabase.getEventByMatch(matchInfo.id);

    for(var i = 0; i < events.length; i++){
        // console.log(events[i]);
        const points = await eventDatabase.getPoints(events[i].category);
        // console.log(points);
        const users = await playingXIDatabase.getUsersByMatchAndPlayer(matchInfo.id, events[i].player_id);
        await usersDatabase.updateUserPoints(users, -points);
        await playerDatabase.updatePlayerPoints(events[i].player_id, -points);
    }
    console.log('Match unSimulated');
    await matchDatabase.setMatchUnFinished(matchInfo.id);

    
}