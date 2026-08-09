import React, { useEffect, useState } from 'react';
import type { Provider, Category } from '../types';
import { ProviderCard } from './ProviderCard';
import { Search, MapPin, Filter, Loader2, AlertCircle } from 'lucide-react';

interface ProviderSearchProps {
    initialSearchTerm?: string;
    onViewProfile: (provider: Provider) => void;
    onMakeEnquiry: (provider: Provider) => void;
}

export const ProviderSearch: React.FC<ProviderSearchProps> = ({ initialSearchTerm = '', onViewProfile, onMakeEnquiry }) => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [locationFilter, setLocationFilter] = useState<string>('');

    // Fetch Categories for dropdown
    useEffect(() => {
        fetch('http://localhost:5000/api/categories')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setCategories(data.data);
            })
            .catch((err) => console.error('Failed to load categories for filter:', err));
    }, []);

    // Fetch Providers based on filters
    const fetchProviders = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            if (selectedCategory) queryParams.append('category', selectedCategory);
            if (locationFilter) queryParams.append('location', locationFilter);

            const response = await fetch(`http://localhost:5000/api/providers?${queryParams.toString()}`);
            if (!response.ok) throw new Error(`API response error: ${response.status}`);
            const data = await response.json();
            if (data.success) {
                setProviders(data.data);
            } else {
                throw new Error(data.message || 'Failed to load providers');
            }
        } catch (err: any) {
            console.error('Error fetching providers:', err);
            setError(err.message || 'Failed to fetch provider listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, [selectedCategory]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProviders();
    };

    return (
        <section id="providers-search" className="container" style={{ padding: '3rem 1.5rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
                    Find Verified Service Providers
                </h2>
                <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                    Search by skill, business name, or location. Contact providers directly without prior account creation.
                </p>
            </div>

            {/* Search Filter Controls */}
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2.5rem', background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                        <Search size={18} style={{ color: '#0284c7' }} />
                        <input
                            type="text"
                            placeholder="Search by keyword (e.g. Electrician, Plumber, Web)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.9rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                        <Filter size={18} style={{ color: '#0284c7' }} />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            <option value="" style={{ background: '#ffffff', color: '#0f172a' }}>All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug} style={{ background: '#ffffff', color: '#0f172a' }}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem 0.8rem' }}>
                        <MapPin size={18} style={{ color: '#0284c7' }} />
                        <input
                            type="text"
                            placeholder="Location (e.g. Benin City)"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.9rem' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                        Apply Filters
                    </button>
                </form>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <Loader2 className="animate-spin" size={32} style={{ color: '#0284c7', margin: '0 auto 1rem' }} />
                    <p style={{ color: '#64748b' }}>Fetching verified service providers from database...</p>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ padding: '1.5rem', borderColor: '#fca5a5', background: '#fef2f2', textAlign: 'center' }}>
                    <AlertCircle size={28} style={{ color: '#ef4444', margin: '0 auto 0.5rem' }} />
                    <p style={{ color: '#b91c1c' }}>{error}</p>
                </div>
            ) : providers.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: '#ffffff' }}>
                    <p style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: 700 }}>No providers found matching your search.</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        Try clearing search keywords or selecting a different category filter.
                    </p>
                    <button
                        className="btn-secondary"
                        style={{ marginTop: '1rem', padding: '0.5rem 1.25rem' }}
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                            setLocationFilter('');
                            fetchProviders();
                        }}
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {providers.map((provider) => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            onViewProfile={onViewProfile}
                            onMakeEnquiry={onMakeEnquiry}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
