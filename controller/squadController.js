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
            const temp = position.slice(0, position.length - 1);
            const curPos = await playerController.getPlayerPosition(x);
            if((curPos != temp)){
                console.log(`${x} is ${curPos} but got ${temp}`);
                // console.log(`${x} is ${await playerController.getPlayerPosition(x)} but tried ${position}`);
                return -1;
            }
            // console.log(x);
            playerSet.add(x);
            const price = await playerController.playerPrice(x);
            // console.log(price);
            balance -= price;
        }

        // console.log(position);
    }
        
    console.log(balance);
    console.log(playerSet.size);
    if(playerSet.size != 16)return -1;
    return balance;
};

module.exports.autopick = async (request, response) => {
    response.send(await getLowestWorthSquad());
};

module.exports.squad = async (request, response) => {
    response.send(emptyList);
};

module.exports.buildSquad = async (request, response) => {
    const squad = request.body;
    const curBalance = await checkValidity(squad, 100);//await userController.getBalance(userID));
    if(curBalance < 0){
        console.log('Invalid squad addition');
        response.sendStatus(400);
        return;
    }
    // console.log(curBalance);
    await squadDatabase.buildSquad(userID, squad, curBalance);
    response.sendStatus(201);
};