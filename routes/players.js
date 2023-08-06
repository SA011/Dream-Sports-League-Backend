const { Router } = require('express');
const playerController = require('../controller/playerController');
const router = Router();

router.get('/all/selectplayer/:position', playerController.allPlayerWithPosition);


module.exports = router;