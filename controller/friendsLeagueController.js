const friendsLeagueDatabase = require('../database/friendsLeague.js');
const playerDatabase = require('../database/players.js');
const squadDatabase = require('../database/squad.js');
const { get } = require('../routes/friendsLeague.js');
const { getCurrentTime, convertTime, getDate, weekDays } = require('./util.js');
const userDatabase = require('../database/users.js');

const invertPositionNameConverter = {
    "GK": "goalkeepers",
    "DEF": "defenders",
    "MID": "midfielders",
    "FWD": "forwards"
};


module.exports.getMyFriendsLeague = async (request, response) => {
    try{
        var ret = await friendsLeagueDatabase.getFriendsLeaguesOfUser(request.user.user_id);
        
        for(var i = 0; i < ret.length; i++){
            const {standings} = await this.getStandingsUtil(ret[i].fl_id);
            ret[i].rank = 1;
            for(var j = 0; j < standings.length; j++){
                if(standings[j].user_id == request.user.user_id){
                    ret[i].rank = j + 1;
                    break;
                }
            }
        }


        response.send({
            friendsLeagues: ret
        });
    }catch(error){
        response.status(400);
    }
}

module.exports.getAllFriendsLeagues = async (request, response) => {
    try{
        var ret = await friendsLeagueDatabase.getAllFriendsLeagues();
        var myfl = new Set();
        if(request.user){
            const myFriendsLeague = await friendsLeagueDatabase.getFriendsLeaguesOfUser(request.user.user_id);
            for(var i = 0; i < myFriendsLeague.length; i++){
                myfl.add(myFriendsLeague[i].id);
            }
        }
        var res = [];
        for(var i = 0; i < ret.length; i++){
            if(myfl.has(ret[i].id)){
                continue;
            }
            const members = await friendsLeagueDatabase.getFriendsLeagueTeams(ret[i].id);
            // console.log(members);
            ret[i].member_count = members.length;
            res.push(ret[i]);
        }

        response.send({
            friendsLeagues: res
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
    // console.log(fl.start_date);
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
        const role = await friendsLeagueDatabase.getRole(request.body.id, request.user.user_id);
        if(role == null || role == 'request'){
            response.send('Not Member');
            return;
        }
        if(role == 'admin'){
            response.send('Not Left Friends League');
            return;
        }

        if(!(await checkJoinInTime(request.body.id))){
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
        const role = await friendsLeagueDatabase.getRole(request.body.id, request.user.user_id);
        if(role != 'admin'){
            response.send('Not Admin');
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
        // console.log(getCurrentTime(request.body.timezone));
        // console.log(getDate(request.body.start_date));
        // console.log(request.body);
        const role = await friendsLeagueDatabase.getRole(request.body.id, request.user.user_id);
        if(role != 'admin'){
            response.send('Not Admin');
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
            const res = await memberAddedInLeague(request.body.id);
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
        
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role == null || role == 'request'){
            response.send('Not Member');
            return;
        }
        const ret = await friendsLeagueDatabase.getFriendsLeagueTeams(request.params.id);
        const teams = {
            teams: ret,
            role: role
        }
        response.send(teams);
    }catch(error){
        response.status(400);
    }
}

module.exports.getFriendsLeagueRequests = async (request, response) => {
    try{
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role != 'admin'){
            response.send('Not Admin');
            return;
        }
        var ret = await friendsLeagueDatabase.getFriendsLeagueRequests(request.params.id);
        
        var res = [];
        for(var i = 0; i < ret.length; i++){
            console.log(ret[i].user_id);
            res.push(await userDatabase.getUserToShow(ret[i].user_id));
            console.log(ret[ret.length - 1]);
        }
        
        const requests = {
            requests: res,
            role: role
        }
        response.send(requests);
    }catch(error){
        response.status(400);
    }
}

module.exports.handleFriendsLeagueRequest = async (request, response) => {
    try{
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role != 'admin'){
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

async function getScoreLineUtil(match_id){
    const match = await friendsLeagueDatabase.getMatchById(match_id);
    if(match == null){
        return null;
    }
    if(match.scoreline == null){
        return null;
    }
    return match.scoreline;
}

async function changeFormat(playingXI){
    // console.log(playingXI);
    var ret = {
        user_id: playingXI.user_id,
        match_id: playingXI.match_id,
        formation: playingXI.formation,
        captain: playingXI.captain,
        players: {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            forwards: []
        }
    };
    for(var i = 1; i <= 16; i++){
        if(playingXI[`player_${i}`] != null){
            const player = await playerDatabase.getPlayerByIdWithTeam(playingXI[`player_${i}`]);
            // console.log(player);
            if(player != null){
                ret.players[invertPositionNameConverter[player.position]].push(player);
            }
        }
    }

    return ret;
}
            

function checkSquadWithPlayingXI(squad, playingXI, team_player_count){
    var playerSet = new Set();
    for(var i = 1; i <= 16; i++){
        if(playingXI[`player_${i}`] != null)
            playerSet.add(playingXI[`player_${i}`]);
    }
    // console.log(playerSet);
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
    return count == team_player_count && playerSet.size == team_player_count && playerSet.has(playingXI.captain);
}

function checkSquadWithPlayingXI2(squad, playingXI, team_player_count){
    var playerSet = new Set();
    for(var i = 0; i < playingXI.players.length; i++){
        if(playingXI.players[i] != null)
            playerSet.add(playingXI.players[i]);
    }
    // console.log(playerSet);
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
    return count == team_player_count && playerSet.size == team_player_count && playerSet.has(playingXI.captain);
}
async function generatePlayingXI(team_id, team_player_count, match_id, squad){
    if(team_player_count == 0){
        return null;
    }
    var ret = {
        user_id: team_id,
        match_id: match_id,
        formation: null,
        captain: null,
        players: {
            goalkeepers: [],
            defenders: [],
            midfielders: [],
            forwards: []
        }
    };
    // console.log(squad);
    // console.log(team_player_count);
    // console.log(match_id);
    // console.log(team_id);
    var players = [];
    players.push(squad.goalkeeper_1);
    // console.log(players);
    // console.log(await playerDatabase.getPlayerByIdWithTeam(squad.goalkeeper_1));
    ret.players.goalkeepers.push(await playerDatabase.getPlayerByIdWithTeam(squad.goalkeeper_1));
    team_player_count--;
    // console.log(team_player_count);
    // console.log(ret);
    var formation = [0, 0, 0];
    for(var i = 1; i <= 5; i++){
        if(team_player_count == 0)
            break;
        players.push(squad[`defender_${i}`]);
        ret.players.defenders.push(await playerDatabase.getPlayerByIdWithTeam(squad[`defender_${i}`]));
        team_player_count--;
        formation[0]++;
    }

    for(var i = 1; i <= 5; i++){
        if(team_player_count == 0)
            break;
        players.push(squad[`midfielder_${i}`]);
        ret.players.midfielders.push(await playerDatabase.getPlayerByIdWithTeam(squad[`midfielder_${i}`]));
        team_player_count--;
        formation[1]++;
    }

    for(var i = 1; i <= 4; i++){
        if(team_player_count == 0)
            break;
        players.push(squad[`forward_${i}`]);
        ret.players.forwards.push(await playerDatabase.getPlayerByIdWithTeam(squad[`forward_${i}`]));
        team_player_count--;
        formation[2]++;
    }

    if(team_player_count != 0){
        return null;
    }

    ret.formation = formation.join('-');
    ret.captain = players[Math.floor(Math.random() * players.length)];
    const res = await friendsLeagueDatabase.addPlayingXI(team_id, match_id, ret.formation, ret.captain, players);
    if(res){
        return ret;
    }
    return null;
}

async function getPlayingXI(team_id, fl_id, match_id){
    const fl_info = await friendsLeagueDatabase.getFriendsLeagueByID(fl_id);
    if(fl_info == null){
        return null;
    }
    const matchInfo = await friendsLeagueDatabase.getMatchById(match_id);
    if(matchInfo == null || matchInfo.home != team_id && matchInfo.away != team_id){
        return null;
    }
    const playingXI = await friendsLeagueDatabase.getPlayingXI(match_id, team_id);
    const squad = await squadDatabase.getSquad(team_id);
    if(playingXI != null && checkSquadWithPlayingXI(squad, playingXI, fl_info.team_player_count)){
        // console.log(await changeFormat(playingXI));
        return await changeFormat(playingXI);
    }
    return await generatePlayingXI(team_id, fl_info.team_player_count, match_id, squad);
}
function getScore(probability){
    var ret = 0;
    for(var i = 0; i < 5; i++){
        if(Math.random() < probability){
            ret++;
        }
    }
    return ret;
}

function estimateScoreLine(home_playingXI, away_playingXI){
    var home_scoring_probability = 0;
    var away_scoring_probability = 0;

    var ratio = 0.5;
    var sum_home_defence_effect = 0;
    var sum_away_defence_effect = 0;

    var sum_home_goalkeeper_effect = home_playingXI.players.goalkeepers[0].overall * ratio + home_playingXI.players.goalkeepers[0].points * (1 - ratio);
    var sum_away_goalkeeper_effect = away_playingXI.players.goalkeepers[0].overall * ratio + away_playingXI.players.goalkeepers[0].points * (1 - ratio);

    var sum_home_midfield_effect = 0;
    var sum_away_midfield_effect = 0;

    var sum_home_forward_effect = 0;
    var sum_away_forward_effect = 0;

    for(var i = 0; i < home_playingXI.players.defenders.length; i++){
        sum_home_defence_effect += home_playingXI.players.defenders[i].overall * ratio + home_playingXI.players.defenders[i].points * (1 - ratio);
    }

    for(var i = 0; i < away_playingXI.players.defenders.length; i++){
        sum_away_defence_effect += away_playingXI.players.defenders[i].overall * ratio + away_playingXI.players.defenders[i].points * (1 - ratio);
    }

    for(var i = 0; i < home_playingXI.players.midfielders.length; i++){
        sum_home_midfield_effect += home_playingXI.players.midfielders[i].overall * ratio + home_playingXI.players.midfielders[i].points * (1 - ratio);
    }

    for(var i = 0; i < away_playingXI.players.midfielders.length; i++){
        sum_away_midfield_effect += away_playingXI.players.midfielders[i].overall * ratio + away_playingXI.players.midfielders[i].points * (1 - ratio);
    }

    for(var i = 0; i < home_playingXI.players.forwards.length; i++){
        sum_home_forward_effect += home_playingXI.players.forwards[i].overall * ratio + home_playingXI.players.forwards[i].points * (1 - ratio);
    }

    for(var i = 0; i < away_playingXI.players.forwards.length; i++){
        sum_away_forward_effect += away_playingXI.players.forwards[i].overall * ratio + away_playingXI.players.forwards[i].points * (1 - ratio);
    }

    var home_attack_effect = sum_home_midfield_effect / 2 + sum_home_forward_effect;
    var away_attack_effect = sum_away_midfield_effect / 2 + sum_away_forward_effect;

    var home_defence_effect = sum_home_defence_effect + sum_home_goalkeeper_effect;
    var away_defence_effect = sum_away_defence_effect + sum_away_goalkeeper_effect;

    home_attack_effect = home_attack_effect * (1.2 + Math.random());
    away_attack_effect = away_attack_effect * (1 + Math.random());

    if(home_attack_effect > away_defence_effect){
        home_scoring_probability = 0.8;
    }else if(home_attack_effect <= 0){
        home_scoring_probability = 0.2;
    }else{
        home_scoring_probability = home_attack_effect / away_defence_effect;
    }

    if(away_attack_effect > home_defence_effect){
        away_scoring_probability = 0.8;
    }else if(away_attack_effect <= 0){
        away_scoring_probability = 0.2;
    }else{
        away_scoring_probability = away_attack_effect / home_defence_effect;
    }

    // console.log(home_scoring_probability, away_scoring_probability, Math.random());
    var home_goal = getScore(home_scoring_probability);
    var away_goal = getScore(away_scoring_probability);

    return `${home_goal}-${away_goal}`;
}


    

async function getScoreLine(match_id){
    const scoreline = await getScoreLineUtil(match_id);
    if(scoreline != null){
        return scoreline;
    }
    const match = await friendsLeagueDatabase.getMatchById(match_id);
    if(match == null){
        return null;
    }

    const fl_info = await friendsLeagueDatabase.getFriendsLeagueByID(match.friends_league);
    if(fl_info == null){
        return null;
    }

    if(getCurrentTime(fl_info.timezone) < match.time){
        return null;
    }
     
    const home_playingXI = await getPlayingXI(match.home, match.friends_league, match.id);
    const away_playingXI = await getPlayingXI(match.away, match.friends_league, match.id);
    // console.log(home_playingXI, away_playingXI);
    if(home_playingXI == null || away_playingXI == null){
        return null;
    }

    const ret = estimateScoreLine(home_playingXI, away_playingXI);
    const res = await friendsLeagueDatabase.updateScore(match_id, ret);
    if(res){
        return ret;
    }
    return null;
}

async function getFixtureUtil(id){
    const fl_info = await friendsLeagueDatabase.getFriendsLeagueByID(id);
    if(fl_info == null){
        return null;
    }

    const members = await friendsLeagueDatabase.getFriendsLeagueTeams(id);
    if(members == null || members.length < fl_info.min_teams){
        return null;
    }

    var matches = await friendsLeagueDatabase.getMatches(id);

    // console.log(matches);
    if(matches == null || matches.length == 0){
        return null;
    }

    for(var i = 0; i < matches.length; i++){
        matches[i].scoreline = await getScoreLine(matches[i].id);
    }
    return matches;
}

module.exports.getFixture = async (request, response) => {
    try{
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role == null || role == 'request'){
            response.send('Not a member');
            return;
        }
        // console.log('here');
        var ret = await getFixtureUtil(request.params.id);
        if(ret == null){
            response.send({
                status: 'Do not have enough members',
                role: role
            });
            return;
        }
        ret.sort((a, b) => {
            if(a.time == b.time){
                return a.home.localeCompare(b.home);
            }
            return a.time - b.time;
        });

        var fixture = {
            matches: [],
            role: role
        };
        for(var i = 0; i < ret.length; i++){
            if(i == 0 || ret[i].time.valueOf() != ret[i - 1].time.valueOf()){
                fixture.matches.push({
                    time: ret[i].time,
                    matches: []
                });
            }
            fixture.matches[fixture.matches.length - 1].matches.push(ret[i]);
        }
        response.send(fixture);
    }catch(error){
        response.status(400);
    }
}

module.exports.getStandingsUtil = async (id) => {
    var members = await friendsLeagueDatabase.getFriendsLeagueTeams(id);
    if(members == null){
        return null;
    }
    var standings = [];
    for(var i = 0; i < members.length; i++){
        const matches = await friendsLeagueDatabase.getMatchesOfUser(id, members[i].user_id);
        var goal_diff = 0;
        var points = 0;
        var wins = 0;
        var losses = 0;
        var draws = 0;
        var played = 0;
        for(var j = 0; j < matches.length; j++){
            const scoreline = await getScoreLine(matches[j].id);
            if(scoreline == null){
                continue;
            }
            played++;
            const score = scoreline.split('-');
            if(matches[j].home == members[i].user_id){
                goal_diff += parseInt(score[0]) - parseInt(score[1]);
                if(parseInt(score[0]) > parseInt(score[1])){
                    points += 3;
                    wins++;
                }else if(parseInt(score[0]) < parseInt(score[1])){
                    losses++;
                }else{
                    points++;
                    draws++;
                }
            }else{
                goal_diff += parseInt(score[1]) - parseInt(score[0]);
                if(parseInt(score[1]) > parseInt(score[0])){
                    points += 3;
                    wins++;
                }else if(parseInt(score[1]) < parseInt(score[0])){
                    losses++;
                }else{
                    points++;
                    draws++;
                }
            }
        }
        standings.push({
            user_id: members[i].user_id,
            points: points,
            wins: wins,
            losses: losses,
            draws: draws,
            goal_difference: goal_diff,
            played: played
        });
    }
    standings.sort((a, b) => {
        if(a.points == b.points){
            if(a.goal_difference == b.goal_difference){
                return b.wins - a.wins;
            }
            return b.goal_difference - a.goal_difference;
        }
        return b.points - a.points;
    });

    return {standings: standings};
}

module.exports.getStandings = async (request, response) => {
    try{
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role == null || role == 'request'){
            response.send('Not a member');
            return;
        }
        var standings = await this.getStandingsUtil(request.params.id);
        if(standings == null){
            response.send('Do not have enough members');
            return;
        }
        standings.role = role;
        response.send(standings);
    }catch(error){
        response.status(400);
    }
}

async function getBench(players, team_id){
    const squad = await squadDatabase.getSquad(team_id);
    if(squad == null){
        return null;
    }
    var ret = {
        goalkeepers: [],
        defenders: [],
        midfielders: [],
        forwards: []
    }
    var playerSet = new Set();
    for(var i = 0; i < players['goalkeepers'].length; i++){
        playerSet.add(players['goalkeepers'][i].id);
    }
    for(var i = 0; i < players['defenders'].length; i++){
        playerSet.add(players['defenders'][i].id);
    }
    for(var i = 0; i < players['midfielders'].length; i++){
        playerSet.add(players['midfielders'][i].id);
    }
    for(var i = 0; i < players['forwards'].length; i++){
        playerSet.add(players['forwards'][i].id);
    }

    for(var i = 1; i <= 2; i++){
        if(squad[`goalkeeper_${i}`] != null && !playerSet.has(squad[`goalkeeper_${i}`])){
            ret.goalkeepers.push(await playerDatabase.getPlayerByIdWithTeam(squad[`goalkeeper_${i}`]));
        }
    }

    for(var i = 1; i <= 5; i++){
        if(squad[`defender_${i}`] != null && !playerSet.has(squad[`defender_${i}`])){
            ret.defenders.push(await playerDatabase.getPlayerByIdWithTeam(squad[`defender_${i}`]));
        }
    }

    for(var i = 1; i <= 5; i++){
        if(squad[`midfielder_${i}`] != null && !playerSet.has(squad[`midfielder_${i}`])){
            ret.midfielders.push(await playerDatabase.getPlayerByIdWithTeam(squad[`midfielder_${i}`]));
        }
    }

    for(var i = 1; i <= 4; i++){
        if(squad[`forward_${i}`] != null && !playerSet.has(squad[`forward_${i}`])){
            ret.forwards.push(await playerDatabase.getPlayerByIdWithTeam(squad[`forward_${i}`]));
        }
    }

    return ret;
}
    
module.exports.getPlayingXI = async (request, response) => {
    try{
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role == null || role == 'request'){
            response.send('Not a member');
            return;
        }
        var playingXI = await getPlayingXI(request.user.user_id, request.params.id, request.body.match_id);
        if(playingXI == null){
            response.send('Not Your match');
            return;
        }
        var ret = {
            user_id: playingXI.user_id,
            match_id: playingXI.match_id,
            formation: playingXI.formation,
            captain: playingXI.captain,
            playingxi: playingXI.players,
            bench: await getBench(playingXI.players, request.user.user_id),
            role: role
        }
        
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}

module.exports.setPlayingXI = async (request, response) => {
    try{
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role == null || role == 'request'){
            response.send('Not a member');
            return;
        }
        const match = await friendsLeagueDatabase.getMatchById(request.body.match_id);
        if(match == null || match.home != request.user.user_id && match.away != request.user.user_id){
            response.send('Not Your match');
            return;
        }
        const fl_info = await friendsLeagueDatabase.getFriendsLeagueByID(request.params.id);
        if(fl_info == null){
            response.send('Not Your match');
            return;
        }
        if(getCurrentTime(fl_info.timezone) > match.time){
            response.send('Cannot change playing XI');
            return;
        }
        var cnt = 0;
        var form = request.body.formation.split('-');
        for(var i = 0; i < form.length; i++){
            cnt += parseInt(form[i]);
        }
        cnt++;
        if(cnt != fl_info.team_player_count){
            response.send('Invalid Formation');
            return;
        }
        if(request.body.captain == null || request.body.captain == undefined){
            response.send('Invalid Captain');
            return;
        }
        const squad = await squadDatabase.getSquad(request.user.user_id);
        if(squad == null){
            response.send('Invalid Squad');
            return;
        }
        if(!checkSquadWithPlayingXI2(squad, request.body, fl_info.team_player_count)){
            response.send('Invalid Playing XI');
            return;
        }
        const ret = await friendsLeagueDatabase.addPlayingXI(request.user.user_id, request.body.match_id, request.body.formation, request.body.captain, request.body.players);
        if(ret){
            response.send('Playing XI Added');
        }else{
            response.send('Playing XI Not Added');
        }
    }catch(error){
        response.status(400);
    }
}

module.exports.getMyMatches = async (request, response) => {
    try{
        const role = await friendsLeagueDatabase.getRole(request.params.id, request.user.user_id);
        if(role == null || role == 'request'){
            response.send('Not a member');
            return;
        }
        var matches = await friendsLeagueDatabase.getMatchesOfUser(request.params.id, request.user.user_id);
        if(matches == null){
            response.send('No Matches');
            return;
        }
        for(var i = 0; i < matches.length; i++){
            matches[i].scoreline = await getScoreLine(matches[i].id);
        }
        var ret = {
            matches: matches,
            role: role
        }
        response.send(ret);
    }catch(error){
        response.status(400);
    }
}