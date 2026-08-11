// Load environment variables locally if not in production
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./config/db");
const totp = require("./utils/totp");
const { 
    sendEnquiryNotificationToProvider, 
    sendStatusUpdateNotificationToCustomer,
    sendEnquiryConfirmationToCustomer,
    sendPasswordResetEmail 
} = require("./utils/mailer");

const app = express();
const PORT = process.env.PORT || 5000;

// Validate JWT Secret presence from environment
if (!process.env.JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET environment variable is missing!");
    process.exit(1);
}

// Enable CORS and JSON body parsing middleware
app.use(cors());
app.use(express.json());

// Authentication Middleware: Verify JWT Bearer Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token required. Please log in.",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired session token. Please log in again.",
            });
        }
        req.user = user;
        next();
    });
};

// Authorization Middleware: Role-Based Access Control (RBAC)
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access forbidden. Insufficient user permissions.",
            });
        }
        next();
    };
};

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
    const { search, category, location, min_rating, sort } = req.query;

    try {
        let queryValues = [];
        let conditions = ["p.status = 'approved'"];
        let paramIndex = 1;

        // Filter by category ID or Category slug if provided
        if (category && category !== 'all') {
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
        if (location && location !== 'all') {
            conditions.push(`LOWER(p.location) LIKE $${paramIndex}`);
            queryValues.push(`%${location.toLowerCase()}%`);
            paramIndex++;
        }

        // Filter by minimum rating
        if (min_rating && !isNaN(Number(min_rating))) {
            conditions.push(`p.rating >= $${paramIndex}`);
            queryValues.push(Number(min_rating));
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

        let orderBy = "p.rating DESC, p.created_at DESC";
        if (sort === "experience_desc") {
            orderBy = "p.experience_years DESC, p.rating DESC";
        } else if (sort === "newest") {
            orderBy = "p.created_at DESC";
        } else if (sort === "reviews_desc") {
            orderBy = "review_count DESC, p.rating DESC";
        }

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
            ORDER BY ${orderBy};
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
        const newProvider = result.rows[0];

        // REAL EVENT TRIGGER: Notify Admin of new provider registration
        await createNotification({
            user_type: 'admin',
            user_id: 'admin',
            title: 'New Provider Registration',
            message: `${newProvider.business_name || newProvider.full_name} registered as a service provider (Pending approval).`,
            link: '/admin-dashboard'
        });

        res.status(201).json({
            success: true,
            message: "Provider registration successful! Your profile is pending administrator approval before public listing.",
            provider: newProvider,
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

    // Optional customer_id from JWT token if logged in
    let customerId = null;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.role === "customer") {
                customerId = decoded.id;
            }
        } catch (e) {
            // Ignore invalid token on public enquiry submission
        }
    }

    try {
        // Verify target provider exists and is approved
        const providerCheck = await db.query("SELECT id, full_name, email, phone, business_name FROM provider_profiles WHERE id = $1 AND status = 'approved';", [provider_id]);
        if (providerCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Target service provider not found or not active.",
            });
        }

        const insertQuery = `
            INSERT INTO service_enquiries (
                provider_id, customer_id, customer_name, customer_phone, customer_email, location, service_description, status
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, provider_id, customer_id, customer_name, customer_phone, customer_email, location, service_description, status, created_at;
        `;

        const queryValues = [
            parseInt(provider_id, 10),
            customerId,
            customer_name.trim(),
            customer_phone.trim(),
            customer_email ? customer_email.trim().toLowerCase() : null,
            location ? location.trim() : "Benin City",
            service_description.trim(),
            "pending",
        ];

        const result = await db.query(insertQuery, queryValues);
        const newEnquiry = result.rows[0];
        const targetProvider = providerCheck.rows[0];

        // REAL EVENT TRIGGER: Create in-app notification for the service provider
        await createNotification({
            user_type: 'provider',
            user_id: targetProvider.id,
            title: 'New Service Request!',
            message: `New request from ${newEnquiry.customer_name}: "${newEnquiry.service_description.slice(0, 50)}${newEnquiry.service_description.length > 50 ? '...' : ''}"`,
            link: '/provider-dashboard'
        });

        // REAL EVENT TRIGGER: Create platform-wide in-app notification for Admin
        await createNotification({
            user_type: 'admin',
            user_id: 'admin',
            title: 'New Service Request',
            message: `${newEnquiry.customer_name} submitted a request for ${targetProvider.business_name || targetProvider.full_name}.`,
            link: '/admin-dashboard'
        });

        // Asynchronously dispatch email notification to provider
        sendEnquiryNotificationToProvider({
            providerEmail: targetProvider.email,
            providerName: targetProvider.full_name,
            businessName: targetProvider.business_name,
            customerName: newEnquiry.customer_name,
            customerPhone: newEnquiry.customer_phone,
            customerEmail: newEnquiry.customer_email,
            location: newEnquiry.location,
            serviceDescription: newEnquiry.service_description,
        }).catch((err) => console.error("Async provider email dispatch error:", err));

        // Asynchronously dispatch confirmation email and in-app notification to customer
        if (newEnquiry.customer_email) {
            await createNotification({
                user_type: 'customer',
                user_id: newEnquiry.customer_email,
                title: 'Service Request Sent',
                message: `Your request to ${targetProvider.business_name || targetProvider.full_name} for "${newEnquiry.service_description.slice(0, 40)}${newEnquiry.service_description.length > 40 ? '...' : ''}" has been sent successfully.`,
                link: '/customer-dashboard'
            });

            sendEnquiryConfirmationToCustomer({
                customerEmail: newEnquiry.customer_email,
                customerName: newEnquiry.customer_name,
                businessName: targetProvider.business_name,
                providerName: targetProvider.full_name,
                providerPhone: targetProvider.phone,
                location: newEnquiry.location,
                serviceDescription: newEnquiry.service_description,
            }).catch((err) => console.error("Async customer confirmation email dispatch error:", err));
        }

        res.status(201).json({
            success: true,
            message: "Your service request has been sent to the provider successfully!",
            data: newEnquiry,
            provider: targetProvider,
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

// PATCH /api/enquiries/:id/status - Update enquiry status (Protected for Providers)
app.patch("/api/enquiries/:id/status", authenticateToken, requireRole("provider"), async (req, res) => {
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
        const updateQuery = `
            UPDATE service_enquiries SET status = $1 WHERE id = $2 
            RETURNING *;
        `;
        const result = await db.query(updateQuery, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found",
            });
        }

        const updatedEnquiry = result.rows[0];

        // Fetch provider business info for customer status notification
        const providerQuery = await db.query(
            "SELECT business_name, phone as provider_phone FROM provider_profiles WHERE id = $1;",
            [updatedEnquiry.provider_id]
        );
        const providerInfo = providerQuery.rows[0] || {};

        // REAL EVENT TRIGGER: Create in-app notification for customer on status change
        if (updatedEnquiry.customer_email) {
            const statusTitles = {
                contacted: 'Service Request Approved',
                completed: 'Service Request Completed',
                cancelled: 'Service Request Cancelled',
                pending: 'Service Request Pending'
            };
            const title = statusTitles[status] || 'Service Request Status Updated';
            const providerDisplayName = providerInfo.business_name || 'Service Provider';

            await createNotification({
                user_type: 'customer',
                user_id: updatedEnquiry.customer_email,
                title: title,
                message: `${providerDisplayName} has updated your service request status to "${status}".`,
                link: '/customer-dashboard'
            });

            // Asynchronously dispatch status update email to customer
            sendStatusUpdateNotificationToCustomer({
                customerEmail: updatedEnquiry.customer_email,
                customerName: updatedEnquiry.customer_name,
                businessName: providerInfo.business_name,
                providerPhone: providerInfo.provider_phone,
                status: updatedEnquiry.status,
                serviceDescription: updatedEnquiry.service_description,
            }).catch((err) => console.error("Async customer status email dispatch error:", err));
        }

        // REAL EVENT TRIGGER: Create platform-wide notification for Admin on request status update
        await createNotification({
            user_type: 'admin',
            user_id: 'admin',
            title: `Request #${id} Status Updated`,
            message: `Service request #${id} status updated to "${status}".`,
            link: '/admin-dashboard'
        });

        res.json({
            success: true,
            message: `Enquiry status updated to ${status}`,
            data: updatedEnquiry,
        });
    } catch (error) {
        console.error("Error updating enquiry status:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error updating enquiry status",
        });
    }
});

