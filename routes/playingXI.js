const { Router } = require('express');
const playingXIController = require('../controller/playingXIController');


const router = Router();


router.use((req, res, next) => {
    if(req.user == null || req.user.role != 'user'){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});


router.get('/:match_id', playingXIController.getPlayingXI);

router.post('/:match_id', playingXIController.setPlayingXI);

module.exports = router;