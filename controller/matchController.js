const matchDatabase = require('../database/match');
const eventDatabase = require('../database/event');
const playingXIDatabase = require('../database/playingXI');
const usersDatabase = require('../database/users');
const playerDatabase = require('../database/players');

module.exports.simulatedMatch = async (matchInfo) => {
    const events = await eventDatabase.getEventByMatch(matchInfo.id);

    for(var i = 0; i < events.length; i++){
        const points = await eventDatabase.getPoints(events[i].category);
        const users = await playingXIDatabase.getUsersByMatchAndPlayer(matchInfo.id, events[i].player_id);
        await usersDatabase.updateUserPoints(users, points);
        await playerDatabase.updatePlayerPoints(events[i].player_id, points);
    }

    await matchDatabase.setMatchFinished(matchInfo.id);

    
}