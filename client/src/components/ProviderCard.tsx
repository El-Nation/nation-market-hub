import React from 'react';
import type { Provider } from '../types';
import { Star, MapPin, Award, Send } from 'lucide-react';

interface ProviderCardProps {
    provider: Provider;
    onViewProfile: (provider: Provider) => void;
    onMakeEnquiry: (provider: Provider) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({ provider, onViewProfile, onMakeEnquiry }) => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', background: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <img
                    src={provider.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={provider.full_name}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    }}
                    style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                            {provider.business_name || provider.full_name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Star size={14} fill="#d97706" color="#d97706" />
                            {provider.rating}
                        </div>
                    </div>
                    {provider.business_name && (
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>By {provider.full_name}</p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={14} style={{ color: '#0284c7' }} />
                            {provider.location}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Award size={14} style={{ color: '#0284c7' }} />
                            {provider.experience_years} yrs exp.
                        </span>
                    </div>
                </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {provider.bio}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {provider.services_offered.slice(0, 3).map((srv, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {srv}
                    </span>
                ))}
                {provider.services_offered.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center' }}>
                        +{provider.services_offered.length - 3} more
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem' }}
                    onClick={() => onViewProfile(provider)}
                >
                    View Profile
                </button>
                <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                    onClick={() => onMakeEnquiry(provider)}
                >
                    <Send size={14} />
                    Request Service
                </button>
            </div>
        </div>
    );
};
