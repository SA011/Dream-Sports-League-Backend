const playersDatabase = require('../database/players');
const squadDatabase = require('../database/squad');
const userDatabase = require('../database/users');
module.exports.getTransferWindow = async (req, res) => {
    // console.log(req.user);
    const curUser = await userDatabase.getUser(req.user.user_id);
    res.send({
        balance: curUser.balance,
        transfer_count: curUser.wildcard,
        transfer_limit: 2
    });
}

module.exports.confirmTransfer = async (req, res) => {
    if(req.user.wildcard <= 0){
        res.send("You have no wildcard left");
        return;
    }
    const myplayer = await playersDatabase.getPlayerById(req.body.my_player);
    const newplayer = await playersDatabase.getPlayerById(req.body.new_player);
    if(myplayer == null || newplayer == null){
        res.send("Invalid player");
        return;
    }
    if(myplayer.position != newplayer.position){
        res.send("Invalid player");
        return;
    }
    if(req.user.balance < newplayer.price - myplayer.price){
        res.send("Not enough balance");
        return;
    }
    const ret = await squadDatabase.updatePlayer(req.user.user_id, myplayer.id, newplayer.id);
    if(ret == true){
        const ret1 = await squadDatabase.updateWildCard(req.user.user_id, req.user.wildcard - 1);
        const ret2 = await userDatabase.updateUserBalance(req.user.user_id, req.user.balance - newplayer.price + myplayer.price);
        if(ret1 == false || ret2 == false){
            res.send("Transfer failed");
            return;
        }else
            res.send("Transfer successful");
        
    }else{
        res.send("Transfer failed");
    }
}