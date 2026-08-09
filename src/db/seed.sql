-- Insert Default Service Categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Home & Repairs', 'home-repairs', 'Plumbing, electrical, carpentry, painting, cleaning and home maintenance services', 'Wrench'),
('Technology', 'technology', 'Web development, software engineering, graphic design, IT support and UI/UX design', 'Laptop'),
('Education', 'education', 'Academic tutoring, language coaching, music lessons and skill training', 'BookOpen'),
('Beauty & Personal Care', 'beauty-personal-care', 'Hair styling, barbering, makeup artistry and skincare', 'Scissors'),
('Food & Catering', 'food-catering', 'Personal chefs, catering services, baking and cooking', 'Utensils'),
('Transport & Automotive', 'transport-automotive', 'Auto mechanics, driving services, car detailing and electrical repairs', 'Car'),
('Professional Services', 'professional-services', 'Accounting, legal guidance, business consulting and administration', 'Briefcase'),
('Health & Wellness', 'health-wellness', 'Fitness training, physiotherapy, medical consultation and wellness coaching', 'Heart')
ON CONFLICT (slug) DO NOTHING;

-- Insert Services under Categories
-- Home & Repairs (Category ID 1)
INSERT INTO services (category_id, name, slug, description) VALUES
(1, 'Plumber', 'plumber', 'Pipe repairs, drainage fixes, water heater installations'),
(1, 'Electrician', 'electrician', 'House wiring, fault diagnosis, appliance installation'),
(1, 'Carpenter', 'carpenter', 'Custom furniture, woodwork, door and window repairs'),
(1, 'Painter', 'painter', 'Interior and exterior wall painting, wall decorative work'),
(1, 'AC Technician', 'ac-technician', 'Air conditioner repair, servicing, and installation'),
(1, 'House Cleaner', 'house-cleaner', 'Deep cleaning, residential and office sanitation');

-- Technology (Category ID 2)
INSERT INTO services (category_id, name, slug, description) VALUES
(2, 'Web Developer', 'web-developer', 'Website creation, web app development, frontend and backend'),
(2, 'Software Developer', 'software-developer', 'Custom application development, APIs, mobile apps'),
(2, 'Graphic Designer', 'graphic-designer', 'Logo design, branding, flyers, visual design'),
(2, 'IT Support', 'it-support', 'Computer repair, network troubleshooting, hardware setup'),
(2, 'UI/UX Designer', 'ui-ux-designer', 'Interface design, wireframing, user experience prototyping');

-- Education (Category ID 3)
INSERT INTO services (category_id, name, slug, description) VALUES
(3, 'Academic Tutor', 'academic-tutor', 'Mathematics, science, English and exam preparation'),
(3, 'Music Instructor', 'music-instructor', 'Piano, guitar, vocal lessons and music theory'),
(3, 'Language Coach', 'language-coach', 'English, French, Spanish and local language tutoring');

-- Beauty & Personal Care (Category ID 4)
INSERT INTO services (category_id, name, slug, description) VALUES
(4, 'Barber', 'barber', 'Men haircut, beard grooming, shaving services'),
(4, 'Hair Stylist', 'hair-stylist', 'Women hair styling, braiding, wig fitting, hair treatment'),
(4, 'Makeup Artist', 'makeup-artist', 'Bridal makeup, event glam, photo session makeup');

-- Food & Catering (Category ID 5)
INSERT INTO services (category_id, name, slug, description) VALUES
(5, 'Personal Chef', 'personal-chef', 'Private meal preparation, home dining experiences'),
(5, 'Caterer', 'caterer', 'Event catering, party food supplies, bulk cooking'),
(5, 'Baker', 'baker', 'Custom cakes, pastries, event desserts');

-- Transport & Automotive (Category ID 6)
INSERT INTO services (category_id, name, slug, description) VALUES
(6, 'Auto Mechanic', 'auto-mechanic', 'Engine repair, brake replacement, vehicle servicing'),
(6, 'Auto Electrician', 'auto-electrician', 'Car wiring, battery replacement, electrical diagnosis'),
(6, 'Driver', 'driver', 'Private driving, event transportation, courier services');

-- Professional Services (Category ID 7)
INSERT INTO services (category_id, name, slug, description) VALUES
(7, 'Accountant', 'accountant', 'Tax filing, bookkeeping, financial consulting'),
(7, 'Lawyer', 'lawyer', 'Legal consultation, contract drafting, business legal advice');