// Helper function to create in-app notifications
async function createNotification({ user_type, user_id, title, message, link }) {
    if (!user_type || !user_id) {
        console.warn("[NOTIFICATION DEBUG] Skipped: missing user_type or user_id", { user_type, user_id });
        return;
    }
    try {
        console.log(`[NOTIFICATION DEBUG] Inserting notification for ${user_type}:${user_id} - Title: "${title}"`);
        const res = await db.query(
            `INSERT INTO user_notifications (user_type, user_id, title, message, link)
             VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
            [user_type, String(user_id).trim(), title, message, link || null]
        );
        console.log(`[NOTIFICATION DEBUG] Notification inserted successfully! ID: ${res.rows[0].id}`);
    } catch (err) {
        console.error("[NOTIFICATION DEBUG] Error creating in-app notification:", err.message);
    }
}

// GET /api/notifications - Fetch user notifications and unread count
app.get("/api/notifications", async (req, res) => {
    const { user_type, user_id } = req.query;
    if (!user_type || !user_id) {
        return res.status(400).json({ success: false, message: "user_type and user_id are required." });
    }

    try {
        const notificationsRes = await db.query(
            `SELECT * FROM user_notifications 
             WHERE user_type = $1 AND LOWER(user_id) = LOWER($2) 
             ORDER BY created_at DESC LIMIT 50;`,
            [user_type, String(user_id)]
        );

        const unreadRes = await db.query(
            `SELECT COUNT(*) FROM user_notifications 
             WHERE user_type = $1 AND LOWER(user_id) = LOWER($2) AND is_read = false;`,
            [user_type, String(user_id)]
        );

        console.log(`[NOTIFICATION DEBUG] GET /api/notifications - user_type=${user_type}, user_id=${user_id}, returned ${notificationsRes.rows.length} items (unread: ${unreadRes.rows[0].count})`);

        res.json({
            success: true,
            unread_count: parseInt(unreadRes.rows[0].count, 10),
            data: notificationsRes.rows,
        });
    } catch (error) {
        console.error("[NOTIFICATION DEBUG] Error fetching notifications:", error.message);
        res.status(500).json({ success: false, message: "Server error fetching notifications" });
    }
});

// PUT /api/notifications/:id/read - Mark single notification as read
app.put("/api/notifications/:id/read", async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("UPDATE user_notifications SET is_read = true WHERE id = $1;", [id]);
        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating notification" });
    }
});

// PUT /api/notifications/read-all - Mark all notifications as read
app.put("/api/notifications/read-all", async (req, res) => {
    const { user_type, user_id } = req.body;
    if (!user_type || !user_id) {
        return res.status(400).json({ success: false, message: "user_type and user_id are required." });
    }

    try {
        await db.query(
            "UPDATE user_notifications SET is_read = true WHERE user_type = $1 AND LOWER(user_id) = LOWER($2);",
            [user_type, String(user_id)]
        );
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating notifications" });
    }
});

// GET /api/providers/:id/analytics - Fetch real database analytics for a provider
app.get("/api/providers/:id/analytics", async (req, res) => {
    const { id } = req.params;
    try {
        const enquiryStats = await db.query(
            `SELECT 
                COUNT(*) as total_enquiries,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                COUNT(CASE WHEN status = 'contacted' THEN 1 END) as accepted_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
             FROM service_enquiries WHERE provider_id = $1;`,
            [id]
        );

        let avgRating = "5.0";
        let totalReviews = 0;

        try {
            const reviewStats = await db.query(
                `SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM provider_reviews WHERE provider_id = $1;`,
                [id]
            );
            const revRow = reviewStats.rows[0] || {};
            if (revRow.avg_rating) {
                avgRating = parseFloat(revRow.avg_rating).toFixed(1);
            } else {
                const providerProfile = await db.query(`SELECT rating FROM provider_profiles WHERE id = $1;`, [id]);
                if (providerProfile.rows[0] && providerProfile.rows[0].rating) {
                    avgRating = parseFloat(providerProfile.rows[0].rating).toFixed(1);
                }
            }
            totalReviews = parseInt(revRow.total_reviews || '0', 10);
        } catch (revErr) {
            console.error("Provider reviews query notice:", revErr.message);
            const providerProfile = await db.query(`SELECT rating FROM provider_profiles WHERE id = $1;`, [id]);
            if (providerProfile.rows[0] && providerProfile.rows[0].rating) {
                avgRating = parseFloat(providerProfile.rows[0].rating).toFixed(1);
            }
        }

        const row = enquiryStats.rows[0] || {};
        const total = parseInt(row.total_enquiries || '0', 10);
        const completed = parseInt(row.completed_count || '0', 10);
        const accepted = parseInt(row.accepted_count || '0', 10);
        const pending = parseInt(row.pending_count || '0', 10);
        const cancelled = parseInt(row.cancelled_count || '0', 10);

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const responseRate = total > 0 ? Math.round(((completed + accepted) / total) * 100) : 0;

        res.json({
            success: true,
            analytics: {
                totalEnquiries: total,
                completedCount: completed,
                acceptedCount: accepted,
                pendingCount: pending,
                cancelledCount: cancelled,
                completionRate,
                responseRate,
                averageRating: parseFloat(avgRating),
                totalReviews,
            }
        });
    } catch (error) {
        console.error("Error fetching provider analytics:", error.message);
        res.status(500).json({ success: false, message: "Server error fetching analytics" });
    }
});

// PATCH /api/providers/:id/avatar - Update provider profile picture
app.patch("/api/providers/:id/avatar", async (req, res) => {
    const { id } = req.params;
    const { avatar_url } = req.body;

    if (!avatar_url) {
        return res.status(400).json({ success: false, message: "avatar_url is required." });
    }

    try {
        const result = await db.query(
            "UPDATE provider_profiles SET avatar_url = $1 WHERE id = $2 RETURNING id, full_name, email, business_name, avatar_url;",
            [avatar_url, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Provider not found." });
        }

        res.json({
            success: true,
            message: "Profile picture updated successfully!",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating provider avatar:", error.message);
        res.status(500).json({ success: false, message: "Server error updating profile picture" });
    }
});

// GET /api/enquiries/:id/messages - Fetch all chat messages for a specific enquiry
app.get("/api/enquiries/:id/messages", async (req, res) => {
    const { id } = req.params;
    try {
        // Verify enquiry exists
        const enquiryCheck = await db.query("SELECT id FROM service_enquiries WHERE id = $1;", [id]);
        if (enquiryCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service enquiry not found.",
            });
        }

        const queryText = `
            SELECT * FROM enquiry_messages 
            WHERE enquiry_id = $1 
            ORDER BY created_at ASC;
        `;
        const result = await db.query(queryText, [id]);
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching enquiry messages:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to load messages.",
        });
    }
});

// POST /api/enquiries/:id/messages - Send a message in an enquiry chat thread
app.post("/api/enquiries/:id/messages", async (req, res) => {
    const { id } = req.params;
    const { sender_type, sender_name, message_text } = req.body;

    if (!sender_type || !sender_name || !message_text || !message_text.trim()) {
        return res.status(400).json({
            success: false,
            message: "Sender type, sender name, and message content are required.",
        });
    }

    if (!['customer', 'provider'].includes(sender_type)) {
        return res.status(400).json({
            success: false,
            message: "Invalid sender_type. Must be 'customer' or 'provider'.",
        });
    }

    try {
        // Verify enquiry exists
        const enquiryCheck = await db.query("SELECT id, provider_id, customer_email FROM service_enquiries WHERE id = $1;", [id]);
        if (enquiryCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service enquiry not found.",
            });
        }

        const insertQuery = `
            INSERT INTO enquiry_messages (enquiry_id, sender_type, sender_name, message_text) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *;
        `;
        const result = await db.query(insertQuery, [id, sender_type, sender_name.trim(), message_text.trim()]);
        const newMessageRow = result.rows[0];

        // REAL EVENT TRIGGER: Notify recipient of direct chat message
        const enquiryRow = enquiryCheck.rows[0];
        if (sender_type === 'customer') {
            await createNotification({
                user_type: 'provider',
                user_id: enquiryRow.provider_id,
                title: `New Message from ${sender_name}`,
                message: `"${message_text.trim().slice(0, 50)}${message_text.trim().length > 50 ? '...' : ''}"`,
                link: `/provider-dashboard`
            });
        } else {
            if (enquiryRow.customer_email) {
                await createNotification({
                    user_type: 'customer',
                    user_id: enquiryRow.customer_email,
                    title: `New Message from ${sender_name}`,
                    message: `"${message_text.trim().slice(0, 50)}${message_text.trim().length > 50 ? '...' : ''}"`,
                    link: `/customer-dashboard`
                });
            }
        }

        // REAL EVENT TRIGGER: Notify Admin of market communication activity
        await createNotification({
            user_type: 'admin',
            user_id: 'admin',
            title: `New Message in Request #${id}`,
            message: `${sender_name}: "${message_text.trim().slice(0, 40)}${message_text.trim().length > 40 ? '...' : ''}"`,
            link: '/admin-dashboard'
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully!",
            data: newMessageRow,
        });
    } catch (error) {
        console.error("Error posting enquiry message:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error sending message",
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

// POST /api/customers/register - Customer Account Registration
app.post("/api/customers/register", async (req, res) => {
    const { full_name, email, password, phone, location } = req.body;

    if (!full_name || !email || !password || !phone) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields (Full Name, Email, Password, Phone).",
        });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
        // Check if email already registered in customers or providers
        const [existingCustomer, existingProvider] = await Promise.all([
            db.query("SELECT id FROM customers WHERE LOWER(email) = $1;", [cleanEmail]),
            db.query("SELECT id FROM provider_profiles WHERE LOWER(email) = $1;", [cleanEmail]),
        ]);

        if (existingCustomer.rows.length > 0 || existingProvider.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email address already exists.",
            });
        }

        const password_hash = await bcrypt.hash(password, 10);
        const insertQuery = `
            INSERT INTO customers (full_name, email, password_hash, phone, location) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, full_name, email, phone, location, created_at;
        `;
        const result = await db.query(insertQuery, [
            full_name.trim(),
            cleanEmail,
            password_hash,
            phone.trim(),
            location ? location.trim() : "Benin City",
        ]);

        const customer = result.rows[0];

        // REAL EVENT TRIGGER: Notify Admin of new customer registration
        await createNotification({
            user_type: 'admin',
            user_id: 'admin',
            title: 'New Customer Registered',
            message: `${customer.full_name} registered a new customer account (${customer.email}).`,
            link: '/admin-dashboard'
        });

        // Sign JWT Token
        const token = jwt.sign(
            { id: customer.id, email: customer.email, role: "customer", name: customer.full_name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            success: true,
            message: "Customer account created successfully!",
            token,
            role: "customer",
            user: customer,
        });
    } catch (error) {
        console.error("Error registering customer:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error during customer registration",
            error: error.message,
        });
    }
});

