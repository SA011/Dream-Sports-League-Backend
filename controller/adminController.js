const matchDatabase = require('../database/match');
const eventDatabase = require('../database/event');
const matchController = require('./matchController');
const teamDatabase = require('../database/teamInfo');
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
        response.status(400).send("User not Logged in yet");
    }else{
        request.logout((err) => {
            if(err){
                console.log(err);
            }
        });
        response.status(200).send("User logged out");
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
        console.log(matchWeek);
        response.status(200).send(matchWeek);
    }
};

module.exports.simulateMatch = async (request, response) => {
    console.log(request.params);
    const matchInfo = await matchDatabase.getMatchInfo(request.params.match_id);
    if(matchInfo == null){
        response.status(400).send("Match not found");
    }else if(matchInfo.finished == 1){
        response.status(400).send("Match already finished");
    }else{
        //Match simulation here. pending
        matchController.simulateMatch(matchInfo).then(() => {
            response.status(200).send("Match simulated");
        }).catch((err) => {
            console.log(err);
            response.status(500).send("Internal Server Error");
        });
    }
}
