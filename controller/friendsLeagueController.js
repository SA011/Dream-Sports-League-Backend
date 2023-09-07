const friendsLeagueDatabase = require('../database/friendsLeague.js');
const { getCurrentTime, convertTime, getDate, weekDays } = require('./util.js');

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
        if(getCurrentTime(request.body.timezone) > convertTime(getDate(request.body.start_date), request.body.match_time)){
            response.send("Start Time is in the past");
            return;
        }

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
async function checkJoinInTime(id){
    const fl = await friendsLeagueDatabase.getFriendsLeagueByID(id);
    if(fl == null){
        return false;
    }
    // console.log(fl);
    // console.log(getCurrentTime(fl.timezone));
    // console.log(getDate(fl.start_date));
    // console.log(convertTime(getDate(fl.start_date), fl.match_time));

    if(getCurrentTime(fl.timezone) > convertTime(getDate(fl.start_date), fl.match_time)){
        return false;
    }
    return true;
}

async function checkMaxTeamInFriendsLeague(id){
    // console.log(id);
    const fl = await friendsLeagueDatabase.getFriendsLeagueByID(id);
    if(fl == null){
        return false;
    }
    // console.log(fl);
    const allMember = await friendsLeagueDatabase.getFriendsLeagueTeams(id);
    if(allMember.length >= fl.max_teams){
        return false;
    }
    return true;
}

