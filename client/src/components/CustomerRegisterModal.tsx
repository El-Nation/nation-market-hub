import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Loader2, Mail, KeyRound, User, Phone, MapPin } from 'lucide-react';

interface CustomerRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegisterSuccess: (role: 'customer', user: any, token: string) => void;
    onOpenLoginModal: () => void;
}

export const CustomerRegisterModal: React.FC<CustomerRegisterModalProps> = ({
    isOpen,
    onClose,
    onRegisterSuccess,
    onOpenLoginModal,
}) => {
    if (!isOpen) return null;

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('Benin City');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/customers/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password,
                    phone,
                    location,
                }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend server is not running on http://localhost:5000 or returned invalid response. Please start `node src/server.js`.');
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed. Please check your details.');
            }

            if (data.token) {
                localStorage.setItem('auth_token', data.token);
            }

            onRegisterSuccess('customer', data.user, data.token);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Server registration error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <UserPlus size={26} style={{ color: '#0284c7' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Customer Sign Up</h2>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Create an account to track your service requests and communicate with service providers.
                </p>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Full Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                            <User size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                            <input
                                type="text"
                                required
                                placeholder="Osas Eghosa"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Email Address</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                            <Mail size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                            <input
                                type="email"
                                required
                                placeholder="osas@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Phone Number</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                            <Phone size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                            <input
                                type="tel"
                                required
                                placeholder="08012345678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Location / City</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                            <MapPin size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                            <input
                                type="text"
                                required
                                placeholder="Benin City"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Password</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                            <KeyRound size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                        {submitting ? 'Creating Account...' : 'Register Account'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.88rem', color: '#64748b' }}>
                    Already have a customer account?{' '}
                    <button
                        onClick={() => {
                            onClose();
                            onOpenLoginModal();
                        }}
                        style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                        Sign In Here
                    </button>
                </div>
            </div>
        </div>
    );
};
