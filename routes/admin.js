const { Router } = require('express');
const router = Router();
const adminController = require('../controller/adminController');
const passport = require('passport');

router.post('/login', passport.authenticate('local'), adminController.login);

router.post('/logout', adminController.logout);

router.get('/matchweek/:week', adminController.getMatchWeek);

router.post('/matchweek/unsimulate/:match_id', adminController.unSimulateMatch);

router.post('/matchweek/:match_id', adminController.simulateMatch);

router.get('/bestxi', adminController.getBestXI);

module.exports = router;