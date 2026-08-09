import React from 'react';
import type { Provider } from '../types';
import { Store, UserCheck, LogIn, LayoutDashboard, LogOut, Shield } from 'lucide-react';

interface HeaderProps {
    currentProvider: Provider | null;
    viewingDashboard: boolean;
    onToggleDashboard: () => void;
    currentAdmin: { name: string; email: string; role: string } | null;
    viewingAdminDashboard: boolean;
    onToggleAdminDashboard: () => void;
    currentCustomer: { id: number; full_name: string; email: string; phone: string; location: string } | null;
    viewingCustomerDashboard: boolean;
    onToggleCustomerDashboard: () => void;
    onOpenRegisterModal: () => void;
    onOpenLoginModal: () => void;
    onLogout: () => void;
    onAdminLogout: () => void;
    onCustomerLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    currentProvider,
    viewingDashboard,
    onToggleDashboard,
    currentAdmin,
    viewingAdminDashboard,
    onToggleAdminDashboard,
    currentCustomer,
    viewingCustomerDashboard,
    onToggleCustomerDashboard,
    onOpenRegisterModal,
    onOpenLoginModal,
    onLogout,
    onAdminLogout,
    onCustomerLogout,
}) => {
    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Brand Logo */}
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        if (viewingDashboard) onToggleDashboard();
                        if (viewingAdminDashboard) onToggleAdminDashboard();
                        if (viewingCustomerDashboard) onToggleCustomerDashboard();
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
                >
                    <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)' }}>
                        <Store size={22} color="#ffffff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                            Nation Market <span className="gradient-text">Hub</span>
                        </h1>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.5px', fontWeight: 700 }}>
                            SERVICE MARKETPLACE
                        </span>
                    </div>
                </a>

                {/* Right Side Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {currentAdmin ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={onToggleAdminDashboard}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, borderColor: '#86efac', color: '#15803d', background: '#f0fdf4' }}
                            >
                                <Shield size={16} />
                                {viewingAdminDashboard ? 'Marketplace' : 'Admin Moderation'}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={onAdminLogout}
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', color: '#b91c1c', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                                <LogOut size={15} />
                                Sign Out Admin
                            </button>
                        </div>
                    ) : currentProvider ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={onToggleDashboard}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                            >
                                <LayoutDashboard size={16} style={{ color: '#0284c7' }} />
                                {viewingDashboard ? 'Marketplace' : 'My Dashboard'}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={onLogout}
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', color: '#b91c1c', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                                <LogOut size={15} />
                                Logout
                            </button>
                        </div>
                    ) : currentCustomer ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={onToggleCustomerDashboard}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, borderColor: '#bae6fd', color: '#0369a1', background: '#f0f9ff' }}
                            >
                                <LayoutDashboard size={16} style={{ color: '#0284c7' }} />
                                {viewingCustomerDashboard ? 'Marketplace' : 'My Requests'}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={onCustomerLogout}
                                style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', color: '#b91c1c', borderColor: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                                <LogOut size={15} />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button
                                className="btn-secondary"
                                onClick={onOpenLoginModal}
                                style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                            >
                                <LogIn size={16} />
                                Login
                            </button>
                            <button
                                className="btn-primary"
                                onClick={onOpenRegisterModal}
                                style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <UserCheck size={16} />
                                Join as Provider
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
