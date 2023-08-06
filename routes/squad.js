const { Router } = require('express');
const router = Router();
const squadController = require('../controller/squadController');
const playerController = require('../controller/playerController');

router.get('/autopick', squadController.autopick);

router.get('', squadController.squad);

router.get('/all/selectplayer/:position', playerController.allPlayerWithPosition);

module.exports = router;