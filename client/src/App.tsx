import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryList } from './components/CategoryList';
import { CategoryServicesModal } from './components/CategoryServicesModal';
import { ProviderSearch } from './components/ProviderSearch';
import { ProviderModal } from './components/ProviderModal';
import { ProviderRegisterModal } from './components/ProviderRegisterModal';
import { ProviderCTA } from './components/ProviderCTA';
import { Footer } from './components/Footer';
import type { Provider, Category } from './types';

export function App() {
    const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalMode, setModalMode] = useState<'profile' | 'enquiry'>('profile');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleHeroSearch = (term: string) => {
        setSearchTerm(term);
        const searchElement = document.getElementById('providers-search');
        if (searchElement) {
            searchElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category);
    };

    const handleSelectSubService = (subServiceName: string) => {
        setSearchTerm(subServiceName);
        const searchElement = document.getElementById('providers-search');
        if (searchElement) {
            searchElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />
            <main style={{ flex: 1 }}>
                <Hero onSearch={handleHeroSearch} />
                
                <CategoryList onSelectCategory={handleSelectCategory} />

                <ProviderSearch
                    key={searchTerm}
                    initialSearchTerm={searchTerm}
                    onViewProfile={(provider) => {
                        setActiveProvider(provider);
                        setModalMode('profile');
                    }}
                    onMakeEnquiry={(provider) => {
                        setActiveProvider(provider);
                        setModalMode('enquiry');
                    }}
                />

                <ProviderCTA onOpenRegisterModal={() => setIsRegisterModalOpen(true)} />
            </main>

            <Footer />

            <CategoryServicesModal
                category={selectedCategory}
                onClose={() => setSelectedCategory(null)}
                onSelectSubService={handleSelectSubService}
            />

            <ProviderModal
                provider={activeProvider}
                initialMode={modalMode}
                onClose={() => setActiveProvider(null)}
            />

            <ProviderRegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
            />
        </div>
    );
}

export default App;
