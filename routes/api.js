const { Router } = require('express');
const router = Router();

router.use('/players', require('./players.js'));

router.use('/squad', require('./squad.js'));

router.use('/auth', require('./auth.js'));

router.use('/profile', require('./profile.js'));

router.use('/playingxi', require('./playingXI.js'));

router.use('/admin', require('./admin.js'));

router.use('/fixtures', require('./fixtures.js'));

router.use('/transferwindow', require('./transferWindow.js'));

module.exports = router;