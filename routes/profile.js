const { Router } = require('express');
const userController = require('../controller/userController');
const { use } = require('passport');


const router = Router();

router.use((req, res, next) => {
    if(req.user == null || req.user.role != 'user'){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});


router.get('', userController.getUserInfo);

module.exports = router;