const { Router } = require('express');
const router = Router();

router.use('/players', require('./players.js'));

router.use('/squad', require('./squad.js'));

router.use('/auth', require('./auth.js'));

module.exports = router;