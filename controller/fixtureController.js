const matchDatabase = require('../database/match');
const eventDatabase = require('../database/event');
const teamDatabase = require('../database/teamInfo');
const playerDatabase = require('../database/players');

module.exports.getFixture = async (req, res) => {
    var week = 1;
    if(req.params.id != null){
        week = req.params.id;
    }
    
    const matches = await matchDatabase.getMatchesByWeek(week);
    // console.log(matches);
    var ret = {
        matches: []
    };
    for(var i = 0; i < matches.length; i++){
        
        const homeTeam = await teamDatabase.getTeamInfo(matches[i].home);
        const awayTeam = await teamDatabase.getTeamInfo(matches[i].away);

        var temp = {
            match_id: matches[i].id,
            home: {
                id: matches[i].home,
                name: homeTeam.name,
                score: 0
            },
            away: {
                id: matches[i].away,
                name: awayTeam.name,
                score: 0
            },
            finished: matches[i].finished,
            game_week: matches[i].game_week,
            time: matches[i].time
        } 
        if(matches[i].finished == 1){
            var t = await eventDatabase.getScoreLine(matches[i]);
            // console.log(t);
            temp.home.score = t.home;
            temp.away.score = t.away;
        }
        ret.matches.push(temp);
    }
    res.send(ret);
}

module.exports.getMatch = async (req, res) => {
    // console.log('getMatch');
    const match_id = req.params.id;
    const match = await matchDatabase.getMatchInfo(match_id);
    const events = await eventDatabase.getEventByMatch(match_id);

    var ret = {
        match_id: match.id,
        home: {
            id: match.home,
            name: (await teamDatabase.getTeamInfo(match.home)).name,
            score: 0,
        },
        away: {
            id: match.away,
            name: (await teamDatabase.getTeamInfo(match.away)).name,
            score: 0,
        },
        finished: match.finished,
        game_week: match.game_week,
        time: match.time,
        events: {
            home: [],
            away: []
        },
        points: {
            home: [],
            away: []
        }
    };

    if(match.finished == 1) {
        for(var i = 0; i < events.length; i++){
            const player = await playerDatabase.getPlayerById(events[i].player_id);
            const category = events[i].category;
            const points = await eventDatabase.getPoints(events[i].category);

            var temp = {
                player_name: player.name,
                category: category,
                time: events[i].time
            };
            if(player.team == match.home){
                if(category == 'GOAL'){
                    ret.home.score++;
                }
                if(category == 'OWN_GOAL'){
                    ret.away.score++;
                }

                ret.events.home.push(temp);
                var j = 0;
                for(j = 0; j < ret.points.home.length; j++){
                    if(ret.points.home[j].player_id == player.id){
                        ret.points.home[j].points += points;
                        break;
                    }
                }
                if(j == ret.points.home.length){
                    ret.points.home.push({
                        player_id: player.id,
                        player_name: player.name,
                        points: points
                    });
                }

            }else if(player.team == match.away){
                if(category == 'GOAL'){
                    ret.away.score++;
                }
                if(category == 'OWN_GOAL'){
                    ret.home.score++;
                }

                ret.events.away.push(temp);
                var j = 0;
                for(j = 0; j < ret.points.away.length; j++){
                    if(ret.points.away[j].player_id == player.id){
                        ret.points.away[j].points += points;
                        break;
                    }
                }
                if(j == ret.points.away.length){
                    ret.points.away.push({
                        player_id: player.id,
                        player_name: player.name,
                        points: points
                    });
                }
            }
        }
    }

    res.send(ret);



}