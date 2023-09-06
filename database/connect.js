const { Pool } = require("pg");

const config = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: true
};

// module.exports.connect = async () => {
//     try {
//         await pool.connect();
//     } catch (error) {
//         console.log(error)
//     }
// };
 
// module.exports.pool = pool;

module.exports.getConnection = async () => {
    try {
        return new Pool(config);
    } catch (error) {
        console.log(error)
    }
}
module.exports.release = async (pool) => {
    try {
        await pool.end();
    } catch (error) {
        console.log(error)
    }
}