module.exports.joinFriendsLeague = async (request, response) => {
    try{
        if(!(await checkMaxTeamInFriendsLeague(request.body.id))){
            response.send("League Full");
            return;
        }
        // console.log(request.body);
        if(!(await checkJoinInTime(request.body.id))){
            response.send("League Already started");
            return;
        }
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
                await memberAddedInLeague(request.body.id);
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
        if(!(await checkJoinInTime(request.body.id))){
            response.send("Not Left Friends League");
            return;
        }

        if((await checkIsAdmin(request.user.user_id, request.body.id))){
            response.send("Not Left Friends League");
            return;
        }

        const ret = await friendsLeagueDatabase.leaveFriendsLeague(request.user.user_id, request.body.id);
        if(ret){
            await memberAddedInLeague(request.body.id);
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
    const allMember = await friendsLeagueDatabase.getFriendsLeagueTeams(fl_id);
    for(var i = 0; i < allMember.length; i++){
        if(allMember[i].user_id == user_id && allMember[i].role == 'admin'){
            return true
        }
    }
    return false;

}
module.exports.deleteFriendsLeague = async (request, response) => {
    try{
        if(!(await checkIsAdmin(request.user.user_id, request.body.id))){
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
        // console.log(request.body);
        if(!(await checkIsAdmin(request.user.user_id, request.body.id))){
            response.send("Not Updated Friends League");
            return;
        }
        // console.log(request.body);
        if(!(await checkJoinInTime(request.body.id))){
            response.send("Not Updated Friends League");
            return;
        }
        // console.log(request.body);
        // console.log(getCurrentTime(request.body.timezone));
        // console.log(getDate(request.body.start_date));
        // console.log(convertTime(getDate(request.body.start_date), request.body.match_time));

        if(getCurrentTime(request.body.timezone) > convertTime(getDate(request.body.start_date), request.body.match_time)){
            response.send("Start Time is in the past");
            return;
        }
        const members = await friendsLeagueDatabase.getFriendsLeagueTeams(request.body.id);
        
        if(members.length > request.body.max_teams){
            response.send("Not Updated Friends League");
            return;
        }

        // response.send("PROBLEM");
        // return;
        // console.log(request.body);
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

module.exports.getFriendsLeagueRequests = async (request, response) => {
    try{
        if(!(await checkIsAdmin(request.user.user_id, request.params.id))){
            response.send('Not Admin');
            return;
        }
        const ret = await friendsLeagueDatabase.getFriendsLeagueRequests(request.params.id);
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}

module.exports.handleFriendsLeagueRequest = async (request, response) => {
    try{
        if(!(await checkIsAdmin(request.user.user_id, request.params.id))){
            response.send('Not Admin');
            return;
        }
        if(!(await checkJoinInTime(request.params.id)) && request.body.status.toLowerCase() == 'accept'){
            response.send('Not Accepted');
            return;
        }

        if(request.body.status.toLowerCase() == 'accept' && !(await checkMaxTeamInFriendsLeague(request.params.id))){
            response.send('League Full');
            return;
        }

        const ret = await friendsLeagueDatabase.handleFriendsLeagueRequest(request.params.id, request.body.user_id, request.body.status);
        if(ret){
            if(request.body.status.toLowerCase() == 'accept'){
                await memberAddedInLeague(request.params.id);
            }
        }

        response.send('Handled');
    }catch(error){
        response.status(400);
    }
}

function isValidMatchDays(matchdays){
    if(matchdays.length <= 0 || matchdays.length > 7){
        return false;
    }
    // console.log(matchdays);
    // console.log(weekDays.includes(matchdays[0]));
    var dup = new Set();
    // dup.add(matchdays[0]);
    // console.log(dup);
    // console.log(dup.has(matchdays[0]));


    for(var i = 0; i < matchdays.length; i++){
        if(!weekDays.includes(matchdays[i])){
            return false;
        }
        if(dup.has(matchdays[i])){
            return false;
        }
        dup.add(matchdays[i]);
    }
    return true;
}

function nextMatchDate(matchdays, curDate){
    var curDayIndex = curDate.getDay();
    
    if(curDayIndex == -1){
        return null;
    }
    var ret = new Date(curDate);
    
    while(true){
        curDayIndex = (curDayIndex + 1) % weekDays.length;
        ret.setDate(ret.getDate() + 1);
        if(matchdays.includes(weekDays[curDayIndex])){
            return ret;
        }
    }

    return null;
}
        

async function memberAddedInLeague(fl_id){
    const fl_info = await friendsLeagueDatabase.getFriendsLeagueByID(fl_id);
    // console.log(fl_info);
    if(fl_info == null){
        return null;
    }
    if(fl_info.matchdays == null || !isValidMatchDays(fl_info.matchdays) || fl_info.match_time == null || fl_info.timezone == null){
        return null;
    }

    // console.log(fl_info);

    await friendsLeagueDatabase.deleteAllMatches(fl_id);
    var members = await friendsLeagueDatabase.getFriendsLeagueTeams(fl_id);
    // console.log(members);
    
    members.sort((a, b) => {
        return a.user_id.localeCompare(b.user_id);
    }
    );

    var matches = [];
    var perDayMatchCount = Math.floor(members.length / 2);
    if(members.length % 2 == 1){
        members.push({user_id: undefined});
    }

    var curDate = convertTime(getDate(fl_info.start_date), fl_info.match_time);
    curDate.setDate(curDate.getDate() - 1);
    // console.log(curDate);
    for(var i = 0; i < members.length - 1; i++){
        curDate = nextMatchDate(fl_info.matchdays, curDate);
        // console.log(curDate);
        // console.log(members);
        for(var j = 0; j < members.length / 2; j++){
            if(members[j].user_id == undefined || members[members.length - 1 - j].user_id == undefined){
                continue;
            }
            // console.log(members[j].user_id, members[members.length - 1 - j].user_id);
            matches.push({
                home: members[j].user_id,
                away: members[members.length - 1 - j].user_id,
                time: curDate,
                scoreline: null
            });
        }
        // console.log(matches);
        members.splice(1, 0, members.pop());
        // console.log(members);
    }
    const len = matches.length;
    
    for(var i = 0; i < len; i++){
        if(i % perDayMatchCount == 0)
            curDate = nextMatchDate(fl_info.matchdays, curDate);
        matches.push({
            home: matches[i].away,
            away: matches[i].home,
            time: curDate,
            scoreline: null
        });
    }

    // console.log(matches);
    
    const ret = await friendsLeagueDatabase.addMatches(fl_id, matches);
    return ret;
}