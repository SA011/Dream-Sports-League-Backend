const { request, response } = require('express');
const playerDatabase = require('../database/players.js');
const squadDatabase = require('../database/squad.js');
const playerController = require('./playerController.js');
const userController = require('./userController.js');
const userID = 'red1';
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

const checkValidity = (squad, balance) => {
    // console.log(balance);
    const playerSet = new Set();
    for(var position in squad){
        squad[position].forEach(async (x) => {
            if(!playerController.validPlayer(x) == position){
                return false;
            }
            playerSet.add(x);
            const price = await playerController.playerPrice(x);
            // console.log(price);
            balance -= price;
        });
    }
    // console.log(balance);
    return balance >= 0 && playerSet.size == 16;
};

module.exports.autopick = async (request, response) => {
    response.send(await getLowestWorthSquad());
};

module.exports.squad = async (request, response) => {
    response.send(emptyList);
};

module.exports.buildSquad = async (request, response) => {
    const squad = request.body;
    if(!checkValidity(squad, await userController.getBalance(userID))){
        console.log('Invalid squad addition');
        response.sendStatus(400);
        return;
    }
    squadDatabase.buildSquad(userID, squad);
    response.sendStatus(201);
};