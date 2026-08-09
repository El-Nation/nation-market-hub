import React, { useEffect, useState } from 'react';
import type { Category, Service } from '../types';
import { X, Loader2, AlertCircle, Search, ArrowRight, Layers } from 'lucide-react';

interface CategoryServicesModalProps {
    category: Category | null;
    onClose: () => void;
    onSelectSubService: (serviceName: string) => void;
}

export const CategoryServicesModal: React.FC<CategoryServicesModalProps> = ({ category, onClose, onSelectSubService }) => {
    if (!category) return null;

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState<string>('');

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:5000/api/categories/${category.slug}/services`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    setServices(data.data.services || []);
                } else {
                    throw new Error(data.message || 'Failed to load category services');
                }
            })
            .catch((err: any) => {
                console.error('Error loading category sub-services:', err);
                setError(err.message || 'Unable to fetch sub-services');
            })
            .finally(() => setLoading(false));
    }, [category]);

    const filteredServices = services.filter(
        (s) =>
            s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            (s.description && s.description.toLowerCase().includes(searchFilter.toLowerCase()))
    );

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', background: '#ffffff', border: '1px solid #cbd5e1', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', color: '#475569', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <X size={18} />
                </button>

                {/* Modal Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <Layers size={16} />
                        Category Sub-Services
                    </div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                        {category.name}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.925rem', marginTop: '0.25rem' }}>
                        {category.description || 'Browse specialized services available under this category.'}
                    </p>
                </div>

                {/* Search Filter input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '1.5rem' }}>
                    <Search size={18} style={{ color: '#0284c7' }} />
                    <input
                        type="text"
                        placeholder={`Filter sub-services in ${category.name}...`}
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#0f172a', outline: 'none', fontSize: '0.9rem' }}
                    />
                </div>

                {/* Services Content Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <Loader2 className="animate-spin" size={32} style={{ color: '#0284c7', margin: '0 auto 1rem' }} />
                        <p style={{ color: '#64748b' }}>Loading sub-services for {category.name}...</p>
                    </div>
                ) : error ? (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                        <AlertCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                        <p>{error}</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No services matching "{searchFilter}" under {category.name}.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {filteredServices.map((srv) => (
                            <div
                                key={srv.id}
                                className="glass-panel"
                                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}
                            >
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{srv.name}</h4>
                                <p style={{ fontSize: '0.875rem', color: '#475569', flex: 1, lineHeight: 1.4 }}>
                                    {srv.description || `Verified ${srv.name} professionals ready for booking.`}
                                </p>
                                <button
                                    className="btn-primary"
                                    style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                                    onClick={() => {
                                        onSelectSubService(srv.name);
                                        onClose();
                                    }}
                                >
                                    Find {srv.name} Providers
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
