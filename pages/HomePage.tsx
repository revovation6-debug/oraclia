import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, NotificationContext, UIContext, ThemeContext } from '../App';
import type { PsychicProfile, Review, User, MinutePack, Client } from '../types';
import { UserRole } from '../types';
import { mockApi } from '../services/mockData';
// FIX: Import missing MessageCircleIcon.
import { StarIcon, ChevronDownIcon, HeartIcon, UserIcon, MessageCircleIcon, UserClockIcon, ShieldCheckIcon, LockIcon, RoosterIcon, TreesIcon, SunIcon, MoonIcon } from '../components/Icons';
import { Button, Card } from '../components/UI';

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary hover:bg-gray-300 dark:hover:bg-dark-border"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
    );
};

export const Header: React.FC = () => {
  const { user, logout, login } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const { openPurchaseModal, openLoginModal, openRegisterModal } = useContext(UIContext);
  const navigate = useNavigate();

  const handleToggleFavorite = async (psychicId: string) => {
    if (user && user.role === UserRole.CLIENT) {
        await mockApi.toggleFavoritePsychic(user.id, psychicId);
        // We need to update the user in the context to reflect the change
        // FIX: Spread the original user object to preserve all its properties (like 'role')
        // and avoid unsafe casting from User to Client.
        const updatedUser = {
            ...user,
            favoritePsychicIds: user.favoritePsychicIds?.includes(psychicId)
                ? user.favoritePsychicIds?.filter(id => id !== psychicId)
                : [...(user.favoritePsychicIds || []), psychicId],
        };
        login(updatedUser);
        addNotification('Favoris mis à jour !');
    }
  };


  return (
    <header className="bg-brand-bg-white/80 dark:bg-dark-bg-secondary/80 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <a href="/#" className="flex items-center">
            <img src="https://raw.githubusercontent.com/revovation6-debug/oraclia/12bb2594b6d2df065d70f7ad11593f4197e2e2d0/logo-oraclia2.png" alt="Oraclia Logo" className="h-20 w-auto" />
          </a>
          <nav className="hidden md:flex items-center space-x-6 text-brand-text-dark dark:text-dark-text-primary">
            <div className="relative group">
              <a href="/#/experts" className="hover:text-brand-primary transition flex items-center space-x-1 py-2">
                  <span>Tous les experts</span>
                  <ChevronDownIcon className="w-4 h-4" />
              </a>
              <div className="absolute left-0 mt-0 w-48 bg-brand-bg-white dark:bg-dark-bg-secondary rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <a href="/#/experts?specialty=Astrologie" className="block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Astrologie</a>
                  <a href="/#/experts?specialty=Tarot" className="block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Tarologie</a>
                  <a href="/#/experts?specialty=Conseil%20Couple" className="block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Conseil Couple</a>
                  <a href="/#/experts?specialty=Clairvoyance" className="block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Médiumnité</a>
              </div>
            </div>
            <a href="/#/avis" className="hover:text-brand-primary transition">Avis</a>
            <a href="/#/horoscope" className="hover:text-brand-primary transition">Horoscope</a>
          </nav>
          <div className="flex items-center space-x-2">
            {user && user.role === UserRole.CLIENT ? (
               <div className="flex items-center space-x-4">
                  <div className="relative group">
                      <button className="flex items-center space-x-2">
                         <span className="bg-brand-primary-light w-8 h-8 rounded-full flex items-center justify-center text-white"><UserIcon className="w-5 h-5"/></span>
                         <span className="text-brand-text-dark dark:text-dark-text-primary">{user.username}</span>
                         <ChevronDownIcon className="w-4 h-4 text-brand-text-dark dark:text-dark-text-primary" />
                      </button>
                       <div className="absolute right-0 mt-2 w-48 bg-brand-bg-white dark:bg-dark-bg-secondary rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <a href="/#/dashboard" className="block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Mon Compte</a>
                          <button onClick={() => { logout(); navigate('/')}} className="w-full text-left block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Déconnexion</button>
                      </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-bg-primary p-1 rounded-lg">
                      <div className="flex items-center space-x-3 text-xs font-semibold px-2">
                          <div className="text-center">
                              <span className="text-brand-secondary block font-bold text-sm">{user.freeMinutesBalance || 0}</span>
                              <span className="text-gray-500 dark:text-dark-text-secondary block">OFFERTES</span>
                          </div>
                          <div className="border-l border-gray-300 dark:border-dark-border h-6"></div>
                          <div className="text-center">
                              <span className="text-green-500 block font-bold text-sm">{user.paidMinutesBalance || 0}</span>
                              <span className="text-gray-500 dark:text-dark-text-secondary block">PAYÉES</span>
                          </div>
                      </div>
                      <button onClick={openPurchaseModal} className="bg-brand-primary hover:bg-brand-primary-light text-white font-bold text-xs px-3 py-1.5 rounded-md transition-colors">CRÉDITER +</button>
                  </div>
                   <a href="/#/dashboard" title="Favoris" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg-primary"><HeartIcon className="w-6 h-6 text-brand-text-dark dark:text-dark-text-primary"/></a>
                   <a href="/#/dashboard" className="bg-gray-800/5 dark:bg-white/5 hover:bg-gray-800/10 dark:hover:bg-white/10 text-brand-text-dark dark:text-dark-text-primary font-semibold text-sm px-4 py-2 rounded-md transition-colors flex items-center space-x-2">
                      <MessageCircleIcon className="w-4 h-4"/><span>MESSAGES</span>
                   </a>
              </div>
            ) : user ? (
               <div className="relative group">
                  <button className="flex items-center space-x-2 bg-brand-primary-light px-3 py-2 rounded-lg text-white">
                      <span>{user.username}</span>
                      <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-brand-bg-white dark:bg-dark-bg-secondary rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <a href={user.role === UserRole.ADMIN ? "/#/admin" : "/#/agent"} className="block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Mon Espace</a>
                      <button onClick={() => { logout(); navigate('/')}} className="w-full text-left block px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">Déconnexion</button>
                  </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={openLoginModal}>Se connecter</Button>
                <Button variant="secondary" onClick={openRegisterModal}>Inscription</Button>
              </>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};


export const ExpertCard: React.FC<{ expert: PsychicProfile, onToggleFavorite?: (psychicId: string) => void, isFavorite?: boolean, animationClasses?: string, onChatClick: (expert: PsychicProfile) => void }> = ({ expert, onToggleFavorite, isFavorite, animationClasses, onChatClick }) => (
  <Card className={`text-center transform hover:scale-105 transition-transform duration-300 flex flex-col bg-brand-bg-white dark:bg-dark-bg-secondary ${animationClasses}`}>
    <div className="relative">
      <img src={expert.imageUrl} alt={expert.name} className="w-32 h-32 rounded-full mx-auto border-4 border-brand-primary" />
      <span className={`absolute bottom-2 right-12 block h-5 w-5 rounded-full ${expert.isOnline ? 'bg-green-500' : 'bg-red-500'} border-2 border-brand-bg-white dark:border-dark-bg-secondary ring-2 ring-opacity-50 ${expert.isOnline ? 'ring-green-400' : 'ring-red-400'}`}></span>
       {onToggleFavorite && (
         <button onClick={() => onToggleFavorite(expert.id)} className="absolute top-0 right-4 bg-gray-100/50 dark:bg-dark-bg-primary/50 p-2 rounded-full backdrop-blur-sm hover:bg-brand-primary-light/80" aria-label="Ajouter aux favoris">
            <HeartIcon className={`w-6 h-6 transition-colors ${isFavorite ? 'text-brand-secondary fill-current' : 'text-gray-600 dark:text-dark-text-secondary'}`} />
        </button>
       )}
    </div>
    <h3 className="text-xl font-bold mt-4 text-brand-text-dark dark:text-dark-text-primary">{expert.name}</h3>
    <p className="text-brand-primary font-semibold">{expert.specialty}</p>
    <div className="flex justify-center items-center my-2">
      {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(expert.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />)}
      <span className="ml-2 text-sm text-brand-text-light dark:text-dark-text-secondary">({expert.reviewsCount} avis)</span>
    </div>
    <p className="text-brand-text-light dark:text-dark-text-secondary text-sm flex-grow mb-4">{expert.description}</p>
    <Button variant="secondary" className="mt-auto w-full" disabled={!expert.isOnline} onClick={() => onChatClick(expert)}>
      {expert.isOnline ? 'Discuter par Tchat' : 'Indisponible'}
    </Button>
  </Card>
);

export const ReviewCard: React.FC<{ review: Review, animationClasses?: string }> = ({ review, animationClasses }) => (
    <Card className={`flex flex-col h-full bg-brand-bg-white dark:bg-dark-bg-secondary ${animationClasses}`}>
        <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />)}
            </div>
        </div>
        <p className="text-brand-text-light dark:text-dark-text-secondary italic flex-grow">"{review.text}"</p>
        <p className="text-right text-brand-text-dark dark:text-dark-text-primary font-semibold mt-4">- {review.author}</p>
    </Card>
);

const PricingCard: React.FC<{ pack: MinutePack, animationClasses?: string }> = ({ pack, animationClasses }) => {
    const { openPurchaseModal } = useContext(UIContext);
    return (
        <Card className={`text-center border-2 border-transparent hover:border-brand-primary transition-colors duration-300 flex flex-col bg-brand-bg-white dark:bg-dark-bg-secondary ${animationClasses}`}>
            <h3 className="text-5xl font-bold text-brand-text-dark dark:text-dark-text-primary font-serif">{pack.minutes}</h3>
            <p className="text-xl text-brand-text-light dark:text-dark-text-secondary">minutes</p>
            <div className="my-6">
                <span className="text-4xl font-bold text-brand-secondary">{pack.price.toFixed(2)}€</span>
            </div>
            <Button variant="secondary" className="mt-auto w-full" onClick={openPurchaseModal}>Choisir ce pack</Button>
        </Card>
    );
};




export const Footer = () => (
    <footer className="bg-brand-bg-white dark:bg-dark-bg-secondary border-t border-gray-200 dark:border-dark-border mt-20">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <img src="https://raw.githubusercontent.com/revovation6-debug/oraclia/12bb2594b6d2df065d70f7ad11593f4197e2e2d0/logo-oraclia2.png" alt="Oraclia Logo" className="h-16 w-auto mb-4" />
                    <p className="text-brand-text-light dark:text-dark-text-secondary">Votre avenir, révélé. Consultation de voyance par tchat avec les meilleurs experts.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-brand-text-dark dark:text-dark-text-primary mb-4">À propos</h4>
                    <ul className="space-y-2 text-brand-text-light dark:text-dark-text-secondary">
                        <li><a href="/#/about" className="hover:text-brand-primary">Qui sommes-nous ?</a></li>
                        <li><a href="/#/recruitment" className="hover:text-brand-primary">Recrutement</a></li>
                        <li><a href="/#/press" className="hover:text-brand-primary">Presse</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-brand-text-dark dark:text-dark-text-primary mb-4">Aide</h4>
                    <ul className="space-y-2 text-brand-text-light dark:text-dark-text-secondary">
                        <li><a href="/#/contact" className="hover:text-brand-primary">Contactez-nous</a></li>
                        <li><a href="/#/faq" className="hover:text-brand-primary">FAQ</a></li>
                        <li><a href="/#/quality" className="hover:text-brand-primary">Charte qualité</a></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-brand-text-dark dark:text-dark-text-primary mb-4">Légal</h4>
                    <ul className="space-y-2 text-brand-text-light dark:text-dark-text-secondary">
                        <li><a href="/#/terms" className="hover:text-brand-primary">Conditions Générales</a></li>
                        <li><a href="/#/privacy" className="hover:text-brand-primary">Politique de confidentialité</a></li>
                        <li><a href="/#/legal" className="hover:text-brand-primary">Mentions légales</a></li>
                    </ul>
                </div>
            </div>
            <div className="flex justify-between items-center text-gray-400 dark:text-gray-500 mt-12 border-t border-gray-200 dark:border-dark-border pt-8">
                <span>&copy; {new Date().getFullYear()} Oraclia. Tous droits réservés.</span>
            </div>
        </div>
    </footer>
);

const TrustBadges = () => {
    const badges = [
        { icon: <UserClockIcon className="w-10 h-10 text-brand-primary"/>, text: "Experts dispos 24/7" },
        { icon: <ShieldCheckIcon className="w-10 h-10 text-brand-secondary"/>, text: "Anonymat protégé" },
        { icon: <LockIcon className="w-10 h-10 text-green-500"/>, text: "Transactions sécurisées" },
        { 
            icon: (
                <div className="h-10 flex items-center space-x-0.5 text-yellow-400">
                    <StarIcon className="w-5 h-5"/><StarIcon className="w-5 h-5"/><StarIcon className="w-5 h-5"/><StarIcon className="w-5 h-5"/><StarIcon className="w-5 h-5"/>
                </div>
            ), 
            text: "Commentaires 100% réels" 
        },
        { icon: <img src="https://vertical-laccessoire.com/img/cms/made-in-france-min.png" alt="Made in France" className="w-10 h-10 object-contain" />, text: "Experts made in France" },
    ];

    return (
        <section className="py-20 bg-brand-bg-accent dark:bg-dark-bg-secondary">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16 font-serif text-brand-primary scroll-animate">Pourquoi nous faire confiance ?</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
                    {badges.map((badge, index) => (
                        <div key={index} className={`flex flex-col items-center scroll-animate delay-${index * 100}`}>
                            <div className="mb-4 h-12 flex items-center justify-center">
                                {badge.icon}
                            </div>
                            <p className="font-semibold text-brand-text-dark dark:text-dark-text-primary text-sm md:text-base">{badge.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const HomePage: React.FC = () => {
  const [psychics, setPsychics] = useState<PsychicProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [minutePacks, setMinutePacks] = useState<MinutePack[]>([]);
  const { user, login } = useContext(AuthContext);
  const { addNotification } = useContext(NotificationContext);
  const { openRegisterModal } = useContext(UIContext);
  const navigate = useNavigate();

  useEffect(() => {
    mockApi.getPsychics().then(data => setPsychics(data as PsychicProfile[]));
    mockApi.getHomepageReviews().then(data => setReviews(data as Review[]));
    mockApi.getMinutePacks().then(data => setMinutePacks(data as MinutePack[]));
  }, []);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach(el => {
        observer.observe(el);
    });

    return () => observer.disconnect();
  }, [psychics, reviews, minutePacks]); // Re-run when data changes to observe new elements

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

  const handleStartConsultation = () => {
    if (user) {
      const expertsSection = document.getElementById('experts');
      if (expertsSection) {
        expertsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      openRegisterModal();
    }
  };
  
  const handleChatClick = (_expert: PsychicProfile) => {
    if (user && user.role === UserRole.CLIENT) {
      navigate('/dashboard');
    } else {
      openRegisterModal();
    }
  };


  return (
    <div className="bg-brand-bg-light dark:bg-dark-bg-primary min-h-screen font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-brand-text-dark dark:text-dark-text-primary text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg-light dark:from-dark-bg-primary via-transparent z-10"></div>
        <img src="https://picsum.photos/seed/galaxy/1920/1080" alt="Mystical background" className="absolute inset-0 w-full h-full object-cover dark:opacity-60"/>
        <div className="relative z-20 animate-pop-in">
          <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight">Des réponses à vos questions, <br/> <span className="text-brand-primary">instantanément</span>.</h1>
          <p className="mt-4 text-xl max-w-2xl mx-auto">Discutez en direct avec nos voyants et médiums certifiés pour éclairer votre chemin de vie.</p>
          
          {/* Welcome Bonus Offer */}
          <div className="mt-6 bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary-light rounded-lg p-3 inline-block shadow-lg backdrop-blur-sm max-w-xl">
            <p className="text-lg font-semibold text-brand-text-dark dark:text-dark-text-primary">
              <span className="font-bold text-brand-primary">✨ Offre de Bienvenue :</span> 5 minutes de tchat offertes à l'inscription !
            </p>
          </div>

          <Button variant="secondary" onClick={handleStartConsultation} className="mt-8 text-lg px-8 py-4">Commencer une consultation</Button>
        </div>
      </section>

      {/* Experts Section */}
      <section id="experts" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 font-serif text-brand-text-dark dark:text-dark-text-primary scroll-animate">Nos Experts à votre écoute</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {psychics.slice(0, 4).map((expert, index) => (
                <ExpertCard 
                    key={expert.id} 
                    expert={expert}
                    onChatClick={handleChatClick}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={user?.role === UserRole.CLIENT && user.favoritePsychicIds?.includes(expert.id)}
                    animationClasses={`scroll-animate delay-${(index % 4) * 100}`}
                />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
       <section id="pricing" className="py-20 bg-brand-bg-accent dark:bg-dark-bg-secondary">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-2 font-serif text-brand-text-dark dark:text-dark-text-primary scroll-animate">Rechargez votre compte</h2>
            <p className="text-center text-brand-text-light dark:text-dark-text-secondary mb-12 max-w-2xl mx-auto scroll-animate delay-100">Choisissez un pack de minutes pour commencer à discuter avec nos experts. Simple, rapide et sécurisé.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {minutePacks.map((pack, index) => <PricingCard key={pack.id} pack={pack} animationClasses={`scroll-animate delay-${100 * (index + 1)}`} />)}
            </div>
        </div>
      </section>

      {/* Avis Section */}
      <section id="avis" className="py-20">
          <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-12 font-serif text-brand-text-dark dark:text-dark-text-primary scroll-animate">Ils nous ont fait confiance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {reviews.map((review, index) => <ReviewCard key={review.id} review={review} animationClasses={`scroll-animate delay-${(index % 4) * 100}`} />)}
              </div>
          </div>
      </section>
      
      <TrustBadges />

      <Footer />
    </div>
  );
};

export default HomePage;