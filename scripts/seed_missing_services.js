require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: process.env.DB_PORT,
});

async function runSeed() {
  try {
    console.log("1. Approving 4 existing pending/rejected providers...");
    await pool.query(`UPDATE provider_profiles SET status = 'approved' 
      WHERE business_name IN ('CoolBreeze Air Conditioning', 'David Electrical Services', 'Sparkle Clean Benin', 'WoodCraft Furniture & Carpentry')`);

    console.log("2. Adding 'Language Coach' to Swift Minds Coaching...");
    await pool.query(`UPDATE provider_profiles 
      SET services_offered = array_append(services_offered, 'Language Coach') 
      WHERE business_name = 'Swift Minds Coaching' AND NOT ('Language Coach' = ANY(services_offered))`);

    console.log("3. Creating Swift Wheels Transport (Driver)...");
    const driverCatRes = await pool.query("SELECT category_id FROM services WHERE name = 'Driver' LIMIT 1");
    if (driverCatRes.rows.length > 0) {
      const autoCatId = driverCatRes.rows[0].category_id;
      const driverExist = await pool.query("SELECT id FROM provider_profiles WHERE email = 'swiftwheels@gmail.com'");
      if (driverExist.rows.length === 0) {
         const hashedPass1 = await bcrypt.hash('provider123', 10);
         await pool.query(`INSERT INTO provider_profiles 
         (full_name, email, password_hash, phone, business_name, category_id, services_offered, bio, experience_years, location, rating, status) 
         VALUES ('Swift Wheels Admin', 'swiftwheels@gmail.com', $1, '08011223344', 'Swift Wheels Transport', $2, '{"Driver"}', 'Professional executive chauffeuring, airport transfers, and private taxi logistics.', 5, 'Benin City', 5.00, 'approved')`, 
         [hashedPass1, autoCatId]);
      }
    }

    console.log("4. Creating Justice Legal Partners (Lawyer)...");
    const lawyerCatRes = await pool.query("SELECT category_id FROM services WHERE name = 'Lawyer' LIMIT 1");
    if (lawyerCatRes.rows.length > 0) {
      const profCatId = lawyerCatRes.rows[0].category_id;
      const lawyerExist = await pool.query("SELECT id FROM provider_profiles WHERE email = 'justice.law@gmail.com'");
      if (lawyerExist.rows.length === 0) {
         const hashedPass2 = await bcrypt.hash('provider123', 10);
         await pool.query(`INSERT INTO provider_profiles 
         (full_name, email, password_hash, phone, business_name, category_id, services_offered, bio, experience_years, location, rating, status) 
         VALUES ('Justice Legal Admin', 'justice.law@gmail.com', $1, '08022334455', 'Justice Legal Partners', $2, '{"Lawyer"}', 'Reputable legal firm focusing on contract drafting, corporate consulting, and civil defense.', 12, 'Benin City', 5.00, 'approved')`, 
         [hashedPass2, profCatId]);
      }
    }

    console.log("✅ Seeding successfully completed.");

  } catch(e) {
    console.error("Error during seeding:", e);
  } finally {
    pool.end();
  }
}

runSeed();
