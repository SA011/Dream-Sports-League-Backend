const { Router } = require('express');
const authController = require('../controller/authController');
const passport = require('passport');
const { route } = require('./admin');
const router = Router();

// router.post('/register', authController.register);

// router.post('/login', authController.login);
router.post('/login', passport.authenticate('local'), authController.login);
router.post('/register', passport.authenticate('local-register'), authController.register);
router.post('/logout', authController.logout);


module.exports = router;