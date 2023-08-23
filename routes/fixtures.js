const { Router } = require('express');
const fixtureController = require('../controller/fixtureController');
const { route } = require('./admin');
const router = Router();


router.get('/match/:id', fixtureController.getMatch);
router.get('/', fixtureController.getFixture);
router.get('/:id', fixtureController.getFixture);


module.exports = router;