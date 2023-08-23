const { Router } = require('express');
const router = Router();
const transferWindowController = require('../controller/transferWindowController.js');


router.use((req, res, next) => {
    if(req.user == null || req.user.role != 'user'){
        res.status(401).send('Unauthorized');
    }else{
        next();
    }
});

router.get('/', transferWindowController.getTransferWindow);
router.post('/', transferWindowController.confirmTransfer);

module.exports = router;