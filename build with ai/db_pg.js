require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const originalQuery = pool.query.bind(pool);

pool.query = async function (sql, params) {
    // Convert ? to $1, $2, etc.
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    
    const result = await originalQuery(pgSql, params);
    
    // Return an array with [rows, fields] to mock mysql2 output format
    return [result.rows, result.fields];
};

module.exports = pool;
