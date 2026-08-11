--
-- PostgreSQL database dump
--

\restrict LbAR3hFGPawgmKfKhlu04ebTtfgg6iE1IY1kdtISnAT9BW78AIIfjFxMtS9rLnr

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.service_enquiries DROP CONSTRAINT IF EXISTS service_enquiries_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.provider_reviews DROP CONSTRAINT IF EXISTS provider_reviews_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY public.provider_profiles DROP CONSTRAINT IF EXISTS provider_profiles_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.enquiry_messages DROP CONSTRAINT IF EXISTS enquiry_messages_enquiry_id_fkey;
DROP INDEX IF EXISTS public.idx_services_slug;
DROP INDEX IF EXISTS public.idx_services_category_id;
DROP INDEX IF EXISTS public.idx_reviews_provider_id;
DROP INDEX IF EXISTS public.idx_providers_status;
DROP INDEX IF EXISTS public.idx_providers_location;
DROP INDEX IF EXISTS public.idx_providers_category_id;
DROP INDEX IF EXISTS public.idx_notifications_user_unread;
DROP INDEX IF EXISTS public.idx_messages_enquiry_id;
DROP INDEX IF EXISTS public.idx_enquiries_status;
DROP INDEX IF EXISTS public.idx_enquiries_provider_id;
DROP INDEX IF EXISTS public.idx_enquiries_customer_id;
DROP INDEX IF EXISTS public.idx_categories_slug;
ALTER TABLE IF EXISTS ONLY public.user_notifications DROP CONSTRAINT IF EXISTS user_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_slug_key;
ALTER TABLE IF EXISTS ONLY public.services DROP CONSTRAINT IF EXISTS services_pkey;
ALTER TABLE IF EXISTS ONLY public.service_enquiries DROP CONSTRAINT IF EXISTS service_enquiries_pkey;
ALTER TABLE IF EXISTS ONLY public.provider_reviews DROP CONSTRAINT IF EXISTS provider_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.provider_profiles DROP CONSTRAINT IF EXISTS provider_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.provider_profiles DROP CONSTRAINT IF EXISTS provider_profiles_email_key;
ALTER TABLE IF EXISTS ONLY public.enquiry_messages DROP CONSTRAINT IF EXISTS enquiry_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_pkey;
ALTER TABLE IF EXISTS ONLY public.customers DROP CONSTRAINT IF EXISTS customers_email_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_slug_key;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_name_key;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_pkey;
ALTER TABLE IF EXISTS ONLY public.admins DROP CONSTRAINT IF EXISTS admins_email_key;
ALTER TABLE IF EXISTS public.user_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.services ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.service_enquiries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.provider_reviews ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.provider_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.enquiry_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.customers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admins ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.user_notifications_id_seq;
DROP TABLE IF EXISTS public.user_notifications;
DROP SEQUENCE IF EXISTS public.services_id_seq;
DROP TABLE IF EXISTS public.services;
DROP SEQUENCE IF EXISTS public.service_enquiries_id_seq;
DROP TABLE IF EXISTS public.service_enquiries;
DROP SEQUENCE IF EXISTS public.provider_reviews_id_seq;
DROP TABLE IF EXISTS public.provider_reviews;
DROP SEQUENCE IF EXISTS public.provider_profiles_id_seq;
DROP TABLE IF EXISTS public.provider_profiles;
DROP SEQUENCE IF EXISTS public.enquiry_messages_id_seq;
DROP TABLE IF EXISTS public.enquiry_messages;
DROP SEQUENCE IF EXISTS public.customers_id_seq;
DROP TABLE IF EXISTS public.customers;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.admins_id_seq;
DROP TABLE IF EXISTS public.admins;
DROP SCHEMA IF EXISTS public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(120) DEFAULT 'System Administrator'::character varying,
    reset_token character varying(255),
    reset_token_expires_at timestamp with time zone,
    two_factor_secret character varying(255),
    two_factor_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    avatar_url text
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    full_name character varying(120) NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(30) NOT NULL,
    location character varying(100) DEFAULT 'Benin City'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    avatar_url text,
    reset_token character varying(255),
    reset_token_expires_at timestamp with time zone,
    two_factor_secret character varying(255),
    two_factor_enabled boolean DEFAULT false
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: enquiry_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.enquiry_messages (
    id integer NOT NULL,
    enquiry_id integer NOT NULL,
    sender_type character varying(20) NOT NULL,
    sender_name character varying(150) NOT NULL,
    message_text text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: enquiry_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.enquiry_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: enquiry_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.enquiry_messages_id_seq OWNED BY public.enquiry_messages.id;


--
-- Name: provider_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_profiles (
    id integer NOT NULL,
    full_name character varying(120) NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(30) NOT NULL,
    business_name character varying(150),
    category_id integer NOT NULL,
    services_offered text[] DEFAULT '{}'::text[] NOT NULL,
    bio text,
    experience_years integer DEFAULT 1,
    location character varying(100) DEFAULT 'Benin City'::character varying NOT NULL,
    rating numeric(3,2) DEFAULT 5.00,
    status character varying(20) DEFAULT 'approved'::character varying NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reset_token character varying(255),
    reset_token_expires_at timestamp with time zone,
    two_factor_secret character varying(255),
    two_factor_enabled boolean DEFAULT false
);


--
-- Name: provider_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.provider_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: provider_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.provider_profiles_id_seq OWNED BY public.provider_profiles.id;


--
-- Name: provider_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.provider_reviews (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    customer_name character varying(150) NOT NULL,
    rating integer NOT NULL,
    review_text text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT provider_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: provider_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.provider_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: provider_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.provider_reviews_id_seq OWNED BY public.provider_reviews.id;


--
-- Name: service_enquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_enquiries (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    customer_name character varying(150) NOT NULL,
    customer_phone character varying(50) NOT NULL,
    customer_email character varying(150),
    location character varying(150) NOT NULL,
    service_description text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id integer
);


--
-- Name: service_enquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.service_enquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: service_enquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.service_enquiries_id_seq OWNED BY public.service_enquiries.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id integer NOT NULL,
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notifications (
    id integer NOT NULL,
    user_type character varying(20) NOT NULL,
    user_id character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    link character varying(255),
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_notifications_id_seq OWNED BY public.user_notifications.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: enquiry_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enquiry_messages ALTER COLUMN id SET DEFAULT nextval('public.enquiry_messages_id_seq'::regclass);


--
-- Name: provider_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_profiles ALTER COLUMN id SET DEFAULT nextval('public.provider_profiles_id_seq'::regclass);


--
-- Name: provider_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reviews ALTER COLUMN id SET DEFAULT nextval('public.provider_reviews_id_seq'::regclass);


--
-- Name: service_enquiries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_enquiries ALTER COLUMN id SET DEFAULT nextval('public.service_enquiries_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: user_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications ALTER COLUMN id SET DEFAULT nextval('public.user_notifications_id_seq'::regclass);


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admins (id, email, password_hash, full_name, reset_token, reset_token_expires_at, two_factor_secret, two_factor_enabled, created_at, avatar_url) FROM stdin;
1	lewisdunk170@gmail.com	$2b$10$5QEVo5XP3BM6KaF2IH5q.uc32rhLBOee3dIdb2NyWSrdtwuZbTPcC	System Administrator	477b41e0d362ac7bd0a021377f8d7373ace2467ac28a4f9b026a8df854f18ec5	2026-08-10 23:13:12.995+01	QA2QBHW3KLR4W6C7CKFIS4ST4EZ63G2J	t	2026-08-10 07:34:22.04423+01	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, description, icon, created_at) FROM stdin;
1	Home & Repairs	home-repairs	Plumbing, electrical, carpentry, painting, cleaning and home maintenance services	Wrench	2026-08-09 16:02:49.483362+01
2	Technology	technology	Web development, software engineering, graphic design, IT support and UI/UX design	Laptop	2026-08-09 16:02:49.483362+01
3	Education	education	Academic tutoring, language coaching, music lessons and skill training	BookOpen	2026-08-09 16:02:49.483362+01
4	Beauty & Personal Care	beauty-personal-care	Hair styling, barbering, makeup artistry and skincare	Scissors	2026-08-09 16:02:49.483362+01
5	Food & Catering	food-catering	Personal chefs, catering services, baking and cooking	Utensils	2026-08-09 16:02:49.483362+01
6	Transport & Automotive	transport-automotive	Auto mechanics, driving services, car detailing and electrical repairs	Car	2026-08-09 16:02:49.483362+01
7	Professional Services	professional-services	Accounting, legal guidance, business consulting and administration	Briefcase	2026-08-09 16:02:49.483362+01
8	Health & Wellness	health-wellness	Fitness training, physiotherapy, medical consultation and wellness coaching	Heart	2026-08-09 16:02:49.483362+01
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, full_name, email, password_hash, phone, location, created_at, avatar_url, reset_token, reset_token_expires_at, two_factor_secret, two_factor_enabled) FROM stdin;
1	osas eghosa	smaxtech18@gmail.com	$2b$10$SmqYdN3NPo3/9ZdF/vIbWOQb9KWbulcFqZs3uzWGWCIBi3IR8Wmhe	09029479621	Benin City	2026-08-09 17:17:42.119666+01	\N	\N	\N	\N	f
2	osas eghosa	smaxtech16@gmail.com	$2b$10$SvAdSwqN2vl7ZawhqsPWseEQPVX4d9PvE/5HpQ4kdgUWnwzrOOfOe	09029479621	Benin City	2026-08-09 17:19:02.005488+01	https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80	60824a4c408c754332a8b9632d6b8e7f84c8c6e1fa4e44912326e7564151d3eb	2026-08-10 22:50:43.391+01	\N	f
\.


--
-- Data for Name: enquiry_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.enquiry_messages (id, enquiry_id, sender_type, sender_name, message_text, created_at) FROM stdin;
1	1	customer	John Esosa	Hello! Just checking on the estimated arrival time for the service.	2026-08-09 23:43:10.109274+01
2	1	provider	Service Provider	Hi there! I am on my way and will arrive in approximately 20 minutes.	2026-08-09 23:43:10.123618+01
3	16	provider	Mercy Gourmet Kitchen	okay good how many small chop do you need	2026-08-10 00:12:59.781332+01
4	16	customer	osas eghosa	need  more like  15 samosa, 10 spring roll 20 puff puff and meat count thats all	2026-08-10 00:14:45.870385+01
5	15	provider	Mercy Gourmet Kitchen	okay how many portion do you need	2026-08-10 00:32:54.123803+01
6	16	provider	Mercy Gourmet Kitchen	okay got that will be 20,000	2026-08-10 00:35:37.167377+01
7	18	provider	Mercy Gourmet Kitchen	Hello Pipeline Auditor, we can accept your VIP catering request!	2026-08-10 01:10:19.788676+01
8	18	customer	Pipeline Auditor	Awesome! What is the total cost for 50 guests?	2026-08-10 01:10:19.812543+01
9	16	provider	Mercy Gourmet Kitchen	let me know hwen u need it okay	2026-08-10 01:12:42.906615+01
10	16	customer	osas eghosa	today by 6pm ,call the account number	2026-08-10 01:13:45.958551+01
11	16	provider	Mercy Gourmet Kitchen	okay that  fine send payment to this account 7066784058 opay destiny eghe	2026-08-10 01:21:18.39468+01
12	16	provider	Mercy Gourmet Kitchen	while we process ur order	2026-08-10 01:21:27.402571+01
13	16	customer	osas eghosa	okay am on it give me few mins	2026-08-10 01:22:09.58554+01
\.


--
-- Data for Name: provider_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_profiles (id, full_name, email, password_hash, phone, business_name, category_id, services_offered, bio, experience_years, location, rating, status, avatar_url, created_at, reset_token, reset_token_expires_at, two_factor_secret, two_factor_enabled) FROM stdin;
2	Osas Plumbers Ltd	osas.plumbing@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08023456789	Osas Plumbing Solutions	1	{Plumber,"Pipe Repairs","Drainage Fixes","Water Heater Installation"}	Reliable plumbing technician specializing in modern pipe systems, leaks, and bathroom fittings.	6	Benin City	4.90	approved	https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
5	Vibrant Wall Painters	vibrantwalls@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08083344556	Vibrant Walls Painting Co.	1	{Painter,"Interior Painting","Exterior Painting","Wall Decorative Work"}	Professional painter delivering high-quality interior decor, screeding, 3D wall panels, and weather-resistant exterior coats.	7	Benin City	4.88	approved	https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
8	CreativeVision Designs	creativevision@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08095566778	CreativeVision Graphics	2	{"Graphic Designer","Logo Design",Branding,Flyers}	Creative graphic designer specializing in brand identity, business logos, promotional flyers, and social media kits.	4	Benin City	4.87	approved	https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
9	CyberTech IT Solutions	cybertech.it@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08016677889	CyberTech Systems	2	{"IT Support","Computer Repair","Network Troubleshooting","Hardware Setup"}	IT support specialist providing laptop repairs, office networking setup, server configuration, and malware cleanup.	8	Benin City	4.82	approved	https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
11	Harmony Music School	harmonymusic@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08027788990	Harmony Music Academy	3	{"Music Instructor","Piano Lessons","Guitar Lessons","Vocal Training"}	Professional music teacher providing private piano, keyboard, acoustic guitar, and vocal lessons for children and adults.	6	Benin City	4.90	approved	https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
12	Executive Cuts Barber	executivecuts@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08038899001	Executive VIP Barber Studio	4	{Barber,"Men Haircut","Beard Grooming","Shaving Services"}	Celebrity barber providing precision haircuts, beard trimming, hair dye, and home service grooming across Benin City.	6	Benin City	4.96	approved	https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
13	Glamour Hair & Beauty	glamourhair@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08049900112	Glamour Hair Salon	4	{"Hair Stylist",Braiding,"Wig Fitting","Hair Treatment"}	Expert hair stylist specializing in knotless braids, frontal wig installations, dreadlocks maintenance, and hair care.	8	Benin City	4.89	approved	https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
14	Divine Touch Makeup	divinetouch.mua@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08050011223	Divine Touch MUA	4	{"Makeup Artist","Bridal Makeup","Event Glam","Photo Session Makeup"}	Professional makeup artist providing stunning bridal glam, birthday makeovers, and commercial video makeup.	5	Benin City	4.93	approved	https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
7	Emmanuel Dev	emmanuel.tech@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08034567890	TechNova Web Solutions	2	{"Web Developer","Software Developer","UI/UX Designer"}	Full-stack developer building modern React, Node.js and mobile applications for startups and local businesses.	5	Benin City	4.95	approved	https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
6	CoolBreeze AC Technicians	coolbreeze.ac@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08094455667	CoolBreeze Air Conditioning	1	{"AC Technician","Air Conditioner Repair","AC Servicing","Gas Refill"}	Certified HVAC technician repairing split units, inverter ACs, refrigerator systems, and industrial cooling units.	6	Benin City	4.92	approved	https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
15	Chef Mercy	mylesmyron8@gmail.com	$2b$10$Y563QxICGovZgGHDq1I9EuqYCOXpTDFw6Awh5sXkW689FOv0BeINS	08056784058	Mercy Gourmet Kitchen	5	{"Personal Chef",Caterer,Baker}	Private chef and caterer providing exquisite local and continental dishes for weddings, private dinners, and events.	9	Benin City	5.00	approved	https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	1977f784870841f46fc2ce129105a33225d731dbeed0cd2f91591a3be4e608c3	2026-08-10 22:22:02.231+01	\N	f
10	Grace Academic Tutors	grace.tutors@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08045678901	Swift Minds Coaching	3	{"Academic Tutor","Exam Preparation",Mathematics,Science,"Language Coach"}	Experienced academic coach helping students excel in WAEC, JAMB, and university entrance exams.	7	Benin City	4.00	approved	https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
16	Master Auto Mechanics	mastermechanics@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08061122335	Master Auto Repairs	6	{"Auto Mechanic","Engine Repair","Brake Replacement","Vehicle Servicing"}	Automotive expert servicing Toyota, Lexus, Honda, Mercedes, and Hyundai engines, gearboxes, and suspension systems.	12	Benin City	4.84	approved	https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
17	Apex Financials	apexfinancials@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08072233446	Apex Accounting & Tax Consultants	7	{Accountant,"Tax Filing",Bookkeeping,"Financial Consulting"}	Chartered accountant providing business bookkeeping, corporate tax audit, payroll management, and financial advisory.	10	Benin City	4.91	approved	https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
18	FitLife Coaching	fitlife.coach@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08083344557	FitLife Personal Training	8	{"Fitness Trainer","Gym Training","Weight Loss Coaching",Physiotherapist}	Certified personal fitness trainer offering home gym workouts, body weight loss plans, muscle building, and posture rehab.	6	Benin City	4.94	approved	https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
19	Swift Wheels Admin	swiftwheels@gmail.com	$2b$10$su.dpyaF57C9naB.teslWejZeWVLFzZG1sB1yuqLvvTTPxJ9HecPK	08011223344	Swift Wheels Transport	6	{Driver}	Professional executive chauffeuring, airport transfers, and private taxi logistics.	5	Benin City	5.00	approved	\N	2026-08-10 22:33:12.816192+01	\N	\N	\N	f
4	WoodCraft Carpenters	woodcraft@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08072233445	WoodCraft Furniture & Carpentry	1	{Carpenter,"Custom Furniture",Woodwork,"Door and Window Repairs"}	Master carpenter crafting bespoke kitchen cabinets, wardrobes, bed frames, and wooden structural repairs.	10	Benin City	4.80	approved	https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
3	Sparkle Clean Services	sparkleclean.benin@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08061122334	Sparkle Clean Benin	1	{"House Cleaner","Deep Cleaning","Office Sanitation","Post-Construction Cleaning"}	Top-rated residential and commercial cleaning team providing deep cleaning, rug washing, and sanitization services.	5	Benin City	4.95	approved	https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
20	Justice Legal Admin	justice.law@gmail.com	$2b$10$tSYonYnSdE66NKyQhvI5WOdOEf3w4wEbpbkER6BqW9XpyoSP.F3.G	08022334455	Justice Legal Partners	7	{Lawyer}	Reputable legal firm focusing on contract drafting, corporate consulting, and civil defense.	12	Benin City	5.00	approved	\N	2026-08-10 22:33:13.12447+01	\N	\N	\N	f
1	David Okon	david.electrical@gmail.com	$2b$10$Lxjw/8PWE1Kcz7zjztwpduhKTlKcvH9yoXAYJI7Zee2aOPuseJwsu	08012345678	David Electrical Services	1	{Electrician,"House Wiring","Fault Diagnosis","Appliance Installation","Auto Electrician"}	Professional electrician with 8+ years of residential and commercial electrical experience across Benin City.	8	Benin City	5.00	approved	https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80	2026-08-09 16:02:49.483362+01	\N	\N	\N	f
\.


--
-- Data for Name: provider_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.provider_reviews (id, provider_id, customer_name, rating, review_text, created_at) FROM stdin;
1	1	Osagie Kelvin	5	David fixed my complete duplex electrical wiring perfectly. Very professional and polite!	2026-08-09 16:02:49.483362+01
2	1	Aisha Mohammed	5	Quick response when my generator breaker tripped. Highly recommend David Electrical Services.	2026-08-09 16:02:49.483362+01
3	2	Victor Edet	5	Osas Plumbing fixed our blocked main drainage line within 2 hours. Clean work!	2026-08-09 16:02:49.483362+01
4	6	Grace Ighodaro	5	Master Auto Repairs diagnosed my Lexus gearbox issue accurately when 3 other mechanics failed.	2026-08-09 16:02:49.483362+01
5	6	Blessing Amadasun	4	Very knowledgeable mechanic. Fixed my Toyota suspension fast.	2026-08-09 16:02:49.483362+01
6	1	Test Customer	5	Outstanding service and quick turnaround!	2026-08-09 16:04:08.519733+01
7	10	smax tech	4	very good work	2026-08-09 16:06:13.392286+01
\.


--
-- Data for Name: service_enquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_enquiries (id, provider_id, customer_name, customer_phone, customer_email, location, service_description, status, created_at, customer_id) FROM stdin;
1	1	John Esosa	08099887766	john@example.com	GRA Benin	Need urgent house wiring diagnosis and socket repair	pending	2026-08-09 11:14:41.410176+01	\N
2	4	john kelly	08106476280	lewisdunk170@gmail.com	Benin City	need furniture	pending	2026-08-09 11:22:04.169222+01	\N
3	1	Jane Doe	08123456789	jane@example.com	GRA Benin	AC Servicing and Gas Refill	cancelled	2026-08-09 11:34:23.259568+01	\N
4	2	osas eghosa	09029479621	smaxtech16@gmail.com	Benin City	Need emergency pipe repair and bathroom sink installation.	contacted	2026-08-09 17:22:55.847213+01	2
5	5	osas eghosa	09029479621	smaxtech16@gmail.com	Benin City	Need full interior 3-bedroom apartment painting with quality emulsion paint.	pending	2026-08-09 17:22:55.848222+01	2
6	15	john kelly	08106476280	lewisdunk170@gmail.com	Benin City	need pounded yam and egusi soup	pending	2026-08-09 18:30:39.609915+01	\N
7	15	john kelly	08106476280	lewisdunk170@gmail.com	Benin City	need fried rice and turkey	pending	2026-08-09 18:40:50.228805+01	\N
8	15	john kelly	08106476280	lewisdunk170@gmail.com	Benin City	need fried chicken and fried rice	pending	2026-08-09 18:46:36.703319+01	\N
9	15	kelly	09029479621	smaxtech02@gmail.com	Benin City	need okro soup and eba	pending	2026-08-09 18:47:40.934706+01	\N
10	15	kelly	09029479621	smaxtech02@gmail.com	Benin City	need spaghetti and  turkey	pending	2026-08-09 19:24:25.693864+01	\N
11	15	kelly	09029479621	smaxtech02@gmail.com	Benin City	need okro and veegtable soup with poundo	pending	2026-08-09 23:07:12.249146+01	\N
12	15	kelly	09029479621	smaxtech02@gmail.com	Benin City	need beans and dodo	pending	2026-08-09 23:12:35.987907+01	\N
13	15	john kelly	08106476280	lewisdunk170@gmail.com	Benin City	need beans and dodo	pending	2026-08-09 23:13:13.065367+01	\N
14	15	john kelly	08106476280	lewisdunk170@gmail.com	Benin City	need rice and turkey	pending	2026-08-09 23:23:12.331585+01	\N
16	15	osas eghosa	09029479621	smaxtech16@gmail.com	Benin City	need small chops	contacted	2026-08-10 00:00:34.239913+01	\N
15	15	john kelly	08106476280	lewisdunk170@gmail.com	Benin City	need fried rice salad and chicken	contacted	2026-08-09 23:29:51.283012+01	\N
17	15	Destiny Eghenayahiorre	08158457087	deghenayahiorre@gmail.com	Benin City	need food tray	pending	2026-08-10 00:48:19.468366+01	\N
18	15	Pipeline Auditor	08123456789	pipeline.auditor@gmail.com	Benin City	Need VIP catering service for 50 guests this weekend	pending	2026-08-10 01:10:05.66631+01	\N
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.services (id, category_id, name, slug, description, created_at) FROM stdin;
1	1	Plumber	plumber	Pipe repairs, drainage fixes, water heater installations	2026-08-09 16:02:49.483362+01
2	1	Electrician	electrician	House wiring, fault diagnosis, appliance installation	2026-08-09 16:02:49.483362+01
3	1	Carpenter	carpenter	Custom furniture, woodwork, door and window repairs	2026-08-09 16:02:49.483362+01
4	1	Painter	painter	Interior and exterior wall painting, wall decorative work	2026-08-09 16:02:49.483362+01
5	1	AC Technician	ac-technician	Air conditioner repair, servicing, and installation	2026-08-09 16:02:49.483362+01
6	1	House Cleaner	house-cleaner	Deep cleaning, residential and office sanitation	2026-08-09 16:02:49.483362+01
7	2	Web Developer	web-developer	Website creation, web app development, frontend and backend	2026-08-09 16:02:49.483362+01
8	2	Software Developer	software-developer	Custom application development, APIs, mobile apps	2026-08-09 16:02:49.483362+01
9	2	Graphic Designer	graphic-designer	Logo design, branding, flyers, visual design	2026-08-09 16:02:49.483362+01
10	2	IT Support	it-support	Computer repair, network troubleshooting, hardware setup	2026-08-09 16:02:49.483362+01
11	2	UI/UX Designer	ui-ux-designer	Interface design, wireframing, user experience prototyping	2026-08-09 16:02:49.483362+01
12	3	Academic Tutor	academic-tutor	Mathematics, science, English and exam preparation	2026-08-09 16:02:49.483362+01
13	3	Music Instructor	music-instructor	Piano, guitar, vocal lessons and music theory	2026-08-09 16:02:49.483362+01
14	3	Language Coach	language-coach	English, French, Spanish and local language tutoring	2026-08-09 16:02:49.483362+01
15	4	Barber	barber	Men haircut, beard grooming, shaving services	2026-08-09 16:02:49.483362+01
16	4	Hair Stylist	hair-stylist	Women hair styling, braiding, wig fitting, hair treatment	2026-08-09 16:02:49.483362+01
17	4	Makeup Artist	makeup-artist	Bridal makeup, event glam, photo session makeup	2026-08-09 16:02:49.483362+01
18	5	Personal Chef	personal-chef	Private meal preparation, home dining experiences	2026-08-09 16:02:49.483362+01
19	5	Caterer	caterer	Event catering, party food supplies, bulk cooking	2026-08-09 16:02:49.483362+01
20	5	Baker	baker	Custom cakes, pastries, event desserts	2026-08-09 16:02:49.483362+01
21	6	Auto Mechanic	auto-mechanic	Engine repair, brake replacement, vehicle servicing	2026-08-09 16:02:49.483362+01
22	6	Auto Electrician	auto-electrician	Car wiring, battery replacement, electrical diagnosis	2026-08-09 16:02:49.483362+01
23	6	Driver	driver	Private driving, event transportation, courier services	2026-08-09 16:02:49.483362+01
24	7	Accountant	accountant	Tax filing, bookkeeping, financial consulting	2026-08-09 16:02:49.483362+01
25	7	Lawyer	lawyer	Legal consultation, contract drafting, business legal advice	2026-08-09 16:02:49.483362+01
26	8	Fitness Trainer	fitness-trainer	Personal gym training, weight loss coaching, workout plans	2026-08-09 16:02:49.483362+01
27	8	Physiotherapist	physiotherapist	Physical therapy, rehabilitation, muscle pain relief	2026-08-09 16:02:49.483362+01
\.


--
-- Data for Name: user_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_notifications (id, user_type, user_id, title, message, link, is_read, created_at) FROM stdin;
1	provider	15	New Service Request!	Test Notification for Provider 15	/provider-dashboard	f	2026-08-10 01:07:36.709971+01
2	customer	lewisdunk170@gmail.com	Service Request Sent	Test Notification for Customer	/customer-dashboard	f	2026-08-10 01:07:36.739857+01
3	provider	15	New Service Request!	New request from Pipeline Auditor: "Need VIP catering service for 50 guests this weeke..."	/provider-dashboard	f	2026-08-10 01:10:05.674616+01
4	customer	pipeline.auditor@gmail.com	Service Request Sent	Your request to Mercy Gourmet Kitchen for "Need VIP catering service for 50 guests ..." has been sent successfully.	/customer-dashboard	f	2026-08-10 01:10:05.694332+01
5	customer	pipeline.auditor@gmail.com	New Message from Mercy Gourmet Kitchen	"Hello Pipeline Auditor, we can accept your VIP cat..."	/customer-dashboard	f	2026-08-10 01:10:19.801125+01
6	provider	15	New Message from Pipeline Auditor	"Awesome! What is the total cost for 50 guests?"	/provider-dashboard	f	2026-08-10 01:10:19.814173+01
7	customer	smaxtech16@gmail.com	New Message from Mercy Gourmet Kitchen	"let me know hwen u need it okay"	/customer-dashboard	t	2026-08-10 01:12:42.910958+01
8	provider	15	New Message from osas eghosa	"today by 6pm ,call the account number"	/provider-dashboard	t	2026-08-10 01:13:45.961398+01
10	customer	smaxtech16@gmail.com	New Message from Mercy Gourmet Kitchen	"while we process ur order"	/customer-dashboard	t	2026-08-10 01:21:27.404158+01
9	customer	smaxtech16@gmail.com	New Message from Mercy Gourmet Kitchen	"okay that  fine send payment to this account 70667..."	/customer-dashboard	t	2026-08-10 01:21:18.411272+01
11	provider	15	New Message from osas eghosa	"okay am on it give me few mins"	/provider-dashboard	f	2026-08-10 01:22:09.592261+01
12	admin	admin	New Customer Registered	Test Customer registered an account.	/admin-dashboard	f	2026-08-10 08:38:43.290033+01
\.


--
-- Name: admins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admins_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 8, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 2, true);


--
-- Name: enquiry_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.enquiry_messages_id_seq', 13, true);


--
-- Name: provider_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.provider_profiles_id_seq', 20, true);


--
-- Name: provider_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.provider_reviews_id_seq', 7, true);


--
-- Name: service_enquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.service_enquiries_id_seq', 18, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.services_id_seq', 27, true);


