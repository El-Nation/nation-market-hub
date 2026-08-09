import React, { useState } from 'react';
import { X, LogIn, AlertCircle, Loader2, KeyRound, Mail } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (role: 'admin' | 'provider' | 'customer', user: any, token: string) => void;
    onOpenRegisterModal: () => void;
    onOpenCustomerRegisterModal?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
    isOpen,
    onClose,
    onLoginSuccess,
    onOpenRegisterModal,
    onOpenCustomerRegisterModal,
}) => {
    if (!isOpen) return null;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Backend server is not running on http://localhost:5000 or returned invalid response. Please start `node src/server.js`.');
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed. Please check your credentials.');
            }

            if (data.token) {
                localStorage.setItem('auth_token', data.token);
            }

            onLoginSuccess(data.role, data.user, data.token);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Server authentication error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <LogIn size={26} style={{ color: '#0284c7' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Account Login</h2>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Log in with your credentials to access your dashboard.
                </p>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Email Address</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                            <Mail size={18} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
                        {submitting ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.88rem', color: '#64748b' }}>
                    <div>
                        Need a Customer Account?{' '}
                        <button
                            onClick={() => {
                                onClose();
                                if (onOpenCustomerRegisterModal) onOpenCustomerRegisterModal();
                            }}
                            style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                            Create Account
                        </button>
                    </div>
                    <div>
                        Are you a Service Provider?{' '}
                        <button
                            onClick={() => {
                                onClose();
                                onOpenRegisterModal();
                            }}
                            style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                            Join as Provider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
