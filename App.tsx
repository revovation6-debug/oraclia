
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User, Notification } from './types';
import { UserRole } from './types';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ExpertsPage from './pages/ExpertsPage';
import ReviewsPage from './pages/ReviewsPage';
import HoroscopePage from './pages/HoroscopePage';
import VerificationPage from './pages/VerificationPage';
import PlaceholderPage from './pages/footer/PlaceholderPage';
import { NotificationContainer } from './components/Notifications';
import { PurchaseModal } from './components/PurchaseModal';
import { AuthModals } from './components/AuthModals';

export const AuthContext = React.createContext<{
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateBalances: (balances: { paid: number; free: number }) => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  updateBalances: () => {},
});

export const NotificationContext = React.createContext<{
    addNotification: (message: string, type?: 'info' | 'warning') => void;
}>({
    addNotification: () => {},
});

export const UIContext = React.createContext<{
  isPurchaseModalOpen: boolean;
  openPurchaseModal: () => void;
  closePurchaseModal: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isRegisterModalOpen: boolean;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  isForgotPasswordModalOpen: boolean;
  openForgotPasswordModal: () => void;
  closeForgotPasswordModal: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
}>({
  isPurchaseModalOpen: false,
  openPurchaseModal: () => {},
  closePurchaseModal: () => {},
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
  isRegisterModalOpen: false,
  openRegisterModal: () => {},
  closeRegisterModal: () => {},
  isForgotPasswordModalOpen: false,
  openForgotPasswordModal: () => {},
  closeForgotPasswordModal: () => {},
  switchToRegister: () => {},
  switchToLogin: () => {},
});

export const ThemeContext = React.createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('oraclia_theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('oraclia_theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Simulate checking for a logged-in user in localStorage
    const storedUser = localStorage.getItem('oraclia_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('oraclia_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('oraclia_user');
    setUser(null);
  };
  
  const updateBalances = (balances: { paid: number; free: number }) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { 
            ...prevUser, 
            paidMinutesBalance: balances.paid,
            freeMinutesBalance: balances.free 
        };
        localStorage.setItem('oraclia_user', JSON.stringify(updatedUser));
        return updatedUser;
    });
  };

  const addNotification = (message: string, type: 'info' | 'warning' = 'info') => {
      const newNotification: Notification = {
          id: Date.now(),
          message,
          type,
      };
      setNotifications(prev => [...prev, newNotification]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
  };
  
  const openPurchaseModal = () => setPurchaseModalOpen(true);
  const closePurchaseModal = () => setPurchaseModalOpen(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const openRegisterModal = () => setRegisterModalOpen(true);
  const closeRegisterModal = () => setRegisterModalOpen(false);

  const openForgotPasswordModal = () => setForgotPasswordModalOpen(true);
  const closeForgotPasswordModal = () => setForgotPasswordModalOpen(false);

  const switchToRegister = () => {
    closeLoginModal();
    openRegisterModal();
  };

  const switchToLogin = () => {
    closeRegisterModal();
    openLoginModal();
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-brand-bg-light dark:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary">Chargement...</div>;
  }
  
  const uiContextValue = {
      isPurchaseModalOpen, openPurchaseModal, closePurchaseModal,
      isLoginModalOpen, openLoginModal, closeLoginModal,
      isRegisterModalOpen, openRegisterModal, closeRegisterModal,
      isForgotPasswordModalOpen, openForgotPasswordModal, closeForgotPasswordModal,
      switchToRegister, switchToLogin
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, updateBalances }}>
      <NotificationContext.Provider value={{ addNotification }}>
        <UIContext.Provider value={uiContextValue}>
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <HashRouter>
              <NotificationContainer notifications={notifications} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/experts" element={<ExpertsPage />} />
                <Route path="/avis" element={<ReviewsPage />} />
                <Route path="/horoscope" element={<HoroscopePage />} />
                <Route path="/verify/:username" element={<VerificationPage />} />
                <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} />
                <Route path="/agent" element={user?.role === UserRole.AGENT ? <AgentDashboard /> : <Navigate to="/" />} />
                <Route path="/dashboard" element={user?.role === UserRole.CLIENT ? <ClientDashboard /> : <Navigate to="/" />} />
                
                {/* Footer Pages */}
                <Route path="/about" element={<PlaceholderPage title="Qui sommes-nous ?"><p>Oraclia est la première plateforme de voyance en ligne, connectant des individus en quête de clarté avec des conseillers spirituels de confiance. Notre mission est de fournir des consultations authentiques et éclairantes dans un environnement sécurisé et bienveillant.</p></PlaceholderPage>} />
                <Route path="/recruitment" element={<PlaceholderPage title="Recrutement"><p>Nous sommes toujours à la recherche de conseillers talentueux et éthiques pour rejoindre notre équipe. Si vous avez un don et souhaitez aider les autres, consultez nos offres d'emploi.</p></PlaceholderPage>} />
                <Route path="/press" element={<PlaceholderPage title="Presse"><p>Pour toute demande de presse, interviews ou informations sur Oraclia, veuillez contacter notre service de communication.</p></PlaceholderPage>} />
                <Route path="/contact" element={<PlaceholderPage title="Contactez-nous"><p>Notre service client est disponible pour répondre à toutes vos questions. Contactez-nous par email à support@oraclia.com ou via notre formulaire de contact.</p></PlaceholderPage>} />
                <Route path="/faq" element={<PlaceholderPage title="FAQ"><p>Trouvez des réponses aux questions les plus frequently posées sur nos services, le fonctionnement du tchat, la facturation et la gestion de votre compte.</p></PlaceholderPage>} />
                <Route path="/quality" element={<PlaceholderPage title="Charte Qualité"><p>Oraclia s'engage sur une charte de qualité stricte, garantissant le professionnalisme, l'éthique et la confidentialité de chaque consultation.</p></PlaceholderPage>} />
                <Route path="/terms" element={<PlaceholderPage title="Conditions Générales"><p>Veuillez lire attentivement nos conditions générales d'utilisation qui régissent l'utilisation de la plateforme Oraclia.</p></PlaceholderPage>} />
                <Route path="/privacy" element={<PlaceholderPage title="Politique de Confidentialité"><p>Votre vie privée est notre priorité. Consultez notre politique pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles.</p></PlaceholderPage>} />
                <Route path="/legal" element={<PlaceholderPage title="Mentions Légales"><p>Informations légales concernant l'éditeur du site Oraclia, l'hébergement et la propriété intellectuelle.</p></PlaceholderPage>} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
              <PurchaseModal isOpen={isPurchaseModalOpen} onClose={closePurchaseModal} />
              <AuthModals />
            </HashRouter>
          </ThemeContext.Provider>
        </UIContext.Provider>
      </NotificationContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;