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
                c.slug as category_slug,
                COUNT(r.id)::int as review_count
            FROM provider_profiles p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN provider_reviews r ON p.id = r.provider_id
            ${whereClause}
            GROUP BY p.id, c.id
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

// POST /api/providers/login - Provider Login Endpoint
app.post("/api/providers/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please provide both email and password.",
        });
    }

    try {
        const queryText = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM provider_profiles p
            JOIN categories c ON p.category_id = c.id
            WHERE LOWER(p.email) = LOWER($1);
        `;
        const result = await db.query(queryText, [email.trim()]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email address or password.",
            });
        }

        const provider = result.rows[0];

        // Verify password using bcrypt
        const passwordMatches = await bcrypt.compare(password, provider.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email address or password.",
            });
        }

        // Exclude password hash from response
        const { password_hash, ...providerProfile } = provider;

        res.json({
            success: true,
            message: "Login successful!",
            provider: providerProfile,
        });
    } catch (error) {
        console.error("Provider login error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error authenticating service provider",
            error: error.message,
        });
    }
});

// POST /api/enquiries - Submit a new Customer Service Request / Enquiry
app.post("/api/enquiries", async (req, res) => {
    const { provider_id, customer_name, customer_phone, customer_email, location, service_description } = req.body;

    // Validation
    if (!provider_id || !customer_name || !customer_phone || !service_description) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields (Provider ID, Your Name, Phone Number, Service Description).",
        });
    }

    try {
        // Verify target provider exists and is approved
        const providerCheck = await db.query("SELECT id, full_name, business_name FROM provider_profiles WHERE id = $1 AND status = 'approved';", [provider_id]);
        if (providerCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Target service provider not found or not active.",
            });
        }

        const insertQuery = `
            INSERT INTO service_enquiries (
                provider_id, customer_name, customer_phone, customer_email, location, service_description, status
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, provider_id, customer_name, customer_phone, customer_email, location, service_description, status, created_at;
        `;

        const queryValues = [
            parseInt(provider_id, 10),
            customer_name.trim(),
            customer_phone.trim(),
            customer_email ? customer_email.trim().toLowerCase() : null,
            location ? location.trim() : "Benin City",
            service_description.trim(),
            "pending",
        ];

        const result = await db.query(insertQuery, queryValues);

        res.status(201).json({
            success: true,
            message: "Your service request has been sent to the provider successfully!",
            data: result.rows[0],
            provider: providerCheck.rows[0],
        });
    } catch (error) {
        console.error("Error submitting customer enquiry:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error submitting service enquiry",
            error: error.message,
        });
    }
});

// GET /api/providers/:id/enquiries - Fetch all customer enquiries for a provider
app.get("/api/providers/:id/enquiries", async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
            SELECT e.*, p.business_name, p.full_name as provider_name 
            FROM service_enquiries e 
            JOIN provider_profiles p ON e.provider_id = p.id 
            WHERE e.provider_id = $1 
            ORDER BY e.created_at DESC;
        `;
        const result = await db.query(queryText, [id]);
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching provider enquiries:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching provider enquiries",
        });
    }
});

// PATCH /api/enquiries/:id/status - Update enquiry status
app.patch("/api/enquiries/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "contacted", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
    }

    try {
        const updateQuery = "UPDATE service_enquiries SET status = $1 WHERE id = $2 RETURNING *;";
        const result = await db.query(updateQuery, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found",
            });
        }

        res.json({
            success: true,
            message: `Enquiry status updated to ${status}`,
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating enquiry status:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error updating enquiry status",
        });
    }
});

// GET /api/providers/:id/reviews - Fetch all reviews for a provider
app.get("/api/providers/:id/reviews", async (req, res) => {
    const { id } = req.params;
    try {
        const queryText = `
            SELECT * FROM provider_reviews 
            WHERE provider_id = $1 
            ORDER BY created_at DESC;
        `;
        const result = await db.query(queryText, [id]);
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching provider reviews:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching provider reviews",
        });
    }
});

