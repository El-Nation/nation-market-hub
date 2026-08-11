import React, { useEffect, useState } from 'react';
import type { Provider } from '../types';
import {
    Shield,
    ShieldCheck,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Ban,
    Star,
    Loader2,
    RefreshCw,
    LogOut,
    Camera,
} from 'lucide-react';

import { SecuritySettingsModal } from './SecuritySettingsModal';
import { NotificationBell } from './NotificationBell';
import { AvatarUploadModal } from './AvatarUploadModal';

interface AdminDashboardProps {
    admin: { name: string; email: string; role: string; two_factor_enabled?: boolean; avatar_url?: string };
    onLogout: () => void;
    onUpdateAdmin?: (updatedAdmin: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    // Security & Password Modal State
    const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
    const [is2faActive, setIs2faActive] = useState<boolean>(admin.two_factor_enabled || false);
    const [adminEmail, setAdminEmail] = useState<string>(admin.email);

    // Admin Avatar State
    const [adminAvatar, setAdminAvatar] = useState<string>(
        admin.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
    );
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

    const [stats, setStats] = useState({
        total_providers: 0,
        pending_providers: 0,
        approved_providers: 0,
        total_enquiries: 0,
        pending_enquiries: 0,
        accepted_enquiries: 0,
        completed_enquiries: 0,
        cancelled_enquiries: 0,
        total_reviews: 0,
        total_customers: 0,
        overall_rating: 0,
        response_rate: 0,
        completion_rate: 0,
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
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/providers?status=${statusFilter}`, { headers }),
                fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, { headers }),
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

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/providers/${providerId}/status`, {
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

    const handleSaveAdminAvatar = async (newAvatarUrl: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/avatar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ avatar_url: newAvatarUrl }),
            });
            const data = await response.json();
            if (data.success) {
                setAdminAvatar(newAvatarUrl);
            }
        } catch (err) {
            console.error('Error updating admin avatar:', err);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 70px)', padding: '2rem 1rem' }}>
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Admin Header Banner */}
                <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #cbd5e1', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Interactive Admin Avatar */}
                        <div
                            style={{ position: 'relative', cursor: 'pointer' }}
                            onClick={() => setIsAvatarModalOpen(true)}
                            title="Click to change profile picture"
                        >
                            <img
                                src={adminAvatar}
                                alt={admin.name}
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #16a34a',
                                    boxShadow: '0 4px 10px rgba(22, 163, 74, 0.2)',
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    padding: '0.2rem',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid #ffffff',
                                }}
                            >
                                <Camera size={12} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Platform Moderation Dashboard</h1>
                                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                    {admin.role}
                                </span>
                            </div>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back, {admin.name} ({adminEmail})</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Admin Platform-Wide Notification Center */}
                        <NotificationBell userType="admin" userId="admin" />

                        <button className="btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => setIsSecurityModalOpen(true)}>
                            <Shield size={16} />
                            Security
                        </button>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Customers</span>
                            <Users size={20} style={{ color: '#0284c7' }} />
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.total_customers}</div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Providers</span>
                            <ShieldCheck size={20} style={{ color: '#16a34a' }} />
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
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <span style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>Platform Requests & Quality</span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <Star size={14} style={{ color: '#eab308' }} fill="#eab308" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{stats.overall_rating} Avg</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({stats.total_reviews})</span>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6' }}>
                                Resp: {stats.response_rate}%
                            </div>
                            <div style={{ background: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                                Comp: {stats.completion_rate}%
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Req.</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>{stats.total_enquiries}</div>
                        </div>
                        <div style={{ background: '#fefce8', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#ca8a04', fontWeight: 700, textTransform: 'uppercase' }}>Pending</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eab308', marginTop: '0.2rem' }}>{stats.pending_enquiries}</div>
                        </div>
                        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>Accepted</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.2rem' }}>{stats.accepted_enquiries}</div>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>Completed</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>{stats.completed_enquiries}</div>
                        </div>
                        <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700, textTransform: 'uppercase' }}>Cancelled</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>{stats.cancelled_enquiries}</div>
                        </div>
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
                            <div className="responsive-table-wrapper" style={{ width: "100%", overflowX: "auto" }}>
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
                        </div>
                    )}
                </div>
            </div>

            {/* Provider Performance Overview */}
            <div className="glass-panel" style={{ marginTop: '2rem', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Provider Performance Overview</h3>
                </div>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Refreshing performance metrics...</div>
                ) : providers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>No providers available to track.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <div className="responsive-table-wrapper" style={{ width: "100%", overflowX: "auto" }}>
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Provider</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Total Req.</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Pending</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Accepted</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Completed</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Cancelled</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Comp. Rate</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Resp. Rate</th>
                                    <th style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {providers.map((p, index) => {
                                    const total = p.total_requests || 0;
                                    const completed = p.completed_requests || 0;
                                    const acc = p.accepted_requests || 0;
                                    const pending = p.pending_requests || 0;
                                    const cancelled = p.cancelled_requests || 0;
                                    
                                    const handled = acc + completed + cancelled;
                                    const responseRate = total > 0 ? ((handled / total) * 100).toFixed(0) + '%' : '-';
                                    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(0) + '%' : '-';

                                    return (
                                        <tr key={`perf-${p.id}`} style={{ borderBottom: index < providers.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#ffffff', transition: 'background 0.2s ease' }}>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.business_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.full_name}</div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>{total}</td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#eab308', fontWeight: 600 }}>{pending}</td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#3b82f6', fontWeight: 600 }}>{acc}</td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{completed}</td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>{cancelled}</td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#3b82f6' }}>
                                                    {completionRate}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#f8fafc', padding: '0.25rem 0.65rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, color: '#8b5cf6' }}>
                                                    {responseRate}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', color: '#eab308' }}>
                                                        <Star size={14} fill="currentColor" />
                                                    </div>
                                                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.average_rating || '0.0'}</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({p.review_count || 0})</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
</div>
                    </div>
                )}
            </div>

            {/* Security Settings Modal */}
            <SecuritySettingsModal
                isOpen={isSecurityModalOpen}
                onClose={() => setIsSecurityModalOpen(false)}
                userRole="admin"
                userEmail={adminEmail}
                is2faEnabled={is2faActive}
                on2faStatusChange={(active) => setIs2faActive(active)}
                onEmailUpdated={(newEmail) => setAdminEmail(newEmail)}
            />

            {/* Admin Avatar Upload Modal */}
            <AvatarUploadModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                currentAvatar={adminAvatar}
                onSaveAvatar={handleSaveAdminAvatar}
            />
        </div>
    );
};
