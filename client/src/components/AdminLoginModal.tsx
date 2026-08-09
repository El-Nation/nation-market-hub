import React, { useState } from 'react';
import { X, Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

interface AdminLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (admin: { name: string; email: string; role: string }) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    if (!isOpen) return null;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Invalid admin credentials');
            }

            onLoginSuccess(data.admin);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to authenticate admin');
        } finally {
            setLoading(false);
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

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo.png" alt="Nation Market Hub" style={{ height: '48px', width: 'auto', marginBottom: '0.5rem' }} />
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>Admin Backoffice Portal</h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Nation Market Hub Administration</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Admin Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="email"
                                required
                                placeholder="admin@nationhub.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.4rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.4rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ background: '#f1f5f9', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                        Default Demo Credentials: <strong>admin@nationhub.com</strong> / <strong>admin123</strong>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Shield size={16} />}
                        {loading ? 'Authenticating...' : 'Access Admin Portal'}
                    </button>
                </form>
            </div>
        </div>
    );
};
