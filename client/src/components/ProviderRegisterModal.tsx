import React, { useState, useEffect } from 'react';
import type { Category } from '../types';
import { X, UserCheck, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface ProviderRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProviderRegisterModal: React.FC<ProviderRegisterModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [categories, setCategories] = useState<Category[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [categoryId, setCategoryId] = useState<string>('');
    const [servicesText, setServicesText] = useState('');
    const [experienceYears, setExperienceYears] = useState('3');
    const [location, setLocation] = useState('Benin City');
    const [bio, setBio] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/categories')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setCategories(data.data);
                    if (data.data.length > 0) setCategoryId(String(data.data[0].id));
                }
            })
            .catch((err) => console.error('Failed to load categories:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const servicesArray = servicesText
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        try {
            const response = await fetch('http://localhost:5000/api/providers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password,
                    phone,
                    business_name: businessName || null,
                    category_id: categoryId,
                    services_offered: servicesArray.length > 0 ? servicesArray : ['General Service'],
                    experience_years: parseInt(experienceYears, 10),
                    location,
                    bio,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccessMessage(data.message);
        } catch (err: any) {
            setError(err.message || 'Failed to submit registration');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                {successMessage ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        <CheckCircle2 size={60} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>Registration Submitted!</h2>
                        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.25rem', margin: '1.25rem 0', textAlign: 'left' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <ShieldCheck size={24} style={{ color: '#0284c7', flexShrink: 0, marginTop: '0.2rem' }} />
                                <div>
                                    <h4 style={{ color: '#0369a1', fontWeight: 700, fontSize: '0.95rem' }}>Administrator Moderation Notice</h4>
                                    <p style={{ color: '#334155', fontSize: '0.88rem', marginTop: '0.25rem', lineHeight: 1.5 }}>
                                        {successMessage}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button className="btn-primary" style={{ padding: '0.8rem 2rem', marginTop: '1rem' }} onClick={onClose}>
                            Return to Marketplace
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <UserCheck size={28} style={{ color: '#0284c7' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Join as a Service Provider</h2>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Register your skill or business to reach thousands of customers across Benin City and beyond.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Osas David"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Business Name (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Osas Tech Solutions"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="osas@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Password (min 6 chars) *</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="08012345678"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Primary Category *</label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id} style={{ background: '#ffffff', color: '#0f172a' }}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Services Offered (comma separated) *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. House Wiring, Fault Diagnosis, Solar Installation"
                                    value={servicesText}
                                    onChange={(e) => setServicesText(e.target.value)}
                                    style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Years of Experience</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Location / Area *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Benin City"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Short Bio / Professional Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe your expertise, work history, and quality guarantee..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    style={{ width: '100%', padding: '0.7rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary"
                                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
                                {submitting ? 'Registering Provider Profile...' : 'Complete Provider Registration'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};
