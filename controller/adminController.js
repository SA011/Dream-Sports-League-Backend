const matchDatabase = require('../database/match');
module.exports.login = async (request, response) => {
    if(request.user.role != 'admin'){
        request.logout((err) => {
            if(err){
                console.log(err);
            }
        });
        response.status(401).send("Unauthorized");
    }else
        response.status(200).send("User found");
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
    const matchWeek = await matchDatabase.getMatchesByWeek(request.params.week);
    if(matchWeek == null){
        response.status(400).send("Match week not found");
    }else{
        response.status(200).send(matchWeek);
    }
};

module.exports.simulateMatch = async (request, response) => {
    const matchInfo = await matchDatabase.getMatchInfo(request.params.match_id);
    if(matchInfo == null){
        response.status(400).send("Match not found");
    }else if(matchInfo.finished){
        response.status(400).send("Match already finished");
    }else{
        //Match simulation here. pending
    }
}
