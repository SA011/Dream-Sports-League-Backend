const { Router } = require('express');
const router = Router();
const adminController = require('../controller/adminController');
const passport = require('passport');

router.post('/login', passport.authenticate('local'), adminController.login);

router.post('/logout', adminController.logout);

router.get('/matchweek/:week', adminController.getMatchWeek);

router.post('/matchweek/:match_id', adminController.simulateMatch);

module.exports = router;