const userDatabase = require('./users');
const level = [0, 50, 100, 200, 500, 1000000]
const playerLevel = [0, 75, 80, 85, 90, 100]
const levelName = ['Beginner', 'Amateur', 'Semi-Pro', 'Pro', 'World Class', 'Legend']

module.exports.getPlayerLevel = async(points) => {
    var ret = {
        level: 0,
        levelName: 'Beginner',
        lowerBound: 0,
        upperBound: 50
    };
    for(var i = 0; i < playerLevel.length; i++){
        if(points >= playerLevel[i]){
            ret.level = i;
            ret.levelName = levelName[i];
            ret.lowerBound = level[i];
            ret.upperBound = level[i + 1];
        }
    }
    return ret;
};

module.exports.getLevel = async(points) => {
    var ret = {
        level: 0,
        levelName: 'Beginner',
        lowerBound: 0,
        upperBound: 50
    };
    for(var i = 0; i < level.length; i++){
        if(points >= level[i]){
            ret.level = i;
            ret.levelName = levelName[i];
            ret.lowerBound = level[i];
            ret.upperBound = level[i + 1];
        }
    }
    return ret;
};

module.exports.getUserLevel = async(userid) => {
    const user = await userDatabase.getUser(userid);
    return await this.getLevel(user.points);
};