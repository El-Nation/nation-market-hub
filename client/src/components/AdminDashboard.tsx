import React, { useEffect, useState } from 'react';
import type { Provider } from '../types';
import {
    Shield,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Ban,
    MessageSquare,
    Star,
    Loader2,
    RefreshCw,
    LogOut,
} from 'lucide-react';

interface AdminDashboardProps {
    admin: { name: string; email: string; role: string };
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const [stats, setStats] = useState({
        total_providers: 0,
        pending_providers: 0,
        approved_providers: 0,
        total_enquiries: 0,
        total_reviews: 0,
    });

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const [providersRes, statsRes] = await Promise.all([
                fetch(`http://localhost:5000/api/admin/providers?status=${statusFilter}`, { headers }),
                fetch('http://localhost:5000/api/admin/stats', { headers }),
            ]);

            const providersData = await providersRes.json();
            const statsData = await statsRes.json();

            if (providersData.success) {
                setProviders(providersData.data);
            }
            if (statsData.success) {
                setStats(statsData.stats);
            }
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, [statusFilter]);

    const handleUpdateStatus = async (providerId: number, newStatus: 'approved' | 'rejected' | 'suspended' | 'pending') => {
        setActionLoadingId(providerId);
        try {
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:5000/api/admin/providers/${providerId}/status`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchAdminData();
            }
        } catch (err) {
            console.error('Error updating provider status:', err);
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Admin Header Banner */}
                <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #cbd5e1', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '14px', color: '#16a34a' }}>
                            <Shield size={28} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Platform Moderation Dashboard</h1>
                                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                    {admin.role}
                                </span>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back, {admin.name} ({admin.email})</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={fetchAdminData}>
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#b91c1c', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={onLogout}>
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Platform Summary Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Providers</span>
                            <Users size={20} style={{ color: '#0284c7' }} />
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.total_providers}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #fed7aa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#c2410c', fontWeight: 600 }}>Pending Verification</span>
                            <Clock size={20} style={{ color: '#ea580c' }} />
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c' }}>{stats.pending_providers}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>Approved Providers</span>
                            <CheckCircle2 size={20} style={{ color: '#16a34a' }} />
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{stats.approved_providers}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Enquiries</span>
                            <MessageSquare size={20} style={{ color: '#0284c7' }} />
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.total_enquiries}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Reviews</span>
                            <Star size={20} style={{ color: '#d97706' }} />
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.total_reviews}</div>
                    </div>
                </div>

                {/* Moderation Controls Header & Filter Tabs */}
                <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Provider Application Queue</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Review and verify registered service providers across Benin City</p>
                        </div>

                        {/* Status Filter Tabs */}
                        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'pending', label: 'Pending' },
                                { key: 'approved', label: 'Approved' },
                                { key: 'rejected', label: 'Rejected' },
                                { key: 'suspended', label: 'Suspended' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setStatusFilter(tab.key)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: statusFilter === tab.key ? '#ffffff' : 'transparent',
                                        color: statusFilter === tab.key ? '#0284c7' : '#64748b',
                                        boxShadow: statusFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Providers Table */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                            <Loader2 className="animate-spin" size={32} style={{ color: '#0284c7', margin: '0 auto 0.5rem' }} />
                            <p>Loading provider accounts...</p>
                        </div>
                    ) : providers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                            <p style={{ fontSize: '0.95rem' }}>No provider profiles found for filter "{statusFilter}".</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                        <th style={{ padding: '0.75rem 1rem' }}>Provider / Business</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Contact Details</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Experience</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Rating & Reviews</th>
                                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {providers.map((p) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <img
                                                        src={p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                                                        alt={p.full_name}
                                                        style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.business_name || p.full_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>By {p.full_name} • {p.location}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', color: '#334155', fontWeight: 600 }}>{p.category_name}</td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <div style={{ color: '#0f172a', fontWeight: 600 }}>{p.phone}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{p.experience_years} yrs</td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#b45309', fontWeight: 700 }}>
                                                    <Star size={14} fill="#d97706" color="#d97706" />
                                                    {p.rating} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({p.review_count ?? 0})</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem' }}>
                                                {p.status === 'approved' && (
                                                    <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Approved</span>
                                                )}
                                                {p.status === 'pending' && (
                                                    <span style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Pending Review</span>
                                                )}
                                                {p.status === 'rejected' && (
                                                    <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Rejected</span>
                                                )}
                                                {p.status === 'suspended' && (
                                                    <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Suspended</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                                {actionLoadingId === p.id ? (
                                                    <Loader2 className="animate-spin" size={18} style={{ color: '#0284c7', display: 'inline-block' }} />
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                        {p.status !== 'approved' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(p.id, 'approved')}
                                                                style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                                            >
                                                                <CheckCircle2 size={13} />
                                                                Approve
                                                            </button>
                                                        )}
                                                        {p.status !== 'pending' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(p.id, 'pending')}
                                                                style={{ background: '#eab308', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                                            >
                                                                <Clock size={13} />
                                                                Pending
                                                            </button>
                                                        )}
                                                        {p.status !== 'rejected' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(p.id, 'rejected')}
                                                                style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                                            >
                                                                <XCircle size={13} />
                                                                Reject
                                                            </button>
                                                        )}
                                                        {p.status !== 'suspended' && p.status === 'approved' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(p.id, 'suspended')}
                                                                style={{ background: '#64748b', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                                            >
                                                                <Ban size={13} />
                                                                Suspend
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
