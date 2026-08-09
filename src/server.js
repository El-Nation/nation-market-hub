// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parsing middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
    res.send("Nation Market Hub API is running!");
});

// Database test route
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW() as current_time, current_database() as database_name;");
        res.json({
            success: true,
            message: "Successfully connected to PostgreSQL!",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Database connection error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to connect to PostgreSQL database",
            error: error.message,
        });
    }
});

// GET /api/categories - Fetch all service categories
app.get("/api/categories", async (req, res) => {
    try {
        const queryText = `
            SELECT c.*, COUNT(s.id)::int as service_count 
            FROM categories c 
            LEFT JOIN services s ON c.id = s.category_id 
            GROUP BY c.id 
            ORDER BY c.name ASC;
        `;
        const result = await db.query(queryText);
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching categories:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching categories",
        });
    }
});

// GET /api/categories/:slug/services - Fetch services under a specific category
app.get("/api/categories/:slug/services", async (req, res) => {
    const { slug } = req.params;
    try {
        const categoryResult = await db.query("SELECT * FROM categories WHERE slug = $1;", [slug]);
        if (categoryResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const category = categoryResult.rows[0];
        const servicesResult = await db.query(
            "SELECT * FROM services WHERE category_id = $1 ORDER BY name ASC;",
            [category.id]
        );

        res.json({
            success: true,
            category: category,
            services: servicesResult.rows,
        });
    } catch (error) {
        console.error("Error fetching category services:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching services",
        });
    }
});

// GET /api/providers - Search and filter service providers
app.get("/api/providers", async (req, res) => {
    const { search, category, location } = req.query;

    try {
        let queryValues = [];
        let conditions = ["p.status = 'approved'"];
        let paramIndex = 1;

        // Filter by category ID or Category slug if provided
        if (category) {
            if (!isNaN(Number(category))) {
                conditions.push(`p.category_id = $${paramIndex}`);
                queryValues.push(Number(category));
                paramIndex++;
            } else {
                conditions.push(`c.slug = $${paramIndex}`);
                queryValues.push(category);
                paramIndex++;
            }
        }

        // Filter by location
        if (location) {
            conditions.push(`LOWER(p.location) LIKE $${paramIndex}`);
            queryValues.push(`%${location.toLowerCase()}%`);
            paramIndex++;
        }

        // Keyword search (matches full_name, business_name, bio, or services_offered)
        if (search && search.trim() !== "") {
            conditions.push(`(
                p.full_name ILIKE $${paramIndex} OR 
                p.business_name ILIKE $${paramIndex} OR 
                p.bio ILIKE $${paramIndex} OR 
                array_to_string(p.services_offered, ' ') ILIKE $${paramIndex}
            )`);
            queryValues.push(`%${search.trim()}%`);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const queryText = `
            SELECT 
                p.id, p.full_name, p.email, p.phone, p.business_name, 
                p.category_id, p.services_offered, p.bio, p.experience_years, 
                p.location, p.rating, p.status, p.avatar_url, p.created_at,
                c.name as category_name, 
                c.slug as category_slug
            FROM provider_profiles p
            JOIN categories c ON p.category_id = c.id
            ${whereClause}
            ORDER BY p.rating DESC, p.created_at DESC;
        `;

        const result = await db.query(queryText, queryValues);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching providers:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching provider listings",
            error: error.message,
        });
    }
});

// POST /api/providers/register - Service Provider Registration
app.post("/api/providers/register", async (req, res) => {
    const {
        full_name,
        email,
        password,
        phone,
        business_name,
        category_id,
        services_offered,
        bio,
        experience_years,
        location,
        avatar_url,
    } = req.body;

    // Basic Input Validation
    if (!full_name || !email || !password || !phone || !category_id) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields (Full Name, Email, Password, Phone, Category).",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long.",
        });
    }

    try {
        // Check if provider email already exists
        const existingCheck = await db.query("SELECT id FROM provider_profiles WHERE LOWER(email) = LOWER($1);", [email]);
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email address already exists.",
            });
        }

        // Hash password securely
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Normalize services offered array
        const formattedServices = Array.isArray(services_offered) ? services_offered : [services_offered || "General Service"];

        // Insert new provider profile with default status 'pending'
        const insertQuery = `
            INSERT INTO provider_profiles (
                full_name, email, password_hash, phone, business_name, 
                category_id, services_offered, bio, experience_years, 
                location, rating, status, avatar_url
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id, full_name, email, phone, business_name, category_id, status, created_at;
        `;

        const queryValues = [
            full_name.trim(),
            email.trim().toLowerCase(),
            password_hash,
            phone.trim(),
            business_name ? business_name.trim() : null,
            parseInt(category_id, 10),
            formattedServices,
            bio ? bio.trim() : "Service provider on Nation Market Hub",
            parseInt(experience_years || 1, 10),
            location ? location.trim() : "Benin City",
            5.00,
            "pending", // Mandatory moderation workflow!
            avatar_url || null,
        ];

        const result = await db.query(insertQuery, queryValues);

        res.status(201).json({
            success: true,
            message: "Provider registration successful! Your profile is pending administrator approval before public listing.",
            provider: result.rows[0],
        });
    } catch (error) {
        console.error("Provider registration error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error registering service provider",
            error: error.message,
        });
    }
});

// Start the server and test database connectivity
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    try {
        const res = await db.query("SELECT NOW();");
        console.log("Database connection successful at:", res.rows[0].now);
    } catch (err) {
        console.error("Warning: Initial database connection check failed:", err.message);
    }
});