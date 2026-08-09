import React from 'react';
import { UserCheck, ShieldCheck, Zap } from 'lucide-react';

interface ProviderCTAProps {
    onOpenRegisterModal?: () => void;
}

export const ProviderCTA: React.FC<ProviderCTAProps> = ({ onOpenRegisterModal }) => {
    return (
        <section className="container">
            <div className="provider-cta-section">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                        <Zap size={16} />
                        Are You a Skilled Professional or Business Owner?
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                        Grow Your Business on Nation Market Hub
                    </h2>
                    <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '640px', lineHeight: 1.5 }}>
                        Join hundreds of verified service providers receiving direct client enquiries daily across Benin City. Zero upfront listing fees.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.875rem', color: '#334155', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ShieldCheck size={18} style={{ color: '#10b981' }} />
                            Free Provider Listing
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <ShieldCheck size={18} style={{ color: '#10b981' }} />
                            Direct Client Leads
                        </span>
                    </div>
                </div>

                <div>
                    <button
                        className="btn-primary"
                        onClick={onOpenRegisterModal}
                        style={{ padding: '0.9rem 1.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
                    >
                        <UserCheck size={20} />
                        Register as a Service Provider
                    </button>
                </div>
            </div>
        </section>
    );
};
