const { pool } = require('./connect.js');

const findPlayerByID = 'SELECT * FROM players WHERE id = $1::integer';
const findAllPlayer = 'SELECT * FROM players';
const findPlayerByPosition = 'SELECT players.id, players.name AS name, epl_teams.name AS team , players.overall, players.price, players.points \
                                FROM players JOIN epl_teams on players.team = epl_teams.id \
                                WHERE position = $1::text ORDER BY price DESC';
const findPlayerByPositionWithOrder = 'SELECT players.id, players.name AS name, epl_teams.name AS team , players.overall, players.price, players.points \
                                        FROM players JOIN epl_teams on players.team = epl_teams.id \
                                        WHERE position = $1::text ORDER BY price ASC LIMIT $2::integer';
const findPlayerByName = `SELECT * FROM players WHERE LOWER(name) LIKE '%' ||$1|| '%'`;

module.exports.getPlayerById = async (id) => {
    return ((await pool.query(findPlayerByID, [id])).rows);
}

module.exports.getAllPlayer = async () => {
    return ((await pool.query(findAllPlayer)).rows);
}

module.exports.getPlayerByPosition = async (pos) => {
    return ((await pool.query(findPlayerByPosition, [pos])).rows);
}

module.exports.getPlayerByPositionWithSortedOrder = async (pos, count) => {
    return ((await pool.query(findPlayerByPositionWithOrder, [pos, count])).rows);
}


module.exports.getPlayerByName = async (name) => {
    return ((await pool.query(findPlayerByName, [name.toLowerCase()])).rows);
}


