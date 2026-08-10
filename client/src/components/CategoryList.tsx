import React, { useEffect, useState } from 'react';
import type { Category } from '../types';
import { 
    Wrench, Monitor, GraduationCap, Sparkles, ChefHat, 
    Car, Briefcase, Activity, ArrowUpRight, Loader2, AlertCircle 
} from 'lucide-react';

// Maps the old database string icon identifiers to the new aesthetic look
const categoryStyles: Record<string, { bg: string, color: string, Icon: React.ElementType }> = {
    'Wrench': { bg: '#ffedd5', color: '#ea580c', Icon: Wrench },
    'Laptop': { bg: '#e0e7ff', color: '#4f46e5', Icon: Monitor },
    'BookOpen': { bg: '#e0f2fe', color: '#0284c7', Icon: GraduationCap },
    'Scissors': { bg: '#fce7f3', color: '#db2777', Icon: Sparkles },
    'Utensils': { bg: '#dcfce7', color: '#15803d', Icon: ChefHat },
    'Car': { bg: '#ecfccb', color: '#4d7c0f', Icon: Car },
    'Briefcase': { bg: '#fef3c7', color: '#d97706', Icon: Briefcase },
    'Heart': { bg: '#f3e8ff', color: '#9333ea', Icon: Activity },
};

interface CategoryListProps {
    onSelectCategory?: (category: Category) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {
                    setCategories(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch categories');
                }
            } catch (err: any) {
                console.error('Failed to load categories:', err);
                setError(err.message || 'Could not connect to database backend');
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
                <Loader2 className="animate-spin" size={32} style={{ color: '#38bdf8', margin: '0 auto 1rem' }} />
                <p style={{ color: '#94a3b8' }}>Loading live marketplace categories from database...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '2rem 0' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(239, 68, 68, 0.4)', textAlign: 'center' }}>
                    <AlertCircle size={32} style={{ color: '#f87171', margin: '0 auto 0.5rem' }} />
                    <p style={{ color: '#f87171', fontWeight: 600 }}>Backend Connection Issue</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{error}</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                        Make sure Node.js server is running via <code style={{ color: '#38bdf8' }}>npm start</code> at port 5000.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <section id="categories" style={{ padding: '4rem 0', background: '#f8fafc' }}>
            <div className="container">
                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Explore Categories</h2>
                    <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
                        Find verified skilled professionals across 8 core service categories
                    </p>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '1.25rem' 
                }}>
                    {categories.map((cat) => {
                        const styleConfig = categoryStyles[cat.icon] || categoryStyles['Wrench'];
                        const IconComp = styleConfig.Icon;

                        return (
                            <div
                                key={cat.id}
                                style={{ 
                                    background: '#ffffff', 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '16px', 
                                    padding: '1.75rem', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
                                    transition: 'all 0.2s ease-in-out',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 20px -8px rgba(0, 0, 0, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02)';
                                }}
                                onClick={() => onSelectCategory && onSelectCategory(cat)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        background: styleConfig.bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: styleConfig.color
                                    }}>
                                        <IconComp size={32} strokeWidth={1.5} />
                                    </div>
                                    <div style={{ 
                                        width: '28px', height: '28px', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                        color: '#64748b' 
                                    }}>
                                        <ArrowUpRight size={20} strokeWidth={2} />
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>
                                    {cat.name}
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: '1.5rem' }}>
                                    {cat.description}
                                </p>

                                <div>
                                    <span style={{ 
                                        color: '#2563eb', 
                                        fontSize: '0.85rem', 
                                        fontWeight: 600 
                                    }}>
                                        {cat.service_count || 0} sub-services available
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
