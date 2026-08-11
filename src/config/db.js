const { Pool } = require("pg");

// Create a connection pool using environment variables loaded from .env
const pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "nation_market_hub",
    password: process.env.DB_PASSWORD || "postgres",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

// Helper function to run SQL queries easily throughout the application
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