-- Health & Wellness (Category ID 8)
INSERT INTO services (category_id, name, slug, description) VALUES
(8, 'Fitness Trainer', 'fitness-trainer', 'Personal gym training, weight loss coaching, workout plans'),
(8, 'Physiotherapist', 'physiotherapist', 'Physical therapy, rehabilitation, muscle pain relief');

-- Insert Sample Approved Provider Profiles covering ALL 27 Sub-Services
INSERT INTO provider_profiles 
(full_name, email, password_hash, phone, business_name, category_id, services_offered, bio, experience_years, location, rating, status, avatar_url)
VALUES
-- 1. Home & Repairs (Category 1)
(
    'David Okon', 
    'david.electrical@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08012345678', 
    'David Electrical Services', 
    1, 
    ARRAY['Electrician', 'House Wiring', 'Fault Diagnosis', 'Appliance Installation'], 
    'Professional electrician with 8+ years of residential and commercial electrical experience across Benin City.', 
    8, 
    'Benin City', 
    4.85, 
    'approved', 
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80'
),
(
    'Osas Plumbers Ltd', 
    'osas.plumbing@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08023456789', 
    'Osas Plumbing Solutions', 
    1, 
    ARRAY['Plumber', 'Pipe Repairs', 'Drainage Fixes', 'Water Heater Installation'], 
    'Reliable plumbing technician specializing in modern pipe systems, leaks, and bathroom fittings.', 
    6, 
    'Benin City', 
    4.90, 
    'approved', 
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80'
),
(
    'Sparkle Clean Services', 
    'sparkleclean.benin@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08061122334', 
    'Sparkle Clean Benin', 
    1, 
    ARRAY['House Cleaner', 'Deep Cleaning', 'Office Sanitation', 'Post-Construction Cleaning'], 
    'Top-rated residential and commercial cleaning team providing deep cleaning, rug washing, and sanitization services.', 
    5, 
    'Benin City', 
    4.95, 
    'approved', 
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80'
),
(
    'WoodCraft Carpenters', 
    'woodcraft@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08072233445', 
    'WoodCraft Furniture & Carpentry', 
    1, 
    ARRAY['Carpenter', 'Custom Furniture', 'Woodwork', 'Door and Window Repairs'], 
    'Master carpenter crafting bespoke kitchen cabinets, wardrobes, bed frames, and wooden structural repairs.', 
    10, 
    'Benin City', 
    4.80, 
    'approved', 
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=300&q=80'
),
(
    'Vibrant Wall Painters', 
    'vibrantwalls@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08083344556', 
    'Vibrant Walls Painting Co.', 
    1, 
    ARRAY['Painter', 'Interior Painting', 'Exterior Painting', 'Wall Decorative Work'], 
    'Professional painter delivering high-quality interior decor, screeding, 3D wall panels, and weather-resistant exterior coats.', 
    7, 
    'Benin City', 
    4.88, 
    'approved', 
    'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=300&q=80'
),
(
    'CoolBreeze AC Technicians', 
    'coolbreeze.ac@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08094455667', 
    'CoolBreeze Air Conditioning', 
    1, 
    ARRAY['AC Technician', 'Air Conditioner Repair', 'AC Servicing', 'Gas Refill'], 
    'Certified HVAC technician repairing split units, inverter ACs, refrigerator systems, and industrial cooling units.', 
    6, 
    'Benin City', 
    4.92, 
    'approved', 
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80'
),

-- 2. Technology (Category 2)
(
    'Emmanuel Dev', 
    'emmanuel.tech@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08034567890', 
    'TechNova Web Solutions', 
    2, 
    ARRAY['Web Developer', 'Software Developer', 'UI/UX Designer'], 
    'Full-stack developer building modern React, Node.js and mobile applications for startups and local businesses.', 
    5, 
    'Benin City', 
    4.95, 
    'approved', 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
),
(
    'CreativeVision Designs', 
    'creativevision@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08095566778', 
    'CreativeVision Graphics', 
    2, 
    ARRAY['Graphic Designer', 'Logo Design', 'Branding', 'Flyers'], 
    'Creative graphic designer specializing in brand identity, business logos, promotional flyers, and social media kits.', 
    4, 
    'Benin City', 
    4.87, 
    'approved', 
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
),
(
    'CyberTech IT Solutions', 
    'cybertech.it@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08016677889', 
    'CyberTech Systems', 
    2, 
    ARRAY['IT Support', 'Computer Repair', 'Network Troubleshooting', 'Hardware Setup'], 
    'IT support specialist providing laptop repairs, office networking setup, server configuration, and malware cleanup.', 
    8, 
    'Benin City', 
    4.82, 
    'approved', 
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80'
),

