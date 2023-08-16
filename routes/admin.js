const { Router } = require('express');
const router = Router();
const adminController = require('../controller/adminController');
const passport = require('passport');

router.post('/login', passport.authenticate('local'), adminController.login);

router.post('/logout', adminController.logout);

router.get('/matchweek/:week', adminController.getMatchWeek);

router.post('/matchweek/:week', adminController.simulateMatch);

module.exports = router;