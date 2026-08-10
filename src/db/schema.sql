-- Drop tables if they already exist to allow clean re-runs
DROP TABLE IF EXISTS provider_profiles CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services Table (Belongs to a Category)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Provider Profiles Table
CREATE TABLE provider_profiles (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    business_name VARCHAR(150),
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    services_offered TEXT[] NOT NULL DEFAULT '{}',
    bio TEXT,
    experience_years INT DEFAULT 1,
    location VARCHAR(100) NOT NULL DEFAULT 'Benin City',
    rating NUMERIC(3, 2) DEFAULT 5.00,
    status VARCHAR(20) NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected', 'suspended'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    location VARCHAR(100) NOT NULL DEFAULT 'Benin City',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Enquiries Table (Customer Requests routed to Providers)
CREATE TABLE IF NOT EXISTS service_enquiries (
    id SERIAL PRIMARY KEY,
    provider_id INT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150),
    location VARCHAR(150) NOT NULL,
    service_description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Provider Reviews Table (Customer Feedback & Ratings)
CREATE TABLE IF NOT EXISTS provider_reviews (
    id SERIAL PRIMARY KEY,
    provider_id INT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enquiry Messages Table (Direct Messaging between Customer & Provider)
CREATE TABLE IF NOT EXISTS enquiry_messages (
    id SERIAL PRIMARY KEY,
    enquiry_id INT NOT NULL REFERENCES service_enquiries(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'provider'
    sender_name VARCHAR(150) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Notifications Table (Real Event-Driven Alerts)
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL, -- 'customer', 'provider'
    user_id VARCHAR(255) NOT NULL,   -- customer_email or provider_id
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance when searching and filtering
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON provider_profiles(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_status ON provider_profiles(status);
CREATE INDEX IF NOT EXISTS idx_providers_location ON provider_profiles(location);
CREATE INDEX IF NOT EXISTS idx_enquiries_provider_id ON service_enquiries(provider_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_customer_id ON service_enquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON service_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON provider_reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_messages_enquiry_id ON enquiry_messages(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON user_notifications(user_type, user_id, is_read);
