import React, { useEffect, useState } from 'react';
import type { Category } from '../types';
import { 
    Wrench, Laptop, BookOpen, Scissors, Utensils, 
    Car, Briefcase, Heart, ArrowUpRight, Loader2, AlertCircle 
} from 'lucide-react';

// Icon mapper for dynamic category icons
const iconMap: Record<string, React.ReactNode> = {
    Wrench: <Wrench size={24} />,
    Laptop: <Laptop size={24} />,
    BookOpen: <BookOpen size={24} />,
    Scissors: <Scissors size={24} />,
    Utensils: <Utensils size={24} />,
    Car: <Car size={24} />,
    Briefcase: <Briefcase size={24} />,
    Heart: <Heart size={24} />,
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
        <section id="categories" className="categories-section">
            <div className="container">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">Explore Categories</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                            Find verified skilled professionals across 8 core service categories
                        </p>
                    </div>
                </div>

                <div className="categories-grid">
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="glass-panel category-card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onSelectCategory && onSelectCategory(cat)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="category-icon-wrapper">
                                    {iconMap[cat.icon] || <Wrench size={24} />}
                                </div>
                                <ArrowUpRight size={18} style={{ color: '#64748b' }} />
                            </div>

                            <h3 className="category-name">{cat.name}</h3>
                            <p className="category-desc">{cat.description}</p>

                            <div className="category-meta">
                                <span>{cat.service_count || 0} sub-services available</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