-- 3. Education (Category 3)
(
    'Grace Academic Tutors', 
    'grace.tutors@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08045678901', 
    'Swift Minds Coaching', 
    3, 
    ARRAY['Academic Tutor', 'Exam Preparation', 'Mathematics', 'Science'], 
    'Experienced academic coach helping students excel in WAEC, JAMB, and university entrance exams.', 
    7, 
    'Benin City', 
    4.75, 
    'approved', 
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
),
(
    'Harmony Music School', 
    'harmonymusic@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08027788990', 
    'Harmony Music Academy', 
    3, 
    ARRAY['Music Instructor', 'Piano Lessons', 'Guitar Lessons', 'Vocal Training'], 
    'Professional music teacher providing private piano, keyboard, acoustic guitar, and vocal lessons for children and adults.', 
    6, 
    'Benin City', 
    4.90, 
    'approved', 
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
),

-- 4. Beauty & Personal Care (Category 4)
(
    'Executive Cuts Barber', 
    'executivecuts@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08038899001', 
    'Executive VIP Barber Studio', 
    4, 
    ARRAY['Barber', 'Men Haircut', 'Beard Grooming', 'Shaving Services'], 
    'Celebrity barber providing precision haircuts, beard trimming, hair dye, and home service grooming across Benin City.', 
    6, 
    'Benin City', 
    4.96, 
    'approved', 
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80'
),
(
    'Glamour Hair & Beauty', 
    'glamourhair@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08049900112', 
    'Glamour Hair Salon', 
    4, 
    ARRAY['Hair Stylist', 'Braiding', 'Wig Fitting', 'Hair Treatment'], 
    'Expert hair stylist specializing in knotless braids, frontal wig installations, dreadlocks maintenance, and hair care.', 
    8, 
    'Benin City', 
    4.89, 
    'approved', 
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80'
),
(
    'Divine Touch Makeup', 
    'divinetouch.mua@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08050011223', 
    'Divine Touch MUA', 
    4, 
    ARRAY['Makeup Artist', 'Bridal Makeup', 'Event Glam', 'Photo Session Makeup'], 
    'Professional makeup artist providing stunning bridal glam, birthday makeovers, and commercial video makeup.', 
    5, 
    'Benin City', 
    4.93, 
    'approved', 
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80'
),

-- 5. Food & Catering (Category 5)
(
    'Chef Mercy', 
    'chefercy@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08056784058', 
    'Mercy Gourmet Kitchen', 
    5, 
    ARRAY['Personal Chef', 'Caterer', 'Baker'], 
    'Private chef and caterer providing exquisite local and continental dishes for weddings, private dinners, and events.', 
    9, 
    'Benin City', 
    5.00, 
    'approved', 
    'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80'
),

-- 6. Transport & Automotive (Category 6)
(
    'Master Auto Mechanics', 
    'mastermechanics@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08061122335', 
    'Master Auto Repairs', 
    6, 
    ARRAY['Auto Mechanic', 'Engine Repair', 'Brake Replacement', 'Vehicle Servicing'], 
    'Automotive expert servicing Toyota, Lexus, Honda, Mercedes, and Hyundai engines, gearboxes, and suspension systems.', 
    12, 
    'Benin City', 
    4.84, 
    'approved', 
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=80'
),

-- 7. Professional Services (Category 7)
(
    'Apex Financials', 
    'apexfinancials@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08072233446', 
    'Apex Accounting & Tax Consultants', 
    7, 
    ARRAY['Accountant', 'Tax Filing', 'Bookkeeping', 'Financial Consulting'], 
    'Chartered accountant providing business bookkeeping, corporate tax audit, payroll management, and financial advisory.', 
    10, 
    'Benin City', 
    4.91, 
    'approved', 
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80'
),

-- 8. Health & Wellness (Category 8)
(
    'FitLife Coaching', 
    'fitlife.coach@gmail.com', 
    '$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu', 
    '08083344557', 
    'FitLife Personal Training', 
    8, 
    ARRAY['Fitness Trainer', 'Gym Training', 'Weight Loss Coaching', 'Physiotherapist'], 
    'Certified personal fitness trainer offering home gym workouts, body weight loss plans, muscle building, and posture rehab.', 
    6, 
    'Benin City', 
    4.94, 
    'approved', 
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80'
);
