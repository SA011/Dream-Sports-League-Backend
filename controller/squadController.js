const playerDatabase = require('../database/players.js');

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

module.exports.autopick = async (request, response) => {
    response.send(await getLowestWorthSquad());
};

module.exports.squad = async (request, response) => {
    response.send(emptyList);
};