// GET /api/customers/enquiries - Fetch all enquiries submitted by the logged-in customer
app.get("/api/customers/enquiries", authenticateToken, requireRole("customer"), async (req, res) => {
    try {
        const queryText = `
            SELECT 
                e.*, 
                p.business_name, 
                p.full_name as provider_name, 
                p.phone as provider_phone, 
                p.avatar_url as provider_avatar,
                p.location as provider_location,
                c.name as category_name
            FROM service_enquiries e
            JOIN provider_profiles p ON e.provider_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE e.customer_id = $1 OR LOWER(e.customer_email) = $2
            ORDER BY e.created_at DESC;
        `;
        const result = await db.query(queryText, [req.user.id, req.user.email.toLowerCase()]);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error fetching customer enquiries:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error fetching customer service requests",
        });
    }
});

// GET /api/auth/me - Validate token & restore active user session
app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.json({
                success: true,
                role: "admin",
                user: {
                    id: req.user.id || 1,
                    name: req.user.name || "System Administrator",
                    email: req.user.email,
                    role: "Super Admin",
                },
            });
        } else if (req.user.role === "provider") {
            const result = await db.query(
                `SELECT p.*, c.name as category_name 
                 FROM provider_profiles p 
                 JOIN categories c ON p.category_id = c.id 
                 WHERE p.id = $1;`,
                [req.user.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Provider profile not found." });
            }
            const { password_hash, ...safeProvider } = result.rows[0];
            return res.json({
                success: true,
                role: "provider",
                user: safeProvider,
            });
        } else if (req.user.role === "customer") {
            const result = await db.query(
                `SELECT id, full_name, email, phone, location, avatar_url, created_at 
                 FROM customers 
                 WHERE id = $1;`,
                [req.user.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "Customer profile not found." });
            }
            return res.json({
                success: true,
                role: "customer",
                user: result.rows[0],
            });
        }
        return res.status(400).json({ success: false, message: "Unknown user role." });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/customers/profile - Update Customer Profile & Avatar URL
