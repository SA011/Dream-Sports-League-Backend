const { Router } = require('express');
const playerDatabase = require('../database/players.js');
const router = Router();

router.get('/:position', async (request, response) => {
    const { position } = request.params;
    console.log(position);
    console.log(await playerDatabase.getPlayerByPosition(position));
    response.send(await playerDatabase.getPlayerByPosition(position));
});

module.exports = router;