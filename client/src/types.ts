// TypeScript interface defining the structure of a Category
export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    service_count?: number;
    created_at?: string;
}

// TypeScript interface defining the structure of a Service
export interface Service {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string;
    created_at?: string;
}

// TypeScript interface defining a Provider Review
export interface Review {
    id: number;
    provider_id: number;
    customer_name: string;
    rating: number;
    review_text: string;
    created_at: string;
}

// TypeScript interface defining a Service Provider profile
export interface Provider {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    business_name: string | null;
    category_id: number;
    category_name?: string;
    category_slug?: string;
    services_offered: string[];
    bio: string;
    experience_years: number;
    location: string;
    rating: number;
    review_count?: number;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    avatar_url: string | null;
    created_at?: string;
}
