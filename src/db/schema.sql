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

-- Service Enquiries Table (Customer Requests routed to Providers)
CREATE TABLE service_enquiries (
    id SERIAL PRIMARY KEY,
    provider_id INT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150),
    location VARCHAR(150) NOT NULL,
    service_description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance when searching and filtering
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_providers_category_id ON provider_profiles(category_id);
CREATE INDEX idx_providers_status ON provider_profiles(status);
CREATE INDEX idx_providers_location ON provider_profiles(location);
CREATE INDEX idx_enquiries_provider_id ON service_enquiries(provider_id);
CREATE INDEX idx_enquiries_status ON service_enquiries(status);

