const { getConnection,  release} = require('./connect.js');

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
    const pool = await getConnection();
    const res = (await pool.query(findPlayerByID, [id])).rows;
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


