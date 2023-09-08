const router = require('express').Router();
const friendsLeagueController = require('../controller/friendsLeagueController.js');

router.get('/all', friendsLeagueController.getAllFriendsLeagues);

router.use((req, res, next) => {
    if(req.user == null || req.user.role != 'user'){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});

router.get('/', friendsLeagueController.getMyFriendsLeague);

router.post('/create', friendsLeagueController.createFriendsLeague);

router.post('/join', friendsLeagueController.joinFriendsLeague);

router.post('/leave', friendsLeagueController.leaveFriendsLeague);

router.post('/delete', friendsLeagueController.deleteFriendsLeague);

router.post('/update', friendsLeagueController.updateFriendsLeague);

router.get('/:id', friendsLeagueController.getFriendsLeagueById);

router.get('/:id/teams', friendsLeagueController.getFriendsLeagueTeams);

router.get('/:id/requests', friendsLeagueController.getFriendsLeagueRequests);

router.post('/:id/requests', friendsLeagueController.handleFriendsLeagueRequest);

router.get('/:id/fixture', friendsLeagueController.getFixture);

module.exports = router;