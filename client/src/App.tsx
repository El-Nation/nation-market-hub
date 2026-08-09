import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryList } from './components/CategoryList';
import { CategoryServicesModal } from './components/CategoryServicesModal';
import { ProviderSearch } from './components/ProviderSearch';
import { ProviderModal } from './components/ProviderModal';
import { ProviderRegisterModal } from './components/ProviderRegisterModal';
import { ProviderLoginModal } from './components/ProviderLoginModal';
import { ProviderDashboard } from './components/ProviderDashboard';
import { ProviderCTA } from './components/ProviderCTA';
import { Footer } from './components/Footer';
import type { Provider, Category } from './types';

export function App() {
    const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalMode, setModalMode] = useState<'profile' | 'enquiry'>('profile');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Provider Authentication State
    const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
    const [viewingDashboard, setViewingDashboard] = useState<boolean>(false);

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

    const handleLoginSuccess = (provider: Provider) => {
        setCurrentProvider(provider);
        setViewingDashboard(true);
    };

    const handleLogout = () => {
        setCurrentProvider(null);
        setViewingDashboard(false);
    };

    return (
        <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header
                currentProvider={currentProvider}
                viewingDashboard={viewingDashboard}
                onToggleDashboard={() => setViewingDashboard(!viewingDashboard)}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onLogout={handleLogout}
            />

            <main style={{ flex: 1 }}>
                {viewingDashboard && currentProvider ? (
                    <ProviderDashboard provider={currentProvider} onLogout={handleLogout} />
                ) : (
                    <>
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
                    </>
                )}
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

            <ProviderLoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            />
        </div>
    );
}

export default App;
