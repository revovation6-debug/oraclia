import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { mockApi } from '../services/mockData';
import type { PsychicProfile, Client } from '../types';
import { UserRole } from '../types';
import { Header, Footer, ExpertCard } from './HomePage';
import { Button } from '../components/UI';
import { AuthContext, NotificationContext, UIContext } from '../App';

const ExpertsPage: React.FC = () => {
  const [psychics, setPsychics] = useState<PsychicProfile[]>([]);
  const [filter, setFilter] = useState('all'); // 'all', 'online'
  const { user, login } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const { openRegisterModal } = useContext(UIContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getPsychics().then(data => setPsychics(data as PsychicProfile[]));
  }, []);
  
  const handleToggleFavorite = async (psychicId: string) => {
    if (user && user.role === UserRole.CLIENT) {
        await mockApi.toggleFavoritePsychic(user.id, psychicId);
        // FIX: Spread the original user object to preserve all its properties (like 'role')
        // and avoid unsafe casting from User to Client.
        const newFavorites = user.favoritePsychicIds?.includes(psychicId)
            ? user.favoritePsychicIds.filter(id => id !== psychicId)
            : [...(user.favoritePsychicIds || []), psychicId];

        const updatedUser = { ...user, favoritePsychicIds: newFavorites };
        login(updatedUser); // This updates the user context
        addNotification('Favoris mis à jour !');
    } else {
        addNotification('Veuillez vous connecter pour gérer vos favoris.', 'warning');
    }
  };

  const handleChatClick = (_expert: PsychicProfile) => {
    if (user && user.role === UserRole.CLIENT) {
      navigate('/dashboard');
    } else {
      openRegisterModal();
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const specialtyFilter = queryParams.get('specialty');


  const filteredPsychics = psychics.filter(p => {
    const onlineMatch = filter === 'online' ? p.isOnline : true;
    const specialtyMatch = specialtyFilter ? p.specialty === specialtyFilter : true;
    return onlineMatch && specialtyMatch;
  });

  const pageTitle = specialtyFilter ? `Nos experts en ${specialtyFilter}` : "Découvrez Tous Nos Experts";
  const pageDescription = specialtyFilter 
    ? `Trouvez le guide parfait parmi nos spécialistes en ${specialtyFilter.toLowerCase()}.`
    : `Parcourez les profils de nos talentueux voyants. Qu'ils soient disponibles pour une consultation immédiate ou momentanément absents, trouvez le guide spirituel qui vous correspond.`;


  return (
    <div className="bg-brand-bg-light dark:bg-dark-bg-primary min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 font-serif text-brand-text-dark dark:text-dark-text-primary">{pageTitle}</h1>
        <p className="text-center text-brand-text-light dark:text-dark-text-secondary mb-12 max-w-3xl mx-auto text-lg">
          {pageDescription}
        </p>
        <div className="flex justify-center space-x-4 mb-10">
            <Button variant={filter === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilter('all')}>Voir Tous</Button>
            <Button variant={filter === 'online' ? 'secondary' : 'ghost'} onClick={() => setFilter('online')}>En Ligne Uniquement</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {filteredPsychics.map(expert => (
                <ExpertCard 
                    key={expert.id} 
                    expert={expert} 
                    onChatClick={handleChatClick}
                    onToggleFavorite={handleToggleFavorite}
                    // FIX: Remove unsafe casting from User to Client.
                    isFavorite={user?.role === UserRole.CLIENT && user.favoritePsychicIds?.includes(expert.id)}
                />
            ))}
        </div>
         {filteredPsychics.length === 0 && (
            <div className="text-center py-16 text-brand-text-light dark:text-dark-text-secondary">
                <p>Aucun expert ne correspond à vos filtres.</p>
            </div>
         )}
      </main>
      <Footer />
    </div>
  );
};

export default ExpertsPage;