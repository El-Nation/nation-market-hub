import React, { useState } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';

interface HeroProps {
    onSearch?: (term: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    return (
        <section className="hero-section">
            <div className="container">
                <h1 className="hero-title">
                    Find the right person <br />
                    <span className="gradient-text">for the job.</span>
                </h1>

                <p className="hero-subtitle">
                    Connect directly with trusted local service providers across Home Repairs, Technology, Education, Beauty, Transport & more.
                </p>

                <form onSubmit={handleSearchSubmit} className="search-box">
                    <div className="search-input-wrapper">
                        <Search size={22} style={{ color: '#0284c7' }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="What service do you need? (e.g. Plumber, Electrician, Web Developer)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="search-input-wrapper" style={{ borderLeft: '1px solid #e2e8f0', maxWidth: '180px' }}>
                        <MapPin size={20} style={{ color: '#0284c7' }} />
                        <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Benin City</span>
                    </div>

                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '14px', padding: '0.8rem 1.5rem' }}>
                        Search
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600 }}>Popular Searches:</span>
                    {['Plumber', 'Electrician', 'Web Developer', 'Academic Tutor', 'Personal Chef', 'House Cleaner'].map((term) => (
                        <button
                            key={term}
                            type="button"
                            className="glass-panel"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.825rem', color: '#0f172a', fontWeight: 600, background: '#ffffff' }}
                            onClick={() => {
                                setSearchTerm(term);
                                if (onSearch) onSearch(term);
                            }}
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};