app.put("/api/customers/profile", authenticateToken, requireRole("customer"), async (req, res) => {
    const { full_name, phone, location, avatar_url } = req.body;
    try {
        const updateQuery = `
            UPDATE customers
            SET full_name = COALESCE($1, full_name),
                phone = COALESCE($2, phone),
                location = COALESCE($3, location),
                avatar_url = $4
            WHERE id = $5
            RETURNING id, full_name, email, phone, location, avatar_url, created_at;
        `;
        const result = await db.query(updateQuery, [
            full_name ? full_name.trim() : null,
            phone ? phone.trim() : null,
            location ? location.trim() : null,
            avatar_url !== undefined ? (avatar_url ? avatar_url.trim() : null) : null,
            req.user.id,
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Customer profile not found." });
        }

        res.json({
            success: true,
            message: "Profile updated successfully!",
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating customer profile:", error.message);
        res.status(500).json({ success: false, message: "Server error updating profile" });
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

    // 1. Check Administrator Credentials (DB first, fallback env)
    try {
        const adminResult = await db.query(
            `SELECT * FROM admins WHERE LOWER(email) = $1;`,
            [cleanEmail]
        );

        if (adminResult.rows.length > 0) {
            const admin = adminResult.rows[0];
            const isMatch = await bcrypt.compare(password, admin.password_hash);
            if (isMatch) {
                if (admin.two_factor_enabled) {
                    const tempToken = jwt.sign(
                        { tempUserId: admin.id, role: "admin", email: admin.email, is2FA: true },
                        process.env.JWT_SECRET,
                        { expiresIn: "5m" }
                    );
                    return res.json({
                        success: true,
                        requires2FA: true,
                        tempToken,
                        message: "2FA verification required. Enter your 6-digit authenticator code.",
                    });
                }

                const token = jwt.sign(
                    { id: admin.id, email: admin.email, role: "admin", name: admin.full_name || "System Administrator" },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );

                const { password_hash, two_factor_secret, ...safeAdmin } = admin;
                return res.json({
                    success: true,
                    token,
                    role: "admin",
                    message: "Admin authentication successful!",
                    user: safeAdmin,
                });
            }
        }
    } catch (adminErr) {
        console.error("Error during admin DB auth check:", adminErr.message);
    }

    // Fallback Admin check from env if table empty
    const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@nationhub.com").toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (cleanEmail === envAdminEmail && password === envAdminPassword) {
        const token = jwt.sign(
            { id: 1, email: envAdminEmail, role: "admin", name: "System Administrator" },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.json({
            success: true,
            token,
            role: "admin",
            message: "Admin authentication successful!",
            user: {
                id: 1,
                name: "System Administrator",
                email: envAdminEmail,
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
                if (provider.two_factor_enabled) {
                    const tempToken = jwt.sign(
                        { tempUserId: provider.id, role: "provider", email: provider.email, is2FA: true },
                        process.env.JWT_SECRET,
                        { expiresIn: "5m" }
                    );
                    return res.json({
                        success: true,
                        requires2FA: true,
                        tempToken,
                        message: "2FA verification required. Enter your 6-digit authenticator code.",
                    });
                }

                const token = jwt.sign(
                    { id: provider.id, email: provider.email, role: "provider", name: provider.full_name },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );

                const { password_hash, two_factor_secret, ...safeProvider } = provider;
                return res.json({
                    success: true,
                    token,
                    role: "provider",
                    message: "Provider login successful!",
                    user: safeProvider,
                });
            }
        }
    } catch (dbErr) {
        console.error("Error during provider auth check:", dbErr.message);
    }

    // 3. Check Customer Credentials in Database
    try {
        const customerResult = await db.query(
            `SELECT * FROM customers WHERE LOWER(email) = $1;`,
            [cleanEmail]
        );

        if (customerResult.rows.length > 0) {
            const customer = customerResult.rows[0];
            const isMatch = await bcrypt.compare(password, customer.password_hash);

            if (isMatch) {
                if (customer.two_factor_enabled) {
                    const tempToken = jwt.sign(
                        { tempUserId: customer.id, role: "customer", email: customer.email, is2FA: true },
                        process.env.JWT_SECRET,
                        { expiresIn: "5m" }
                    );
                    return res.json({
                        success: true,
                        requires2FA: true,
                        tempToken,
                        message: "2FA verification required. Enter your 6-digit authenticator code.",
                    });
                }

                const token = jwt.sign(
                    { id: customer.id, email: customer.email, role: "customer", name: customer.full_name },
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );

                const { password_hash, two_factor_secret, ...safeCustomer } = customer;
                return res.json({
                    success: true,
                    token,
                    role: "customer",
                    message: "Customer login successful!",
                    user: safeCustomer,
                });
            }
        }
    } catch (custErr) {
        console.error("Error during customer auth check:", custErr.message);
    }

    return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
    });
});

// POST /api/auth/login-2fa - Validate 6-digit 2FA code during login
app.post("/api/auth/login-2fa", async (req, res) => {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
        return res.status(400).json({
            success: false,
            message: "Temporary token and 6-digit 2FA code are required.",
        });
    }

    try {
        const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded || !decoded.is2FA || !decoded.tempUserId || !decoded.role) {
            return res.status(401).json({ success: false, message: "Invalid or expired 2FA session token." });
        }

        const { tempUserId, role, email } = decoded;
        let userRecord = null;
        let tableName = role === 'admin' ? 'admins' : role === 'provider' ? 'provider_profiles' : 'customers';

        if (role === 'admin') {
            const resAdmin = await db.query(`SELECT * FROM admins WHERE id = $1;`, [tempUserId]);
            userRecord = resAdmin.rows[0];
        } else if (role === 'provider') {
            const resProv = await db.query(
                `SELECT p.*, c.name as category_name FROM provider_profiles p JOIN categories c ON p.category_id = c.id WHERE p.id = $1;`,
                [tempUserId]
            );
            userRecord = resProv.rows[0];
        } else if (role === 'customer') {
            const resCust = await db.query(`SELECT * FROM customers WHERE id = $1;`, [tempUserId]);
            userRecord = resCust.rows[0];
        }

        if (!userRecord || !userRecord.two_factor_secret) {
            return res.status(400).json({ success: false, message: "2FA is not enabled for this account." });
        }

        const isValidCode = totp.verifyTOTP(userRecord.two_factor_secret, code);
        if (!isValidCode) {
            return res.status(401).json({ success: false, message: "Invalid 2FA code. Please try again." });
        }

        // Issue full session token
        const fullToken = jwt.sign(
            { id: userRecord.id, email: userRecord.email, role, name: userRecord.full_name || userRecord.business_name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        const { password_hash, two_factor_secret, ...safeUser } = userRecord;

        res.json({
            success: true,
            token: fullToken,
            role,
            message: "2FA authentication successful!",
            user: safeUser,
        });
    } catch (err) {
        console.error("Error verifying 2FA login token:", err.message);
        res.status(401).json({ success: false, message: "Expired or invalid 2FA verification session." });
    }
});

// POST /api/auth/forgot-password - Submit email for password reset token
app.post("/api/auth/forgot-password", async (req, res) => {
    const { email } = req.body;

    if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: "Email address is required." });
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
        // Search in admins, provider_profiles, customers
        const [adminRes, providerRes, customerRes] = await Promise.all([
            db.query(`SELECT id, full_name, email FROM admins WHERE LOWER(email) = $1;`, [cleanEmail]),
            db.query(`SELECT id, full_name, email FROM provider_profiles WHERE LOWER(email) = $1;`, [cleanEmail]),
            db.query(`SELECT id, full_name, email FROM customers WHERE LOWER(email) = $1;`, [cleanEmail]),
        ]);

        let targetTable = null;
        let user = null;

        if (adminRes.rows.length > 0) {
            targetTable = 'admins';
            user = adminRes.rows[0];
        } else if (providerRes.rows.length > 0) {
            targetTable = 'provider_profiles';
            user = providerRes.rows[0];
        } else if (customerRes.rows.length > 0) {
            targetTable = 'customers';
            user = customerRes.rows[0];
        }

        if (user && targetTable) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            await db.query(
                `UPDATE ${targetTable} SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3;`,
                [resetToken, expiresAt, user.id]
            );

            const appUrl = process.env.APP_URL || 'http://localhost:5173';
            const resetUrl = `${appUrl}?reset_token=${resetToken}`;

            await sendPasswordResetEmail({
                toEmail: cleanEmail,
                userName: user.full_name || 'User',
                resetUrl,
                resetToken,
            });

            return res.json({
                success: true,
                message: "Password reset link requested. Please check your registered email.",
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Invalid email address.",
            });
        }
    } catch (err) {
        console.error("Error during forgot-password handling:", err.message);
        res.status(500).json({ success: false, message: "Server error processing password reset request." });
    }
});

