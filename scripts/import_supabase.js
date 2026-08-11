const { execSync } = require('child_process');
require('dotenv').config();

const psqlPath = '"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe"';
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const cmd = `${psqlPath} -h ${host} -p ${port} -U "${user}" -d "${dbName}" -v ON_ERROR_STOP=1 -f nation_market_hub_dump.sql`;

console.log(`Executing safe import to Supabase pooler...`);
try {
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, PGPASSWORD: password } });
  console.log('SQL Migration Successful!');
} catch(e) {
  console.error('SQL Migration Failed.', e.message);
  process.exit(1);
}
