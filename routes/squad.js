const { Router } = require('express');
const squadController = require('../controller/squadController');
const playerController = require('../controller/playerController');


const router = Router();

router.use((req, res, next) => {
    if(req.user == null){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});

router.get('/all/selectplayer/:position', playerController.allPlayerWithPosition);

router.get('/autopick', squadController.autopick);

router.get('', squadController.squad);

router.post('/build', squadController.buildSquad);

module.exports = router;