// POST /api/auth/reset-password - Reset password using valid token
app.post("/api/auth/reset-password", async (req, res) => {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
        return res.status(400).json({ success: false, message: "Reset token and new password are required." });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
    }

    try {
        const cleanToken = token.trim();

        // Search user by reset token across tables
        const [adminRes, providerRes, customerRes] = await Promise.all([
            db.query(`SELECT id FROM admins WHERE reset_token = $1 AND reset_token_expires_at > NOW();`, [cleanToken]),
            db.query(`SELECT id FROM provider_profiles WHERE reset_token = $1 AND reset_token_expires_at > NOW();`, [cleanToken]),
            db.query(`SELECT id FROM customers WHERE reset_token = $1 AND reset_token_expires_at > NOW();`, [cleanToken]),
        ]);

        let targetTable = null;
        let userId = null;

        if (adminRes.rows.length > 0) {
            targetTable = 'admins';
            userId = adminRes.rows[0].id;
        } else if (providerRes.rows.length > 0) {
            targetTable = 'provider_profiles';
            userId = providerRes.rows[0].id;
        } else if (customerRes.rows.length > 0) {
            targetTable = 'customers';
            userId = customerRes.rows[0].id;
        }

        if (!userId || !targetTable) {
            return res.status(400).json({ success: false, message: "Invalid or expired password reset token." });
        }

        const password_hash = await bcrypt.hash(new_password, 10);
        await db.query(
            `UPDATE ${targetTable} SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2;`,
            [password_hash, userId]
        );

        res.json({
            success: true,
            message: "Password reset successful! You can now log in with your new password.",
        });
    } catch (err) {
        console.error("Error during reset-password execution:", err.message);
        res.status(500).json({ success: false, message: "Server error resetting password." });
    }
});

