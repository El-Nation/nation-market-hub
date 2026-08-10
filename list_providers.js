require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});
pool.query('SELECT full_name, email, business_name, status FROM provider_profiles ORDER BY created_at DESC')
  .then(r => console.log(JSON.stringify(r.rows, null, 2)))
  .catch(console.error)
  .finally(() => pool.end());
