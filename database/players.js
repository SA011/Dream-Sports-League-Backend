const { getConnection,  release} = require('./connect.js');

const findPlayerByID = 'SELECT * FROM players WHERE id = $1::integer';
const findAllPlayer = 'SELECT * FROM players';
const findPlayerByPosition = 'SELECT players.id, players.name AS name, epl_teams.name AS team , players.overall, players.price, players.points, players.position \
                                FROM players JOIN epl_teams on players.team = epl_teams.id \
                                WHERE position = $1::text ORDER BY price DESC';

const findPlayerByIDwithTeam = 'SELECT players.id, players.name AS name, epl_teams.name AS team , players.overall, players.price, players.points, players.position \
                                FROM players JOIN epl_teams on players.team = epl_teams.id \
                                WHERE players.id = $1::integer';

const findPlayerByIDwithTeam11 = 'SELECT players.id, players.name AS name, epl_teams.name AS team , players.overall, players.price, players.points, players.position \
                                FROM players JOIN epl_teams on players.team = epl_teams.id \
                                WHERE players.id in ($1::integer, $2::integer, $3::integer, $4::integer, $5::integer, $6::integer, $7::integer, $8::integer, $9::integer, $10::integer, $11::integer)';
const findPlayerByIDwithTeam5 = 'SELECT players.id, players.name AS name, epl_teams.name AS team , players.overall, players.price, players.points, players.position \
                                FROM players JOIN epl_teams on players.team = epl_teams.id \
                                WHERE players.id in ($1::integer, $2::integer, $3::integer, $4::integer, $5::integer)';

const findPlayerByPositionWithOrder = 'SELECT players.id, players.name AS name, epl_teams.name AS team , players.overall, players.price, players.points \
                                        FROM players JOIN epl_teams on players.team = epl_teams.id \
                                        WHERE position = $1::text ORDER BY price ASC LIMIT $2::integer';
const findPlayerByName = `SELECT * FROM players WHERE LOWER(name) LIKE '%' ||$1|| '%'`;

const updatePlayerPointsCommand = 'UPDATE players SET points = (points + $1::integer) WHERE id = $2::integer';

module.exports.getPlayerById = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(findPlayerByID, [id])).rows;
    release(pool);
    console.log(res);
    if(res.length != 1)return null;
    return res[0];
}
module.exports.getPlayerByIdWithTeam = async (id) => {
    const pool = await getConnection();
    const res = (await pool.query(findPlayerByIDwithTeam, [id])).rows;
    if(res.length != 1)return null;
    release(pool);
    return res[0];
}


module.exports.getPlayersByIdWithTeam = async (ids) => {
    const pool = await getConnection();
    var res = [];
    // console.log(ids.length);
    if(ids.length == 11) res = (await pool.query(findPlayerByIDwithTeam11, ids)).rows;
    else if (ids.length == 5) res = (await pool.query(findPlayerByIDwithTeam5, ids)).rows;
    else {
        for(var i = 0; i < ids.length; i++){
            res.push((await pool.query(findPlayerByIDwithTeam, [ids[i]])).rows[0]);
        }
    }
    release(pool);
    return res;
}
module.exports.getAllPlayer = async () => {
    const pool = await getConnection();
    const res = (await pool.query(findAllPlayer)).rows;
    release(pool);
    return res;
}

module.exports.getPlayerByPosition = async (pos) => {
    const pool = await getConnection();
    const res = (await pool.query(findPlayerByPosition, [pos])).rows;
    release(pool);
    return res;
}

module.exports.getPlayerByPositionWithSortedOrder = async (pos, count) => {
    const pool = await getConnection();
    const res = (await pool.query(findPlayerByPositionWithOrder, [pos, count])).rows;
    release(pool);
    return res;
}


module.exports.getPlayerByName = async (name) => {
    const pool = await getConnection();
    const res = (await pool.query(findPlayerByName, [name.toLowerCase()])).rows;
    release(pool);
    return res;
}


module.exports.updatePlayerPoints = async (id, points) => {
    console.log(id, points);
    const pool = await getConnection();
    const res = (await pool.query(updatePlayerPointsCommand, [points, id]));
    release(pool);
}