const { Router } = require('express');
const router = Router();
const eplController = require('../controller/eplController.js');

router.get('/teams',  eplController.getTeams);

module.exports = router;