const teamDatabase = require('../database/teamInfo');

module.exports.getTeams = async (req, res) => {
    // console.log('getTeams');
    const teams = await teamDatabase.getAllTeams();
    res.send(teams);
}