--
-- Name: user_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_notifications_id_seq', 12, true);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: enquiry_messages enquiry_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enquiry_messages
    ADD CONSTRAINT enquiry_messages_pkey PRIMARY KEY (id);


--
-- Name: provider_profiles provider_profiles_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_email_key UNIQUE (email);


--
-- Name: provider_profiles provider_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_pkey PRIMARY KEY (id);


--
-- Name: provider_reviews provider_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reviews
    ADD CONSTRAINT provider_reviews_pkey PRIMARY KEY (id);


--
-- Name: service_enquiries service_enquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_enquiries
    ADD CONSTRAINT service_enquiries_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: services services_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_slug_key UNIQUE (slug);


--
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- Name: idx_categories_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);


--
-- Name: idx_enquiries_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enquiries_customer_id ON public.service_enquiries USING btree (customer_id);


--
-- Name: idx_enquiries_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enquiries_provider_id ON public.service_enquiries USING btree (provider_id);


--
-- Name: idx_enquiries_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enquiries_status ON public.service_enquiries USING btree (status);


--
-- Name: idx_messages_enquiry_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_enquiry_id ON public.enquiry_messages USING btree (enquiry_id);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.user_notifications USING btree (user_type, user_id, is_read);


--
-- Name: idx_providers_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_category_id ON public.provider_profiles USING btree (category_id);


--
-- Name: idx_providers_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_location ON public.provider_profiles USING btree (location);


--
-- Name: idx_providers_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_providers_status ON public.provider_profiles USING btree (status);


--
-- Name: idx_reviews_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reviews_provider_id ON public.provider_reviews USING btree (provider_id);


--
-- Name: idx_services_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_category_id ON public.services USING btree (category_id);


--
-- Name: idx_services_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_slug ON public.services USING btree (slug);


--
-- Name: enquiry_messages enquiry_messages_enquiry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.enquiry_messages
    ADD CONSTRAINT enquiry_messages_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES public.service_enquiries(id) ON DELETE CASCADE;


--
-- Name: provider_profiles provider_profiles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_profiles
    ADD CONSTRAINT provider_profiles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: provider_reviews provider_reviews_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.provider_reviews
    ADD CONSTRAINT provider_reviews_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.provider_profiles(id) ON DELETE CASCADE;


--
-- Name: service_enquiries service_enquiries_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_enquiries
    ADD CONSTRAINT service_enquiries_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict LbAR3hFGPawgmKfKhlu04ebTtfgg6iE1IY1kdtISnAT9BW78AIIfjFxMtS9rLnr

