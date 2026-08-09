import React, { useEffect, useState } from 'react';
import type { Provider, Review } from '../types';
import { X, Star, MapPin, Award, CheckCircle2, Send, AlertCircle, Loader2, MessageSquarePlus, ThumbsUp } from 'lucide-react';

interface ProviderModalProps {
    provider: Provider | null;
    initialMode?: 'profile' | 'enquiry';
    onClose: () => void;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({ provider, initialMode = 'profile', onClose }) => {
    if (!provider) return null;

    const [mode, setMode] = useState<'profile' | 'enquiry' | 'review' | 'success'>(initialMode);
    const [profileTab, setProfileTab] = useState<'about' | 'reviews'>('about');

    // Customer Enquiry Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [location, setLocation] = useState('Benin City');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Customer Review Form State
    const [reviewerName, setReviewerName] = useState('');
    const [rating, setRating] = useState<number>(5);
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [currentRating, setCurrentRating] = useState<number>(provider.rating);

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const res = await fetch(`http://localhost:5000/api/providers/${provider.id}/reviews`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.data);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (provider) {
            fetchReviews();
            setCurrentRating(provider.rating);
        }
    }, [provider?.id]);

    const handleEnquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider_id: provider.id,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_email: customerEmail || null,
                    location,
                    service_description: description,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit service enquiry');
            }

            setMode('success');
        } catch (err: any) {
            setError(err.message || 'Failed to connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await fetch(`http://localhost:5000/api/providers/${provider.id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: reviewerName,
                    rating,
                    review_text: reviewText,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit review');
            }

            if (data.new_provider_rating) {
                setCurrentRating(parseFloat(data.new_provider_rating));
            }
            await fetchReviews();
            setMode('profile');
            setProfileTab('reviews');
        } catch (err: any) {
            setError(err.message || 'Failed to connect to server');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
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
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                                }}
                                style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{provider.business_name || provider.full_name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                                        <Star size={14} fill="#d97706" color="#d97706" />
                                        {currentRating}
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

                        {/* Profile Tabs */}
                        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                            <button
                                onClick={() => setProfileTab('about')}
                                style={{
                                    padding: '0.6rem 0.2rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: profileTab === 'about' ? '2px solid #0284c7' : '2px solid transparent',
                                    color: profileTab === 'about' ? '#0284c7' : '#64748b',
                                    fontWeight: profileTab === 'about' ? 700 : 500,
                                    fontSize: '0.925rem',
                                    cursor: 'pointer',
                                }}
                            >
                                About & Services
                            </button>
                            <button
                                onClick={() => setProfileTab('reviews')}
                                style={{
                                    padding: '0.6rem 0.2rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: profileTab === 'reviews' ? '2px solid #0284c7' : '2px solid transparent',
                                    color: profileTab === 'reviews' ? '#0284c7' : '#64748b',
                                    fontWeight: profileTab === 'reviews' ? 700 : 500,
                                    fontSize: '0.925rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Customer Reviews ({reviews.length})
                            </button>
                        </div>

                        {profileTab === 'about' && (
                            <div>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>About Service Provider</h4>
                                    <p style={{ color: '#475569', fontSize: '0.925rem', lineHeight: 1.6 }}>{provider.bio}</p>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>Services Offered</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {provider.services_offered.map((service, idx) => (
                                            <span key={idx} style={{ background: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                ✓ {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {profileTab === 'reviews' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Client Feedback</h4>
                                    <button
                                        className="btn-secondary"
                                        onClick={() => setMode('review')}
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                    >
                                        <MessageSquarePlus size={14} />
                                        Write a Review
                                    </button>
                                </div>

                                {loadingReviews ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
                                        <Loader2 className="animate-spin" size={24} style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
                                        <p style={{ fontSize: '0.85rem' }}>Loading reviews...</p>
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>No customer reviews yet. Be the first to leave feedback!</p>
                                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setMode('review')}>
                                            Write the First Review
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                                        {reviews.map((rev) => (
                                            <div key={rev.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{rev.customer_name}</span>
                                                    <div style={{ display: 'flex', gap: '0.15rem' }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                size={14}
                                                                fill={star <= rev.rating ? '#d97706' : 'none'}
                                                                color={star <= rev.rating ? '#d97706' : '#cbd5e1'}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p style={{ color: '#334155', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>{rev.review_text}</p>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem', display: 'block' }}>
                                                    {new Date(rev.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1, padding: '0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                onClick={() => setMode('review')}
                            >
                                <MessageSquarePlus size={16} />
                                Rate & Review
                            </button>
                            <button
                                className="btn-primary"
                                style={{ flex: 2, padding: '0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={() => setMode('enquiry')}
                            >
                                <Send size={16} />
                                Send Service Enquiry
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'review' && (
                    <div>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem', color: '#0f172a' }}>
                            Write a Review for <span className="gradient-text">{provider.business_name || provider.full_name}</span>
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                            Share your experience to help others in the community find reliable service providers.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem', fontWeight: 600 }}>Select Rating *</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            style={{
                                                background: rating >= star ? '#fef3c7' : '#f8fafc',
                                                border: rating >= star ? '1px solid #fde68a' : '1px solid #cbd5e1',
                                                borderRadius: '8px',
                                                padding: '0.5rem 0.8rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                            }}
                                        >
                                            <Star size={18} fill={rating >= star ? '#d97706' : 'none'} color={rating >= star ? '#d97706' : '#94a3b8'} />
                                            <span style={{ fontWeight: 700, color: rating >= star ? '#b45309' : '#64748b', fontSize: '0.85rem' }}>{star}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Your Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Osagie Kelvin"
                                    value={reviewerName}
                                    onChange={(e) => setReviewerName(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Review Details *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe the quality of work, punctuality, and overall experience..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none', resize: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.8rem' }} onClick={() => setMode('profile')}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <ThumbsUp size={16} />}
                                    {submitting ? 'Submitting Review...' : 'Post Customer Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {mode === 'enquiry' && (
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a' }}>
                            Request Service from <span className="gradient-text">{provider.business_name || provider.full_name}</span>
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                            No registration required. Fill in your details below so the provider can contact you.
                        </p>

                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

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
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '0.3rem', fontWeight: 600 }}>Email Address (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', outline: 'none' }}
                                    />
                                </div>
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
                                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                                    {submitting ? 'Submitting Enquiry...' : 'Submit Service Enquiry'}
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
                            Your service request has been registered and routed to <strong style={{ color: '#0f172a' }}>{provider.business_name || provider.full_name}</strong>. They will contact you directly at <strong style={{ color: '#0f172a' }}>{customerPhone}</strong>.
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
