import React, { useState } from 'react';
import { X, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

interface ContactSupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const API_BASE = import.meta.env.VITE_API_URL || "";

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const res = await fetch(`${API_BASE}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message })
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                    setEmail('');
                    setMessage('');
                }, 3000);
            } else {
                const data = await res.json();
                throw new Error(data.error || 'Failed to send message.');
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message || "Could not connect to support system.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <button className="modal-close" onClick={onClose}><X size={24} /></button>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '60px', height: '60px', backgroundColor: '#e0f2fe',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 1rem auto'
                    }}>
                        <MessageSquare size={32} color="#0284c7" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Contact Support</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                        Send us a message and we'll reply directly to your email.
                    </p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Message Sent!</h3>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Our team will review your request and reply shortly to {email}.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    required
                                    disabled={status === 'loading'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@gmail.com"
                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>How can we help?</label>
                            <textarea
                                required
                                disabled={status === 'loading'}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your issue or question..."
                                rows={4}
                                style={{
                                    width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1',
                                    borderRadius: '8px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical'
                                }}
                            />
                        </div>

                        {status === 'error' && (
                            <div style={{ padding: '0.8rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontSize: '0.85rem' }}>
                                {errorMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading' || !email.trim() || !message.trim()}
                            style={{
                                backgroundColor: '#0284c7', color: 'white', padding: '0.8rem',
                                border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                cursor: (status === 'loading' || !email.trim() || !message.trim()) ? 'not-allowed' : 'pointer',
                                opacity: (status === 'loading' || !email.trim() || !message.trim()) ? 0.7 : 1,
                                transition: 'all 0.2s'
                            }}
                        >
                            {status === 'loading' ? (
                                'Sending...'
                            ) : (
                                <>
                                    <Send size={18} />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
