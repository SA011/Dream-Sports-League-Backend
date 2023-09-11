const { Router } = require('express');
const userController = require('../controller/userController');

const router = Router();

router.use('/islogin', (req, res) => res.send(req.user != null && req.user != undefined));

router.use((req, res, next) => {
    if(req.user == null || req.user.role != 'user'){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});


router.get('', userController.getUserInfo);

module.exports = router;