// POST /api/providers/:id/reviews - Submit customer review and recalculate provider rating
app.post("/api/providers/:id/reviews", async (req, res) => {
    const { id } = req.params;
    const { customer_name, rating, review_text } = req.body;

    if (!customer_name || !rating || !review_text) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields (Your Name, Rating, Review Text).",
        });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({
            success: false,
            message: "Rating must be a number between 1 and 5.",
        });
    }

    try {
        // Verify provider exists
        const providerCheck = await db.query("SELECT id FROM provider_profiles WHERE id = $1;", [id]);
        if (providerCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Provider not found.",
            });
        }

        // Insert review
        const insertQuery = `
            INSERT INTO provider_reviews (provider_id, customer_name, rating, review_text) 
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const reviewResult = await db.query(insertQuery, [id, customer_name.trim(), numericRating, review_text.trim()]);

        // Recalculate average rating for provider profile
        const avgResult = await db.query(
            "SELECT ROUND(AVG(rating)::numeric, 2) as new_rating FROM provider_reviews WHERE provider_id = $1;",
            [id]
        );
        const newRating = avgResult.rows[0].new_rating || numericRating;

        await db.query("UPDATE provider_profiles SET rating = $1 WHERE id = $2;", [newRating, id]);

        res.status(201).json({
            success: true,
            message: "Thank you for your feedback! Your review has been submitted.",
            review: reviewResult.rows[0],
            new_provider_rating: newRating,
        });
    } catch (error) {
        console.error("Error submitting review:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error submitting review",
            error: error.message,
        });
    }
});

// POST /api/auth/login - Unified Authentication Endpoint (Admin, Provider, Customer)
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required.",
        });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Administrator Credentials
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@nationhub.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (cleanEmail === adminEmail && password === adminPassword) {
        return res.json({
            success: true,
            role: "admin",
            message: "Admin authentication successful!",
            user: {
                name: "System Administrator",
                email: adminEmail,
                role: "Super Admin",
            },
        });
    }

    // 2. Check Service Provider Credentials in Database
    try {
        const result = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM provider_profiles p 
             JOIN categories c ON p.category_id = c.id 
             WHERE LOWER(p.email) = $1;`,
            [cleanEmail]
        );

        if (result.rows.length > 0) {
            const provider = result.rows[0];
            const isMatch = await bcrypt.compare(password, provider.password_hash);
            
            if (isMatch) {
                const { password_hash, ...safeProvider } = provider;
                return res.json({
                    success: true,
                    role: "provider",
                    message: "Provider login successful!",
                    user: safeProvider,
                });
            }
        }
    } catch (dbErr) {
        console.error("Error during provider auth check:", dbErr.message);
    }

    return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
    });
});

// POST /api/admin/login - Platform Admin Authentication
app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required.",
        });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@nationhub.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email.toLowerCase() === adminEmail && password === adminPassword) {
        return res.json({
            success: true,
            message: "Admin authentication successful!",
            admin: {
                name: "System Administrator",
                email: adminEmail,
                role: "Super Admin",
            },
        });
    }

    return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
    });
});

// GET /api/admin/providers - Fetch all provider applications for moderation
app.get("/api/admin/providers", async (req, res) => {
    const { status } = req.query;

    let queryText = `
        SELECT 
            p.*, 
            c.name as category_name,
            COUNT(r.id)::int as review_count
        FROM provider_profiles p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN provider_reviews r ON p.id = r.provider_id
    `;
    const queryValues = [];

    if (status && status !== 'all') {
        queryText += ` WHERE p.status = $1`;
        queryValues.push(status);
    }

    queryText += ` GROUP BY p.id, c.id ORDER BY p.created_at DESC;`;

    try {
        const result = await db.query(queryText, queryValues);
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching admin providers:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching admin provider list",
        });
    }
});

// PATCH /api/admin/providers/:id/status - Approve, Reject, or Suspend provider profile
app.patch("/api/admin/providers/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "suspended"];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        });
    }

    try {
        const updateQuery = `
            UPDATE provider_profiles 
            SET status = $1 
            WHERE id = $2 
            RETURNING *;
        `;
        const result = await db.query(updateQuery, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Provider not found",
            });
        }

        res.json({
            success: true,
            message: `Provider status successfully updated to ${status}`,
            provider: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating provider status:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error updating provider status",
        });
    }
});

// GET /api/admin/stats - Platform Overview Health & Summary Metrics
app.get("/api/admin/stats", async (req, res) => {
    try {
        const totalProvidersRes = await db.query("SELECT COUNT(*)::int as count FROM provider_profiles;");
        const pendingProvidersRes = await db.query("SELECT COUNT(*)::int as count FROM provider_profiles WHERE status = 'pending';");
        const approvedProvidersRes = await db.query("SELECT COUNT(*)::int as count FROM provider_profiles WHERE status = 'approved';");
        const totalEnquiriesRes = await db.query("SELECT COUNT(*)::int as count FROM service_enquiries;");
        const totalReviewsRes = await db.query("SELECT COUNT(*)::int as count FROM provider_reviews;");

        res.json({
            success: true,
            stats: {
                total_providers: totalProvidersRes.rows[0].count,
                pending_providers: pendingProvidersRes.rows[0].count,
                approved_providers: approvedProvidersRes.rows[0].count,
                total_enquiries: totalEnquiriesRes.rows[0].count,
                total_reviews: totalReviewsRes.rows[0].count,
            },
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching admin statistics",
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