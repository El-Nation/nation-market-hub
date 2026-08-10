require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

async function runAudit() {
  const report = {};
  try {
    // 1. Provider Coverage
    const servicesRes = await pool.query('SELECT name FROM services');
    const totalServices = servicesRes.rowCount;
    report.total_services = totalServices;
    
    // Check coverage
    const providersRes = await pool.query("SELECT services_offered FROM provider_profiles WHERE status = 'approved'");
    const allOffered = providersRes.rows.flatMap(r => r.services_offered || []);
    const uniqueOffered = new Set(allOffered);
    let coveredCount = 0;
    servicesRes.rows.forEach(s => {
      if (uniqueOffered.has(s.name)) coveredCount++;
    });
    report.services_covered = coveredCount;
    report.empty_services = totalServices - coveredCount;

    // 2. Providers Stats
    const pTotal = await pool.query("SELECT COUNT(*) FROM provider_profiles");
    const pAppr = await pool.query("SELECT COUNT(*) FROM provider_profiles WHERE status = 'approved'");
    const pPend = await pool.query("SELECT COUNT(*) FROM provider_profiles WHERE status = 'pending'");
    const pRej = await pool.query("SELECT COUNT(*) FROM provider_profiles WHERE status = 'rejected'");
    report.total_providers = pTotal.rows[0].count;
    report.approved_providers = pAppr.rows[0].count;
    report.pending_providers = pPend.rows[0].count;
    report.rejected_providers = pRej.rows[0].count;

    // 7. DB Integrity
    const dupEmails = await pool.query("SELECT email, COUNT(*) FROM provider_profiles GROUP BY email HAVING COUNT(*) > 1");
    report.duplicate_providers = dupEmails.rowCount;

    const dupServices = await pool.query("SELECT name, COUNT(*) FROM services GROUP BY name HAVING COUNT(*) > 1");
    report.duplicate_services = dupServices.rowCount;
    
    console.log(JSON.stringify(report, null, 2));

  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
runAudit();
