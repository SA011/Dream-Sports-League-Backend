const { Router } = require('express');
const squadController = require('../controller/squadController');
const playerController = require('../controller/playerController');


const router = Router();

router.get('/all/selectplayer/:position', playerController.allPlayerWithPosition);

router.use((req, res, next) => {
    if(req.user == null || req.user.role != 'user'){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});


router.get('/mysquad/selectplayer/:position', playerController.squadPlayerWithPosition);

router.get('/autopick', squadController.autopick);

router.get('', squadController.squad);

router.post('/build', squadController.buildSquad);

module.exports = router;