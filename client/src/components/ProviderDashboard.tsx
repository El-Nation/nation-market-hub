import React, { useEffect, useState } from 'react';
import type { Provider } from '../types';
import {
    Phone,
    Mail,
    MapPin,
    Star,
    Award,
    ShieldCheck,
    Clock,
    MessageSquare,
    Loader2,
    LogOut,
    RefreshCw,
} from 'lucide-react';

interface Enquiry {
    id: number;
    provider_id: number;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    location: string;
    service_description: string;
    status: 'pending' | 'contacted' | 'completed' | 'cancelled';
    created_at: string;
}

interface ProviderDashboardProps {
    provider: Provider;
    onLogout: () => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ provider, onLogout }) => {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/providers/${provider.id}/enquiries`);
            const data = await res.json();
            if (data.success) {
                setEnquiries(data.data);
            }
        } catch (err) {
            console.error('Error loading provider enquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, [provider.id]);

    const handleStatusChange = async (enquiryId: number, newStatus: string) => {
        setUpdatingId(enquiryId);
        try {
            const res = await fetch(`http://localhost:5000/api/enquiries/${enquiryId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setEnquiries((prev) =>
                    prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus as any } : e))
                );
            }
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredEnquiries = enquiries.filter((e) =>
        filterStatus === 'all' ? true : e.status === filterStatus
    );

    const pendingCount = enquiries.filter((e) => e.status === 'pending').length;
    const contactedCount = enquiries.filter((e) => e.status === 'contacted').length;
    const completedCount = enquiries.filter((e) => e.status === 'completed').length;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending':
                return { bg: '#fef3c7', color: '#b45309', label: 'Pending Response' };
            case 'contacted':
                return { bg: '#e0f2fe', color: '#0369a1', label: 'Contacted Client' };
            case 'completed':
                return { bg: '#dcfce7', color: '#15803d', label: 'Completed' };
            case 'cancelled':
                return { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' };
            default:
                return { bg: '#f1f5f9', color: '#475569', label: status };
        }
    };

    return (
        <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 180px)', background: '#f8fafc' }}>
            <div className="container">
                {/* Header Card */}
                <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            <img
                                src={provider.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                alt={provider.full_name}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                                }}
                                style={{ width: '84px', height: '84px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #e2e8f0' }}
                            />
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{provider.business_name || provider.full_name}</h1>
                                    <span
                                        style={{
                                            background: provider.status === 'approved' ? '#dcfce7' : '#fef3c7',
                                            color: provider.status === 'approved' ? '#15803d' : '#b45309',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                        }}
                                    >
                                        <ShieldCheck size={14} />
                                        {provider.status === 'approved' ? 'Verified Provider' : 'Pending Review'}
                                    </span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                                    {provider.category_name} • Registered as {provider.full_name}
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.6rem', fontSize: '0.875rem', color: '#475569' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <MapPin size={15} style={{ color: '#0284c7' }} /> {provider.location}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Award size={15} style={{ color: '#0284c7' }} /> {provider.experience_years} Years Experience
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Star size={15} fill="#d97706" color="#d97706" /> {provider.rating} Rating
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={fetchEnquiries}
                                style={{ padding: '0.7rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                            >
                                <RefreshCw size={16} />
                                Refresh Inbox
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={onLogout}
                                style={{ padding: '0.7rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', borderColor: '#fca5a5', fontSize: '0.9rem' }}
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Alert if Pending */}
                {provider.status === 'pending' && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Clock size={28} style={{ color: '#d97706', flexShrink: 0 }} />
                        <div>
                            <h4 style={{ color: '#b45309', fontWeight: 700, fontSize: '1rem' }}>Profile Moderation Under Review</h4>
                            <p style={{ color: '#78350f', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                                Your provider profile has been submitted and is currently being reviewed by administrators. Once approved, your services will be listed publicly on the marketplace.
                            </p>
                        </div>
                    </div>
                )}

                {/* Dashboard Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Total Customer Enquiries</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>{enquiries.length}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#b45309', fontSize: '0.85rem', fontWeight: 600 }}>Pending Action</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>{pendingCount}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#0369a1', fontSize: '0.85rem', fontWeight: 600 }}>Clients Contacted</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7', marginTop: '0.25rem' }}>{contactedCount}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <div style={{ color: '#15803d', fontSize: '0.85rem', fontWeight: 600 }}>Completed Services</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{completedCount}</div>
                    </div>
                </div>

                {/* Customer Enquiries Inbox */}
                <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Customer Service Requests</h2>
                            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                                Manage incoming client leads and track project status in real-time.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '8px' }}>
                            {['all', 'pending', 'contacted', 'completed', 'cancelled'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilterStatus(tab)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: filterStatus === tab ? '#ffffff' : 'transparent',
                                        color: filterStatus === tab ? '#0f172a' : '#64748b',
                                        fontWeight: filterStatus === tab ? 700 : 500,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        boxShadow: filterStatus === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                            <Loader2 className="animate-spin" size={32} style={{ color: '#0284c7', margin: '0 auto 1rem' }} />
                            <p style={{ color: '#64748b' }}>Loading customer enquiries...</p>
                        </div>
                    ) : filteredEnquiries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                            <MessageSquare size={44} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                            <h4 style={{ fontSize: '1.1rem', color: '#334155', fontWeight: 700 }}>No enquiries found</h4>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                {filterStatus === 'all' ? 'You have not received any customer requests yet.' : `No requests with status "${filterStatus}".`}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredEnquiries.map((item) => {
                                const statusInfo = getStatusStyle(item.status);
                                return (
                                    <div
                                        key={item.id}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            padding: '1.25rem',
                                            background: '#ffffff',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>{item.customer_name}</h3>
                                                    <span style={{ background: statusInfo.bg, color: statusInfo.color, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.4rem', fontSize: '0.875rem', color: '#475569' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <Phone size={14} style={{ color: '#0284c7' }} />
                                                        {item.customer_phone}
                                                    </span>
                                                    {item.customer_email && (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                            <Mail size={14} style={{ color: '#0284c7' }} />
                                                            {item.customer_email}
                                                        </span>
                                                    )}
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <MapPin size={14} style={{ color: '#0284c7' }} />
                                                        {item.location}
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8' }}>
                                                        <Clock size={14} />
                                                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Actions & Status Control */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <a
                                                    href={`tel:${item.customer_phone}`}
                                                    className="btn-secondary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                                                >
                                                    <Phone size={14} /> Call Client
                                                </a>
                                                <a
                                                    href={`https://wa.me/234${item.customer_phone.replace(/^0/, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary"
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', borderColor: '#86efac', textDecoration: 'none' }}
                                                >
                                                    <MessageSquare size={14} /> WhatsApp
                                                </a>
                                                <select
                                                    disabled={updatingId === item.id}
                                                    value={item.status}
                                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                    style={{ padding: '0.45rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontWeight: 600, fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
                                                >
                                                    <option value="pending">Mark Pending</option>
                                                    <option value="contacted">Mark Contacted</option>
                                                    <option value="completed">Mark Completed</option>
                                                    <option value="cancelled">Mark Cancelled</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                                            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                Service Description
                                            </strong>
                                            {item.service_description}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
