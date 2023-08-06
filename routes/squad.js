const { Router } = require('express');
const squadController = require('../controller/squadController');
const playerController = require('../controller/playerController');

const router = Router();

router.get('/autopick', squadController.autopick);

router.get('', squadController.squad);

router.get('/all/selectplayer/:position', playerController.allPlayerWithPosition);

module.exports = router;