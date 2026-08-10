import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle2, AlertCircle, Phone, MessageSquare, MapPin, Mail, Calendar, Tag, Camera, X, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { ChatModal } from './ChatModal';
import { NotificationBell } from './NotificationBell';

interface ServiceEnquiry {
    id: number;
    provider_id: number;
    customer_id?: number;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    location: string;
    service_description: string;
    status: 'pending' | 'contacted' | 'completed' | 'cancelled';
    created_at: string;
    business_name?: string;
    provider_name?: string;
    provider_phone?: string;
    provider_avatar?: string;
    provider_location?: string;
    category_name?: string;
}

interface CustomerDashboardProps {
    customer: {
        id: number;
        full_name: string;
        email: string;
        phone: string;
        location: string;
        avatar_url?: string;
        created_at?: string;
    };
    onLogout: () => void;
}

const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
];

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customer, onLogout }) => {
    const [currentCustomer, setCurrentCustomer] = useState(customer);
    const [enquiries, setEnquiries] = useState<ServiceEnquiry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);

    // Profile Avatar Modal States
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
    const [inputAvatarUrl, setInputAvatarUrl] = useState<string>(customer.avatar_url || '');
    const [savingAvatar, setSavingAvatar] = useState<boolean>(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    // Direct Chat Modal State
    const [chatModalState, setChatModalState] = useState<{
        isOpen: boolean;
        enquiryId: number;
        providerName: string;
        serviceDescription: string;
    }>({
        isOpen: false,
        enquiryId: 0,
        providerName: '',
        serviceDescription: '',
    });

    useEffect(() => {
        setCurrentCustomer(customer);
        setInputAvatarUrl(customer.avatar_url || '');
    }, [customer]);

    const fetchCustomerEnquiries = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('http://localhost:5000/api/customers/enquiries', { headers });
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                setError('Backend server is not running on http://localhost:5000 or returned invalid response.');
                return;
            }
            const data = await res.json();
            if (data.success) {
                setEnquiries(data.data || []);
            } else {
                setError(data.message || 'Failed to load your service requests');
            }
        } catch (err: any) {
            console.error('Error loading customer enquiries:', err);
            setError('Unable to connect to server. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCustomerEnquiries();
    }, []);

    const handleSaveAvatar = async (urlToSave: string) => {
        setSavingAvatar(true);
        setAvatarError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('http://localhost:5000/api/customers/profile', {
                method: 'PUT',
                headers,
                body: JSON.stringify({ avatar_url: urlToSave }),
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned invalid response. Please try again.');
            }

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to update profile picture.');
            }

            setCurrentCustomer((prev) => ({ ...prev, avatar_url: data.user.avatar_url }));
            setIsAvatarModalOpen(false);
        } catch (err: any) {
            setAvatarError(err.message || 'Error updating avatar picture');
        } finally {
            setSavingAvatar(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setAvatarError('Image size must be less than 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Url = reader.result as string;
                setInputAvatarUrl(base64Url);
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredEnquiries = filterStatus === 'all'
        ? enquiries
        : enquiries.filter((e) => e.status === filterStatus);

    const counts = {
        total: enquiries.length,
        pending: enquiries.filter((e) => e.status === 'pending').length,
        contacted: enquiries.filter((e) => e.status === 'contacted').length,
        completed: enquiries.filter((e) => e.status === 'completed').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <Clock size={13} /> Pending Review
                    </span>
                );
            case 'contacted':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <MessageSquare size={13} /> Provider Contacted
                    </span>
                );
            case 'completed':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <CheckCircle2 size={13} /> Service Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <AlertCircle size={13} /> Request Cancelled
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
            {/* Header Profile Section */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {/* Interactive Profile Picture / Avatar */}
                    <div style={{ position: 'relative' }}>
                        <div
                            onClick={() => setIsAvatarModalOpen(true)}
                            title="Click to update profile picture"
                            style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: currentCustomer.avatar_url ? '#f1f5f9' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                                cursor: 'pointer',
                                border: '3px solid #ffffff',
                            }}
                        >
                            {currentCustomer.avatar_url ? (
                                <img
                                    src={currentCustomer.avatar_url}
                                    alt={currentCustomer.full_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                currentCustomer.full_name ? currentCustomer.full_name.charAt(0) : 'C'
                            )}
                        </div>
                        <button
                            onClick={() => setIsAvatarModalOpen(true)}
                            title="Change profile picture"
                            style={{
                                position: 'absolute',
                                bottom: '-2px',
                                right: '-2px',
                                background: '#0284c7',
                                color: '#ffffff',
                                border: '2px solid #ffffff',
                                borderRadius: '50%',
                                width: '26px',
                                height: '26px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            }}
                        >
                            <Camera size={13} />
                        </button>
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{currentCustomer.full_name}</h1>
                            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                Verified Customer
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.5rem', color: '#64748b', fontSize: '0.88rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Mail size={15} style={{ color: '#0284c7' }} /> {currentCustomer.email}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={15} style={{ color: '#0284c7' }} /> {currentCustomer.phone}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={15} style={{ color: '#0284c7' }} /> {currentCustomer.location || 'Benin City'}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <NotificationBell userType="customer" userId={currentCustomer.email} />
                    <button
                        onClick={fetchCustomerEnquiries}
                        disabled={refreshing}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '0.65rem 1.1rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh Inbox'}
                    </button>
                    <button
                        onClick={onLogout}
                        style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.65rem 1.1rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Summary Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Total Service Requests</p>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{counts.total}</h3>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #fde68a', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, marginBottom: '0.25rem' }}>Pending Review</p>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#b45309', margin: 0 }}>{counts.pending}</h3>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #bae6fd', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.25rem' }}>Provider Contacted</p>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0369a1', margin: 0 }}>{counts.contacted}</h3>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <p style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, marginBottom: '0.25rem' }}>Completed Services</p>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d', margin: 0 }}>{counts.completed}</h3>
                </div>
            </div>

            {/* Request Inbox Table / Cards */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Service Requests & Inquiries</h2>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        {['all', 'pending', 'contacted', 'completed'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                style={{
                                    padding: '0.4rem 0.85rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    textTransform: 'capitalize',
                                    cursor: 'pointer',
                                    background: filterStatus === st ? '#ffffff' : 'transparent',
                                    color: filterStatus === st ? '#0284c7' : '#64748b',
                                    boxShadow: filterStatus === st ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                }}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#0284c7' }} />
                        <p style={{ fontWeight: 600 }}>Loading your service requests...</p>
                    </div>
                ) : filteredEnquiries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <Clock size={36} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>No Service Requests Found</h4>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                            {filterStatus === 'all'
                                ? "You haven't sent any service requests yet. Search providers on Nation Market Hub to get started!"
                                : `You don't have any requests with "${filterStatus}" status.`}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {filteredEnquiries.map((enquiry) => (
                            <div
                                key={enquiry.id}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    padding: '1.25rem',
                                    background: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                }}
                            >
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                                            {enquiry.business_name ? enquiry.business_name.charAt(0) : 'P'}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                                                {enquiry.business_name || enquiry.provider_name || 'Service Provider'}
                                            </h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                                                {enquiry.category_name && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Tag size={13} style={{ color: '#0284c7' }} /> {enquiry.category_name}
                                                    </span>
                                                )}
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={13} style={{ color: '#0284c7' }} /> {enquiry.location || 'Benin City'}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar size={13} style={{ color: '#64748b' }} /> {new Date(enquiry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>{getStatusBadge(enquiry.status)}</div>
                                </div>

                                <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', color: '#334155' }}>
                                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Requested Work / Description:</strong>
                                    {enquiry.service_description}
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Provider Contact: <strong style={{ color: '#0f172a' }}>{enquiry.provider_phone || 'N/A'}</strong>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setChatModalState({
                                                isOpen: true,
                                                enquiryId: enquiry.id,
                                                providerName: enquiry.business_name || enquiry.provider_name || 'Service Provider',
                                                serviceDescription: enquiry.service_description,
                                            })}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#e0f2fe', border: '1px solid #7dd3fc', color: '#0369a1', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            <MessageSquare size={14} /> Chat Direct
                                        </button>
                                        {enquiry.provider_phone && (
                                            <>
                                                <a
                                                    href={`tel:${enquiry.provider_phone}`}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}
                                                >
                                                    <Phone size={14} /> Call
                                                </a>
                                                <a
                                                    href={`https://wa.me/234${enquiry.provider_phone.replace(/^0/, '')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', border: '1px solid #86efac', color: '#15803d', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}
                                                >
                                                    <MessageSquare size={14} /> WhatsApp
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Direct Chat Modal */}
            <ChatModal
                isOpen={chatModalState.isOpen}
                onClose={() => setChatModalState(prev => ({ ...prev, isOpen: false }))}
                enquiryId={chatModalState.enquiryId}
                customerName={currentCustomer.full_name}
                providerName={chatModalState.providerName}
                serviceDescription={chatModalState.serviceDescription}
                currentUserType="customer"
                currentUserName={currentCustomer.full_name}
            />

            {/* Profile Avatar Update Modal */}
            {isAvatarModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <button
                            onClick={() => setIsAvatarModalOpen(false)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                            <Camera size={24} style={{ color: '#0284c7' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Update Profile Picture</h3>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                            Choose an avatar preset, paste a photo image URL, or upload your own profile image.
                        </p>

                        {avatarError && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                                {avatarError}
                            </div>
                        )}

                        {/* Current Preview */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', background: '#e0f2fe', border: '3px solid #0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#0284c7' }}>
                                {inputAvatarUrl ? (
                                    <img src={inputAvatarUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    currentCustomer.full_name ? currentCustomer.full_name.charAt(0) : 'C'
                                )}
                            </div>
                        </div>

                        {/* Presets */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>Choose Preset Avatar:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem' }}>
                                {PRESET_AVATARS.map((url, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setInputAvatarUrl(url)}
                                        style={{
                                            width: '100%',
                                            aspectRatio: '1',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: inputAvatarUrl === url ? '3px solid #0284c7' : '2px solid #e2e8f0',
                                            cursor: 'pointer',
                                            opacity: inputAvatarUrl === url ? 1 : 0.8,
                                        }}
                                    >
                                        <img src={url} alt={`Preset ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upload local image option */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Upload from Device:</label>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                                <Upload size={16} style={{ color: '#0284c7' }} /> Choose Photo File
                                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                            </label>
                        </div>

                        {/* Or URL Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>Or Image Web URL:</label>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 0.75rem' }}>
                                <ImageIcon size={16} style={{ color: '#64748b', marginRight: '0.5rem' }} />
                                <input
                                    type="url"
                                    placeholder="https://example.com/my-photo.jpg"
                                    value={inputAvatarUrl}
                                    onChange={(e) => setInputAvatarUrl(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem 0', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.85rem' }}
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            {inputAvatarUrl && (
                                <button
                                    onClick={() => setInputAvatarUrl('')}
                                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '0.75rem 1rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                                >
                                    Remove Photo
                                </button>
                            )}
                            <button
                                onClick={() => handleSaveAvatar(inputAvatarUrl)}
                                disabled={savingAvatar}
                                className="btn-primary"
                                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                {savingAvatar ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                                {savingAvatar ? 'Saving...' : 'Save Profile Picture'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
