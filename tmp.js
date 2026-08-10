require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool();
pool.query("SELECT * FROM admins WHERE email = 'lewisdunk170@gmail.com'")
  .then(r => console.log('ADMIN:', r.rows))
  .catch(console.error)
  .finally(() => pool.end());
