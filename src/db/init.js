require("dotenv").config();
const fs = require("fs");
const path = require("path");
const db = require("../config/db");

async function initDatabase() {
    try {
        console.log("Initializing nation_market_hub database schema...");
        
        // Read schema and seed SQL files
        const schemaPath = path.join(__dirname, "schema.sql");
        const seedPath = path.join(__dirname, "seed.sql");

        const schemaSql = fs.readFileSync(schemaPath, "utf-8");
        const seedSql = fs.readFileSync(seedPath, "utf-8");

        // Execute SQL scripts
        console.log("Creating tables...");
        await db.query(schemaSql);
        console.log("Tables created successfully!");

        console.log("Seeding categories and services data...");
        await db.query(seedSql);
        console.log("Database seeded successfully!");

        // Verify inserted data
        const catRes = await db.query("SELECT COUNT(*) FROM categories;");
        const servRes = await db.query("SELECT COUNT(*) FROM services;");

        console.log(`Summary: ${catRes.rows[0].count} categories and ${servRes.rows[0].count} services populated.`);
        process.exit(0);
    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1);
    }
}

initDatabase();