// PUT /api/auth/change-password - Change Password for Logged-In User
app.put("/api/auth/change-password", authenticateToken, async (req, res) => {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ success: false, message: "Current password and new password are required." });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters long." });
    }

    const { id, role } = req.user;

    try {
        let userRecord = null;
        let targetTable = role === 'admin' ? 'admins' : role === 'provider' ? 'provider_profiles' : 'customers';

        const queryResult = await db.query(`SELECT id, password_hash FROM ${targetTable} WHERE id = $1;`, [id]);
        if (queryResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        userRecord = queryResult.rows[0];

        const isMatch = await bcrypt.compare(current_password, userRecord.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }

        const newHash = await bcrypt.hash(new_password, 10);
        await db.query(`UPDATE ${targetTable} SET password_hash = $1 WHERE id = $2;`, [newHash, id]);

        res.json({
            success: true,
            message: "Password updated successfully!",
        });
    } catch (err) {
        console.error("Error changing password:", err.message);
        res.status(500).json({ success: false, message: "Server error updating password." });
    }
});

// PUT /api/auth/update-email - Change Email Address for Logged-In User
app.put("/api/auth/update-email", authenticateToken, async (req, res) => {
    const { new_email, password } = req.body;

    if (!new_email || !new_email.trim()) {
        return res.status(400).json({ success: false, message: "New email address is required." });
    }

    if (!password) {
        return res.status(400).json({ success: false, message: "Password is required to confirm email change." });
    }

    const cleanEmail = new_email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }

    const { id, role } = req.user;

    try {
        let targetTable = role === 'admin' ? 'admins' : role === 'provider' ? 'provider_profiles' : 'customers';

        // Check if email is already in use by another user across tables
        const [adminCheck, providerCheck, customerCheck] = await Promise.all([
            db.query(`SELECT id FROM admins WHERE LOWER(email) = $1 AND (id != $2 OR 'admins' != $3);`, [cleanEmail, id, targetTable]),
            db.query(`SELECT id FROM provider_profiles WHERE LOWER(email) = $1 AND (id != $2 OR 'provider_profiles' != $3);`, [cleanEmail, id, targetTable]),
            db.query(`SELECT id FROM customers WHERE LOWER(email) = $1 AND (id != $2 OR 'customers' != $3);`, [cleanEmail, id, targetTable]),
        ]);

        if (adminCheck.rows.length > 0 || providerCheck.rows.length > 0 || customerCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: "This email address is already registered to another account." });
        }

        // Verify current password
        const userRes = await db.query(`SELECT id, password_hash FROM ${targetTable} WHERE id = $1;`, [id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User account not found." });
        }

        const isMatch = await bcrypt.compare(password, userRes.rows[0].password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password confirmation." });
        }

        // Update email in DB
        await db.query(`UPDATE ${targetTable} SET email = $1 WHERE id = $2;`, [cleanEmail, id]);

        // Generate updated JWT token
        const token = jwt.sign(
            { id, email: cleanEmail, role, name: req.user.name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            success: true,
            email: cleanEmail,
            token,
            message: "Email address updated successfully!",
        });
    } catch (err) {
        console.error("Error during update-email execution:", err.message);
        res.status(500).json({ success: false, message: "Server error updating email address." });
    }
});

