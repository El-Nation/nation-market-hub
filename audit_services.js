require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

async function audit() {
  try {
    const servicesRes = await pool.query('SELECT name, category_id, slug FROM services ORDER BY name ASC');
    const services = servicesRes.rows;
    
    const providersRes = await pool.query("SELECT business_name, full_name, services_offered, status FROM provider_profiles WHERE status = 'approved'");
    const providers = providersRes.rows;

    const report = services.map(srv => {
      // services_offered is TEXT[], usually stored as an array of strings in js
      const providersOffering = providers.filter(p => p.services_offered && p.services_offered.includes(srv.name));
      return {
        service: srv.name,
        providers: providersOffering.map(p => p.business_name || p.full_name),
        count: providersOffering.length
      };
    });

    console.log(JSON.stringify(report, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
audit();
