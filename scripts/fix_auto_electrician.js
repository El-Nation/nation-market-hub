require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});
pool.query("UPDATE provider_profiles SET services_offered = array_append(services_offered, 'Auto Electrician') WHERE business_name = 'David Electrical Services' AND NOT ('Auto Electrician' = ANY(services_offered))").then(()=>pool.end());
