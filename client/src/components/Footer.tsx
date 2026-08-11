import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface FooterProps {
    onCategorySearch?: (term: string) => void;
    onOpenProviderRegister?: () => void;
    onOpenContactSupport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategorySearch, onOpenProviderRegister, onOpenContactSupport }) => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <a href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <img src="/logo.png" alt="Nation Market Hub Logo" style={{ height: '36px', width: 'auto' }} />
                            <span>Nation<span className="gradient-text">Market</span>Hub</span>
                        </a>
                        <p className="footer-brand-desc">
                            Connecting people looking for services with qualified, reliable service providers across Nigeria.
                        </p>

                        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} style={{ color: '#38bdf8' }} />
                                <a href="mailto:eghedestiny10@gmail.com">eghedestiny10@gmail.com</a>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} style={{ color: '#38bdf8' }} />
                                <a href="tel:07066784058">07066784058</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Popular Categories</h4>
                        <ul>
                            <li><a href="#providers-search" onClick={() => onCategorySearch && onCategorySearch('Home & Repairs')}>Home & Repairs</a></li>
                            <li><a href="#providers-search" onClick={() => onCategorySearch && onCategorySearch('Technology')}>Technology</a></li>
                            <li><a href="#providers-search" onClick={() => onCategorySearch && onCategorySearch('Education')}>Education</a></li>
                            <li><a href="#providers-search" onClick={() => onCategorySearch && onCategorySearch('Beauty & Personal Care')}>Beauty & Personal Care</a></li>
                            <li><a href="#providers-search" onClick={() => onCategorySearch && onCategorySearch('Transport & Auto')}>Transport & Auto</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#providers-search">Browse Services</a></li>
                            <li><a href="#provider-cta" onClick={(e) => { if (onOpenProviderRegister) { e.preventDefault(); onOpenProviderRegister(); } }}>Become a Provider</a></li>
                            <li><a href="#how-it-works">How it Works</a></li>
                            <li><a href="#pricing">Pricing & Fees</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Support & Legal</h4>
                        <ul>
                            <li><a href="/help" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>Help & FAQs</a></li>
                            <li><a href="/terms" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>Terms of Service</a></li>
                            <li><a href="/privacy" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>Privacy Policy</a></li>
                            <li><a href="#contact" onClick={(e) => { if(onOpenContactSupport) { e.preventDefault(); onOpenContactSupport(); } }}>Contact Support</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p style={{ fontWeight: 600 }}>2026 @nation-market hub reserved</p>
                </div>
            </div>
        </footer>
    );
};