// POST /api/auth/2fa/setup - Initialize 2FA Secret & OTP Auth URL
app.post("/api/auth/2fa/setup", authenticateToken, async (req, res) => {
    try {
        const secret = totp.generateSecret();
        const otpauth_url = totp.getOtpAuthUrl(secret, req.user.email);

        res.json({
            success: true,
            secret,
            otpauth_url,
            qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth_url)}`,
        });
    } catch (err) {
        console.error("Error generating 2FA setup:", err.message);
        res.status(500).json({ success: false, message: "Server error initializing 2FA setup." });
    }
});

// POST /api/auth/2fa/verify-enable - Verify Code & Enable 2FA on Account
app.post("/api/auth/2fa/verify-enable", authenticateToken, async (req, res) => {
    const { secret, code } = req.body;

    if (!secret || !code) {
        return res.status(400).json({ success: false, message: "Secret key and 6-digit TOTP code are required." });
    }

    const isValid = totp.verifyTOTP(secret, code);
    if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid 6-digit code. Please verify your authenticator app and try again." });
    }

    const { id, role } = req.user;
    const targetTable = role === 'admin' ? 'admins' : role === 'provider' ? 'provider_profiles' : 'customers';

    try {
        await db.query(
            `UPDATE ${targetTable} SET two_factor_secret = $1, two_factor_enabled = TRUE WHERE id = $2;`,
            [secret, id]
        );

        res.json({
            success: true,
            message: "Two-Factor Authentication enabled successfully!",
        });
    } catch (err) {
        console.error("Error enabling 2FA:", err.message);
        res.status(500).json({ success: false, message: "Server error activating 2FA." });
    }
});

// POST /api/auth/2fa/disable - Disable 2FA on Account
app.post("/api/auth/2fa/disable", authenticateToken, async (req, res) => {
    const { password, code } = req.body;

    const { id, role } = req.user;
    const targetTable = role === 'admin' ? 'admins' : role === 'provider' ? 'provider_profiles' : 'customers';

    try {
        const userRes = await db.query(`SELECT password_hash, two_factor_secret FROM ${targetTable} WHERE id = $1;`, [id]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const user = userRes.rows[0];

        if (password) {
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Incorrect password." });
            }
        } else if (code) {
            const isValid = totp.verifyTOTP(user.two_factor_secret, code);
            if (!isValid) {
                return res.status(400).json({ success: false, message: "Invalid 2FA code." });
            }
        } else {
            return res.status(400).json({ success: false, message: "Password or 2FA code is required to disable 2FA." });
        }

        await db.query(
            `UPDATE ${targetTable} SET two_factor_secret = NULL, two_factor_enabled = FALSE WHERE id = $1;`,
            [id]
        );

        res.json({
            success: true,
            message: "Two-Factor Authentication disabled successfully.",
        });
    } catch (err) {
        console.error("Error disabling 2FA:", err.message);
        res.status(500).json({ success: false, message: "Server error disabling 2FA." });
    }
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
        const token = jwt.sign(
            { id: 1, email: adminEmail, role: "admin", name: "System Administrator" },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.json({
            success: true,
            token,
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

// PUT /api/admin/avatar - Update Admin Profile Picture
app.put("/api/admin/avatar", authenticateToken, requireRole("admin"), async (req, res) => {
    const { avatar_url } = req.body;
    if (!avatar_url) {
        return res.status(400).json({ success: false, message: "Avatar URL is required." });
    }
    const { id } = req.user;
    try {
        await db.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
        const result = await db.query(
            `UPDATE admins SET avatar_url = $1 WHERE id = $2 RETURNING id, email, full_name, avatar_url;`,
            [avatar_url, id]
        );
        res.json({
            success: true,
            message: "Admin profile picture updated successfully!",
            data: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating admin avatar:", error.message);
        res.status(500).json({ success: false, message: "Server error updating profile picture" });
    }
});

// GET /api/admin/stats - Admin Platform Analytics
app.get("/api/admin/stats", authenticateToken, requireRole("admin"), async (req, res) => {
    try {
        const stats = {
            total_providers: 0,
            pending_providers: 0,
            approved_providers: 0,
            total_enquiries: 0,
            pending_enquiries: 0,
            accepted_enquiries: 0,
            completed_enquiries: 0,
            cancelled_enquiries: 0,
            total_reviews: 0,
        };

        const providerCounts = await db.query(`
            SELECT status, COUNT(*) as count FROM provider_profiles GROUP BY status;
        `);
        let totalProviders = 0;
        providerCounts.rows.forEach(row => {
            const count = parseInt(row.count, 10);
            totalProviders += count;
            if (row.status === 'pending') stats.pending_providers = count;
            if (row.status === 'approved') stats.approved_providers = count;
        });
        stats.total_providers = totalProviders;

        const enquiryCounts = await db.query(`
            SELECT status, COUNT(*) as count FROM service_enquiries GROUP BY status;
        `);
        let totalEnquiries = 0;
        enquiryCounts.rows.forEach(row => {
            const count = parseInt(row.count, 10);
            totalEnquiries += count;
            if (row.status === 'pending') stats.pending_enquiries = count;
            if (row.status === 'contacted') stats.accepted_enquiries = count;
            if (row.status === 'completed') stats.completed_enquiries = count;
            if (row.status === 'cancelled') stats.cancelled_enquiries = count;
        });
        stats.total_enquiries = totalEnquiries;

        const customerCount = await db.query(`SELECT COUNT(*) as count FROM customers;`);
        stats.total_customers = parseInt(customerCount.rows[0].count, 10);

        const reviewCount = await db.query(`SELECT COUNT(*) as count FROM provider_reviews;`);
        stats.total_reviews = parseInt(reviewCount.rows[0].count, 10);

        const avgRatingQuery = await db.query(`SELECT COALESCE(AVG(rating), 0) as avg FROM provider_reviews;`);
        stats.overall_rating = parseFloat(avgRatingQuery.rows[0].avg).toFixed(1);

        const handled = stats.accepted_enquiries + stats.completed_enquiries + stats.cancelled_enquiries;
        stats.response_rate = stats.total_enquiries > 0 ? Math.round((handled / stats.total_enquiries) * 100) : 0;
        stats.completion_rate = stats.total_enquiries > 0 ? Math.round((stats.completed_enquiries / stats.total_enquiries) * 100) : 0;

        res.json({ success: true, stats });
    } catch (error) {
        console.error("Error fetching admin stats:", error.message);
        res.status(500).json({ success: false, message: "Server error fetching platform analytics" });
    }
});

// GET /api/admin/providers - Protected Platform Moderation Queue
app.get("/api/admin/providers", authenticateToken, requireRole("admin"), async (req, res) => {
    const { status } = req.query;

    let queryText = `
        SELECT 
            p.*, 
            COUNT(DISTINCT r.id)::int as review_count,
            COALESCE(AVG(DISTINCT r.rating), 0)::numeric(2,1) as average_rating,
            COUNT(DISTINCT e.id)::int as total_requests,
            COUNT(DISTINCT CASE WHEN e.status = 'pending' THEN e.id END)::int as pending_requests,
            COUNT(DISTINCT CASE WHEN e.status = 'contacted' THEN e.id END)::int as accepted_requests,
            COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END)::int as completed_requests,
            COUNT(DISTINCT CASE WHEN e.status = 'cancelled' THEN e.id END)::int as cancelled_requests
        FROM provider_profiles p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN provider_reviews r ON p.id = r.provider_id
        LEFT JOIN service_enquiries e ON p.id = e.provider_id
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

// PATCH /api/admin/providers/:id/status - Protected Admin Provider Moderation
app.patch("/api/admin/providers/:id/status", authenticateToken, requireRole("admin"), async (req, res) => {
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

// GET /api/admin/stats - Protected Admin Dashboard Metrics
app.get("/api/admin/stats", authenticateToken, requireRole("admin"), async (req, res) => {
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

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/dist")));
    
    // Catch-all route to serve React's index.html for any unmatched routes
    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    });
}

// Start the server and test database connectivity
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    try {
        const res = await db.query("SELECT NOW();");
        console.log("Database connection successful at:", res.rows[0].now);
    } catch (err) {
        console.error("CRITICAL DB STARTUP ERROR:", err);
    }
});