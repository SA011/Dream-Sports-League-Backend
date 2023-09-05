const {Router} = require('express');
const statsController = require('../controller/statsController');

const router = Router();

router.get('/teams', statsController.getAllTeams);

router.get('/players', statsController.getAllPlayers);

module.exports = router;