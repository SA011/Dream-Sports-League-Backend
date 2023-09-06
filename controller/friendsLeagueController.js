const friendsLeagueDatabase = require('../database/friendsLeague.js');

module.exports.getMyFriendsLeague = async (request, response) => {
    try{
        const ret = await friendsLeagueDatabase.getFriendsLeaguesOfUser(request.user.user_id);
        response.send({
            friendsLeagues: ret
        });
    }catch(error){
        response.status(400);
    }
}

module.exports.getAllFriendsLeagues = async (request, response) => {
    try{
        const ret = await friendsLeagueDatabase.getAllFriendsLeagues();
        response.send({
            friendsLeagues: ret
        });
    }catch(error){
        response.status(400);
    }
}

module.exports.getFriendsLeagueById = async (request, response) => {
    try{
        const ret = await friendsLeagueDatabase.getFriendsLeagueByID(request.params.id);
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}

module.exports.createFriendsLeague = async (request, response) => {
    try{
        // console.log(request.body);
        const ret = await friendsLeagueDatabase.createFriendsLeague([request.user.user_id, request.body.name, request.body.min_teams, request.body.max_teams, request.body.start_date,request.body.matchdays, 
            request.body.match_time, request.body.timezone, request.body.team_player_count, request.body.auto_join]);
        if(ret){
            response.send("Friends League created");
        }else{
            response.send("Friends League not created");
        }
    }catch(error){
        console.log(error);
        response.send("Friends League not created");
    }
};
async function checkIsAutoJoin(id){
    const fl = await friendsLeagueDatabase.getFriendsLeagueByID(id);
    if(fl == null){
        return false;
    }
    return fl.auto_join;
}
module.exports.joinFriendsLeague = async (request, response) => {
    try{
        if(!(await checkIsAutoJoin(request.body.id))){
            const ret = await friendsLeagueDatabase.requestFriendsLeague(request.user.user_id, request.body.id);
            if(ret){
                response.send("Requested to join Friends League");
            }else{
                response.send("Not Requested to join Friends League");
            }
        }else{
            const ret = await friendsLeagueDatabase.joinFriendsLeague(request.user.user_id, request.body.id);
            if(ret){
                response.send("Joined Friends League");
            }else{
                response.send("Not Joined Friends League");
            }
        }
    }catch(error){
        response.send("Not Joined Friends League");
    }
}

module.exports.leaveFriendsLeague = async (request, response) => {
    try{
        const ret = await friendsLeagueDatabase.leaveFriendsLeague(request.user.user_id, request.body.id);
        if(ret){
            response.send("Left Friends League");
        }else{
            response.send("Not Left Friends League");
        }
    }catch(error){
        response.send("Not Left Friends League");
    }
}
async function checkIsAdmin(user_id, fl_id){
    const fl = await friendsLeagueDatabase.getFriendsLeagueByID(fl_id);
    if(fl == null){
        return false;
    }
    const allMember = await friendsLeagueDatabase.getFriendsLeagueTeams(request.body.id);
    for(var i = 0; i < allMember.length; i++){
        if(allMember[i].user_id == request.user.user_id && allMember[i].role == 'admin'){
            return true
        }
    }
    return false;

}
module.exports.deleteFriendsLeague = async (request, response) => {
    try{
        if(!await checkIsAdmin(request.user.user_id, request.body.id)){
            response.send("Not Deleted Friends League");
            return;
        }
        const ret = await friendsLeagueDatabase.deleteFriendsLeague(request.body.id);
        if(ret){
            response.send("Deleted Friends League");
        }else{
            response.send("Not Deleted Friends League");
        }
    }catch(error){
        response.send("Not Deleted Friends League");
    }
}

module.exports.updateFriendsLeague = async (request, response) => {
    try{
        const ret = await friendsLeagueDatabase.updateFriendsLeague(request.body.id, [request.body.name, request.body.min_teams, request.body.max_teams, request.body.start_date, request.body.matchdays, 
            request.body.match_time, request.body.timezone, request.body.team_player_count, request.body.auto_join]);
        if(ret){
            response.send("Updated Friends League");
        }else{
            response.send("Not Updated Friends League");
        }
    }catch(error){
        response.send("Not Updated Friends League");
    }
}

module.exports.getFriendsLeagueTeams = async (request, response) => {
    try{
        const ret = await friendsLeagueDatabase.getFriendsLeagueTeams(request.params.id);
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}