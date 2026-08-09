import React, { useState } from 'react';
import type { Provider } from '../types';
import { X, Star, MapPin, Award, CheckCircle2, Send } from 'lucide-react';

interface ProviderModalProps {
    provider: Provider | null;
    initialMode?: 'profile' | 'enquiry';
    onClose: () => void;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({ provider, initialMode = 'profile', onClose }) => {
    if (!provider) return null;

    const [mode, setMode] = useState<'profile' | 'enquiry' | 'success'>(initialMode);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [location, setLocation] = useState('Benin City');
    const [description, setDescription] = useState('');

    const handleEnquirySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMode('success');
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                {mode === 'profile' && (
                    <div>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <img
                                src={provider.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                alt={provider.full_name}
                                style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{provider.business_name || provider.full_name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <Star size={14} fill="#d97706" color="#d97706" />
                                        {provider.rating}
                                    </div>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Category: {provider.category_name}</p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#475569' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={14} style={{ color: '#0284c7' }} />
                                        {provider.location}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Award size={14} style={{ color: '#0284c7' }} />
                                        {provider.experience_years} years experience
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>About Service Provider</h4>
                            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>{provider.bio}</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Services Offered</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {provider.services_offered.map((service, idx) => (
                                    <span key={idx} style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        ✓ {service}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={() => setMode('enquiry')}
                        >
                            <Send size={18} />
                            Send Service Enquiry to {provider.full_name}
                        </button>
                    </div>
                )}

                {mode === 'enquiry' && (
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>
                            Request Service from <span className="gradient-text">{provider.business_name || provider.full_name}</span>
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            No registration required. Fill in your details below so the provider can contact you.
                        </p>

                        <form onSubmit={handleEnquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Your Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. John Esosa"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="08012345678"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Location / Area *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. GRA, Benin City"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>What service do you need? *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe what you need fixed or done..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.8rem' }} onClick={() => setMode('profile')}>
                                    Back to Profile
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Send size={16} />
                                    Submit Service Enquiry
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {mode === 'success' && (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <CheckCircle2 size={56} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Enquiry Sent Successfully!</h2>
                        <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                            Your request has been routed to <strong style={{ color: '#0f172a' }}>{provider.business_name || provider.full_name}</strong>. They will contact you shortly at <strong style={{ color: '#0f172a' }}>{customerPhone}</strong>.
                        </p>
                        <button className="btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={onClose}>
                            Close & Continue Browsing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
