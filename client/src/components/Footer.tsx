import React from 'react';
import { Store, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <a href="/" className="logo">
                            <Store size={24} style={{ color: '#38bdf8' }} />
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
                            <li><a href="#categories">Home & Repairs</a></li>
                            <li><a href="#categories">Technology</a></li>
                            <li><a href="#categories">Education</a></li>
                            <li><a href="#categories">Beauty & Personal Care</a></li>
                            <li><a href="#categories">Transport & Auto</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Platform</h4>
                        <ul>
                            <li><a href="#categories">Browse Services</a></li>
                            <li><a href="#provider-signup">Become a Provider</a></li>
                            <li><a href="#how-it-works">How it Works</a></li>
                            <li><a href="#pricing">Pricing & Fees</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Support & Legal</h4>
                        <ul>
                            <li><a href="#help">Help & FAQs</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#contact">Contact Support</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Nation Market Hub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
