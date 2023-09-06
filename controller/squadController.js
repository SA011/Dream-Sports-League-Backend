const { request, response } = require('express');
const playerDatabase = require('../database/players.js');
const squadDatabase = require('../database/squad.js');
const playerController = require('./playerController.js');

const emptyList = {
    players: {
        goalkeepers: [],
        defenders: [],
        midfielders: [],
        forwards: []
    },
    budget: 100
};

const getLowestWorthSquad = async () => {
    const GK = await playerDatabase.getPlayerByPositionWithSortedOrder('GK', 2);
    const DEF = await playerDatabase.getPlayerByPositionWithSortedOrder('DEF', 5);
    const MID = await playerDatabase.getPlayerByPositionWithSortedOrder('MID', 5);
    const FWD = await playerDatabase.getPlayerByPositionWithSortedOrder('FWD', 4);
    const mysquad = [ ...GK, ...DEF, ...MID, ...FWD];
    var sum = 0;
    mysquad.forEach((x) => {
        sum += x.price;
    });
    if(sum > 100){
        return emptyList;
    }
    sum = 100 - sum;
    const ret = {
        players: {
            goalkeepers: GK,
            defenders: DEF,
            midfielders: MID,
            forwards: FWD
        },
        budget: sum
    };
    return ret;
};

const checkValidity = async (squad, balance) => {
    // console.log(balance);
    // console.log(squad);
    const playerSet = new Set();
    for(var position in squad){
        // console.log(position);
        const playerInPosition = squad[position];
        // console.log(playerInPosition);
        for(var i = 0; i < playerInPosition.length; i++){
            const x = playerInPosition[i];
            // console.log(x);
            // console.log(await playerController.getPlayerPosition(x));
            const playerInfo = await playerController.getPlayerById(x);
            // console.log(playerInfo);
            if((playerInfo.position != position)){
                console.log(`${x} is ${playerInfo.position} but got ${position}`);
                // console.log(`${x} is ${await playerController.getPlayerPosition(x)} but tried ${position}`);
                return -1;
            }
            // console.log(x);
            playerSet.add(x);
            // console.log(price);
            balance -= playerInfo.price;
        }

        // console.log(position);
    }
        
    // console.log(balance);
    // console.log(playerSet.size);
    if(playerSet.size != 16)return -1;
    return balance;
};

module.exports.autopick = async (request, response) => {
    try{
        response.send(await getLowestWorthSquad());
    }catch(error){
        response.sendStatus(400);
    }
};

module.exports.squad = async (request, response) => {
    try{
        // console.log(request.user);
        // response.send(await squadDatabase.getSquad(request.user.user_id));
        // response.send(emptyList);
        const mysquad = await squadDatabase.getSquad(request.user.user_id);
        const curBalance = request.user.balance;
        // console.log(mysquad);
        var ret = {
            players: {
                goalkeepers: [],
                defenders: [],
                midfielders: [],
                forwards: []
            },
            budget: curBalance
        };
        // console.log(mysquad);
        var temp = [];
        for(var i = 1; i <= 2; i++){
            const id = mysquad[`goalkeeper_${i}`];
            // console.log(id);
            if(id){
                temp.push(id);
            }
        }
        // console.log(temp);
        ret.players.goalkeepers = await playerDatabase.getPlayersByIdWithTeam(temp);
        temp = [];
        
        // console.log(ret);
        for(var i = 1; i <= 5; i++){
            const id = mysquad[`defender_${i}`];
            if(id){
                temp.push(id);
            }
        }
        ret.players.defenders = await playerDatabase.getPlayersByIdWithTeam(temp);
        temp = [];
        
        
        for(var i = 1; i <= 5; i++){
            const id = mysquad[`midfielder_${i}`];
            if(id){
                temp.push(id);
            }
        }
        ret.players.midfielders = await playerDatabase.getPlayersByIdWithTeam(temp);
        temp = [];
        
        
        for(var i = 1; i <= 4; i++){
            const id = mysquad[`forward_${i}`];
            if(id){
                temp.push(id);
            }
        }
        ret.players.forwards = await playerDatabase.getPlayersByIdWithTeam(temp);
        
        response.send(ret);
        
    }catch(error){
        response.sendStatus(400);
    }
};

module.exports.buildSquad = async (request, response) => {
    try{
        const squad = request.body;
        // console.log(squad);
        const curBalance = await checkValidity(squad, 100);//await userController.getBalance(userID));
        if(curBalance < 0){
            console.log('Invalid squad addition');
            response.sendStatus(400);
            return;
        }
        // console.log(curBalance);
        await squadDatabase.buildSquad(request.user.user_id, squad, curBalance);
        response.sendStatus(201);
    } catch (error) {
        response.sendStatus(400);
    }
};