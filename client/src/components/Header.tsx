import React from 'react';
import { Store, UserCheck } from 'lucide-react';

interface HeaderProps {
    onOpenRegisterModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRegisterModal }) => {
    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Brand Logo */}
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
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

                {/* Right Side CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a href="#providers-search" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                        Browse Services
                    </a>
                    <button
                        className="btn-primary"
                        onClick={onOpenRegisterModal}
                        style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        <UserCheck size={16} />
                        Join as Provider
                    </button>
                </div>
            </div>
        </header>
    );
};
