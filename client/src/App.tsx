import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryList } from './components/CategoryList';
import { CategoryServicesModal } from './components/CategoryServicesModal';
import { ProviderSearch } from './components/ProviderSearch';
import { ProviderModal } from './components/ProviderModal';
import { ProviderRegisterModal } from './components/ProviderRegisterModal';
import { CustomerRegisterModal } from './components/CustomerRegisterModal';
import { LoginModal } from './components/LoginModal';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ProviderCTA } from './components/ProviderCTA';
import { Footer } from './components/Footer';
import type { Provider, Category } from './types';

export function App() {
    const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [modalMode, setModalMode] = useState<'profile' | 'enquiry'>('profile');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
    const [isCustomerRegisterModalOpen, setIsCustomerRegisterModalOpen] = useState<boolean>(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Provider Authentication State
    const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
    const [viewingDashboard, setViewingDashboard] = useState<boolean>(false);

    // Admin Authentication State
    const [currentAdmin, setCurrentAdmin] = useState<{ name: string; email: string; role: string } | null>(null);
    const [viewingAdminDashboard, setViewingAdminDashboard] = useState<boolean>(false);

    // Customer Authentication State
    const [currentCustomer, setCurrentCustomer] = useState<{ id: number; full_name: string; email: string; phone: string; location: string } | null>(null);
    const [viewingCustomerDashboard, setViewingCustomerDashboard] = useState<boolean>(false);

    // Reset Password URL Token state
    const [initialResetToken, setInitialResetToken] = useState<string | null>(null);

    // Session recovery and URL token handling on app mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const resetTokenFromUrl = params.get('reset_token');
        if (resetTokenFromUrl) {
            setInitialResetToken(resetTokenFromUrl);
            setIsLoginModalOpen(true);
        }

        const token = localStorage.getItem('auth_token');
        if (!token) return;

        fetch('http://localhost:5000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    if (data.role === 'admin') {
                        setCurrentAdmin(data.user);
                        setViewingAdminDashboard(true);
                    } else if (data.role === 'provider') {
                        setCurrentProvider(data.user);
                        setViewingDashboard(true);
                    } else if (data.role === 'customer') {
                        setCurrentCustomer(data.user);
                        setViewingCustomerDashboard(true);
                    }
                } else {
                    localStorage.removeItem('auth_token');
                }
            })
            .catch((err) => {
                console.error('Session restoration failed:', err);
            });
    }, []);

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

    const handleUnifiedLoginSuccess = (role: 'admin' | 'provider' | 'customer', user: any) => {
        if (role === 'admin') {
            setCurrentAdmin(user);
            setViewingAdminDashboard(true);
            setCurrentProvider(null);
            setViewingDashboard(false);
            setCurrentCustomer(null);
            setViewingCustomerDashboard(false);
        } else if (role === 'provider') {
            setCurrentProvider(user);
            setViewingDashboard(true);
            setCurrentAdmin(null);
            setViewingAdminDashboard(false);
            setCurrentCustomer(null);
            setViewingCustomerDashboard(false);
        } else if (role === 'customer') {
            setCurrentCustomer(user);
            setViewingCustomerDashboard(true);
            setCurrentAdmin(null);
            setViewingAdminDashboard(false);
            setCurrentProvider(null);
            setViewingDashboard(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        setCurrentProvider(null);
        setViewingDashboard(false);
    };

    const handleAdminLogout = () => {
        localStorage.removeItem('auth_token');
        setCurrentAdmin(null);
        setViewingAdminDashboard(false);
    };

    const handleCustomerLogout = () => {
        localStorage.removeItem('auth_token');
        setCurrentCustomer(null);
        setViewingCustomerDashboard(false);
    };

    return (
        <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header
                currentProvider={currentProvider}
                viewingDashboard={viewingDashboard}
                onToggleDashboard={() => {
                    setViewingDashboard(!viewingDashboard);
                    setViewingAdminDashboard(false);
                    setViewingCustomerDashboard(false);
                }}
                currentAdmin={currentAdmin}
                viewingAdminDashboard={viewingAdminDashboard}
                onToggleAdminDashboard={() => {
                    setViewingAdminDashboard(!viewingAdminDashboard);
                    setViewingDashboard(false);
                    setViewingCustomerDashboard(false);
                }}
                currentCustomer={currentCustomer}
                viewingCustomerDashboard={viewingCustomerDashboard}
                onToggleCustomerDashboard={() => {
                    setViewingCustomerDashboard(!viewingCustomerDashboard);
                    setViewingDashboard(false);
                    setViewingAdminDashboard(false);
                }}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onLogout={handleLogout}
                onAdminLogout={handleAdminLogout}
                onCustomerLogout={handleCustomerLogout}
            />

            <main style={{ flex: 1 }}>
                {viewingAdminDashboard && currentAdmin ? (
                    <AdminDashboard admin={currentAdmin} onLogout={handleAdminLogout} />
                ) : viewingDashboard && currentProvider ? (
                    <ProviderDashboard provider={currentProvider} onLogout={handleLogout} />
                ) : viewingCustomerDashboard && currentCustomer ? (
                    <CustomerDashboard customer={currentCustomer} onLogout={handleCustomerLogout} />
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
                currentCustomer={currentCustomer}
                onClose={() => setActiveProvider(null)}
            />

            <ProviderRegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
            />

            <CustomerRegisterModal
                isOpen={isCustomerRegisterModalOpen}
                onClose={() => setIsCustomerRegisterModalOpen(false)}
                onRegisterSuccess={handleUnifiedLoginSuccess}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleUnifiedLoginSuccess}
                onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                onOpenCustomerRegisterModal={() => setIsCustomerRegisterModalOpen(true)}
                initialResetToken={initialResetToken}
            />
        </div>
    );
}

export default App;
