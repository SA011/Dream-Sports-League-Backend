const { Router } = require('express');
const playerController = require('../controller/playerController');
const router = Router();


router.use((req, res, next) => {
    if(req.user == null || req.user.role != 'user'){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});



module.exports = router;