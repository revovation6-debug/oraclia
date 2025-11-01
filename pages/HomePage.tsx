
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import type { PsychicProfile, Review, User, MinutePack } from '../types';
import { UserRole } from '../types';
import { mockApi } from '../services/mockData';
import { StarIcon, ChevronDownIcon } from '../components/Icons';
import { Button, Card, Input, Modal } from '../components/UI';

const Header: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  return (
    <>
      <header className="bg-brand-gray/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <a href="/#" className="text-3xl font-bold font-serif text-brand-gold">Oraclia</a>
            <nav className="hidden md:flex items-center space-x-6 text-gray-200">
              <a href="/#/experts" className="hover:text-brand-gold transition">Tous les experts</a>
              <a href="/#/avis" className="hover:text-brand-gold transition">Avis</a>
              <a href="/#/horoscope" className="hover:text-brand-gold transition">Horoscope</a>
            </nav>
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="relative group">
                    <button className="flex items-center space-x-2 bg-brand-purple-light px-3 py-2 rounded-lg">
                        <span>{user.username}</span>
                        <ChevronDownIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-brand-light-gray rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a href={user.role === UserRole.CLIENT ? "/#/dashboard" : user.role === UserRole.AGENT ? "/#/agent" : "/#/admin"} className="block px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple">Mon Espace</a>
                        <button onClick={() => { logout(); navigate('/')}} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple">Déconnexion</button>
                    </div>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setLoginModalOpen(true)}>Se connecter</Button>
                  <Button variant="secondary" onClick={() => setRegisterModalOpen(true)}>Inscription</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setRegisterModalOpen(false)} />
    </>
  );
};

const LoginModal: React.FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const user = await mockApi.login(username, password) as User;
            login(user);
            onClose();
            if (user.role === UserRole.ADMIN) navigate('/admin');
            else if (user.role === UserRole.AGENT) navigate('/agent');
            else navigate('/dashboard');
        } catch (err) {
            setError('Nom d\'utilisateur ou mot de passe incorrect.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Connexion">
            <form onSubmit={handleLogin} className="space-y-4">
                <Input id="username" label="Nom d'utilisateur" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                <Input id="password" label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full">Se connecter</Button>
            </form>
        </Modal>
    );
};

const RegisterModal: React.FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    // In a real app, this would hit a registration endpoint.
    // Here we'll just log the user in as a new client for demo purposes.
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = { id: `${Math.floor(1000000 + Math.random() * 9000000)}`, username: 'NouveauInscrit', email:'new@test.com', role: UserRole.CLIENT, minutesBalance: 0 };
        login(newUser);
        onClose();
        navigate('/dashboard');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Inscription">
             <form onSubmit={handleRegister} className="space-y-4">
                <Input id="email" label="Adresse e-mail" type="email" required />
                <Input id="username" label="Nom d'utilisateur" type="text" required />
                <Input id="password" label="Mot de passe" type="password" required />
                <Button type="submit" className="w-full">Créer mon compte</Button>
            </form>
        </Modal>
    );
};


const ExpertCard: React.FC<{ expert: PsychicProfile }> = ({ expert }) => (
  <Card className="text-center transform hover:scale-105 transition-transform duration-300 flex flex-col">
    <div className="relative">
      <img src={expert.imageUrl} alt={expert.name} className="w-32 h-32 rounded-full mx-auto border-4 border-brand-gold" />
      <span className={`absolute bottom-2 right-12 block h-5 w-5 rounded-full ${expert.isOnline ? 'bg-green-500' : 'bg-red-500'} border-2 border-brand-light-gray ring-2 ring-opacity-50 ${expert.isOnline ? 'ring-green-400' : 'ring-red-400'}`}></span>
    </div>
    <h3 className="text-xl font-bold mt-4 text-white">{expert.name}</h3>
    <p className="text-brand-gold-light font-semibold">{expert.specialty}</p>
    <div className="flex justify-center items-center my-2 text-yellow-400">
      {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(expert.rating) ? 'text-brand-gold' : 'text-gray-500'}`} />)}
      <span className="ml-2 text-sm text-gray-300">({expert.reviewsCount} avis)</span>
    </div>
    <p className="text-gray-400 text-sm flex-grow mb-4">{expert.description}</p>
    <Button variant="secondary" className="mt-auto w-full" disabled={!expert.isOnline}>
      {expert.isOnline ? 'Discuter par Tchat' : 'Indisponible'}
    </Button>
  </Card>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <Card className="flex flex-col h-full">
        <div className="flex items-center mb-2">
            <div className="flex text-brand-gold">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-brand-gold' : 'text-gray-600'}`} />)}
            </div>
        </div>
        <p className="text-gray-300 italic flex-grow">"{review.text}"</p>
        <p className="text-right text-white font-semibold mt-4">- {review.author}</p>
    </Card>
);

const PricingCard: React.FC<{ pack: MinutePack }> = ({ pack }) => (
    <Card className="text-center border-2 border-brand-purple hover:border-brand-gold transition-colors duration-300 flex flex-col">
        <h3 className="text-5xl font-bold text-white font-serif">{pack.minutes}</h3>
        <p className="text-xl text-gray-300">minutes</p>
        <div className="my-6">
            <span className="text-4xl font-bold text-brand-gold">{pack.price}€</span>
        </div>
        <Button variant="primary" className="mt-auto w-full">Choisir ce pack</Button>
    </Card>
);

const Footer = () => (
    <footer className="bg-brand-gray border-t border-brand-light-gray mt-20">
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-xl font-bold font-serif text-brand-gold mb-4">Oraclia</h3>
                    <p className="text-gray-400">Votre avenir, révélé. Consultation de voyance par tchat avec les meilleurs experts.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-4">À propos</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-brand-gold">Qui sommes-nous ?</a></li>
                        <li><a href="#" className="hover:text-brand-gold">Recrutement</a></li>
                        <li><a href="#" className="hover:text-brand-gold">Presse</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-4">Aide</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-brand-gold">Contactez-nous</a></li>
                        <li><a href="#" className="hover:text-brand-gold">FAQ</a></li>
                        <li><a href="#" className="hover:text-brand-gold">Charte qualité</a></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-white mb-4">Légal</h4>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-brand-gold">Conditions Générales</a></li>
                        <li><a href="#" className="hover:text-brand-gold">Politique de confidentialité</a></li>
                        <li><a href="#" className="hover:text-brand-gold">Mentions légales</a></li>
                    </ul>
                </div>
            </div>
            <div className="text-center text-gray-500 mt-12 border-t border-brand-light-gray pt-8">
                &copy; {new Date().getFullYear()} Oraclia. Tous droits réservés.
            </div>
        </div>
    </footer>
);

const HomePage: React.FC = () => {
  const [psychics, setPsychics] = useState<PsychicProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [minutePacks, setMinutePacks] = useState<MinutePack[]>([]);

  useEffect(() => {
    mockApi.getPsychics().then(data => setPsychics(data as PsychicProfile[]));
    mockApi.getHomepageReviews().then(data => setReviews(data as Review[]));
    mockApi.getMinutePacks().then(data => setMinutePacks(data as MinutePack[]));
  }, []);

  return (
    <div className="bg-brand-gray min-h-screen font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-white text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
        <img src="https://picsum.photos/seed/galaxy/1920/1080" alt="Mystical background" className="absolute inset-0 w-full h-full object-cover"/>
        <div className="relative z-20">
          <h1 className="text-5xl md:text-7xl font-bold font-serif leading-tight">Des réponses à vos questions, <br/> <span className="text-brand-gold">instantanément</span>.</h1>
          <p className="mt-4 text-xl max-w-2xl mx-auto">Discutez en direct avec nos voyants et médiums certifiés pour éclairer votre chemin de vie.</p>
          <Button variant="primary" className="mt-8 text-lg px-8 py-4">Commencer une consultation</Button>
        </div>
      </section>

      {/* Experts Section */}
      <section id="experts" className="py-20 bg-brand-gray">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 font-serif text-white">Nos Experts à votre écoute</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {psychics.map(expert => <ExpertCard key={expert.id} expert={expert} />)}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
       <section id="pricing" className="py-20 bg-brand-purple-dark">
        <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-2 font-serif text-white">Rechargez votre compte</h2>
            <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">Choisissez un pack de minutes pour commencer à discuter avec nos experts. Simple, rapide et sécurisé.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {minutePacks.map(pack => <PricingCard key={pack.id} pack={pack} />)}
            </div>
        </div>
      </section>

      {/* Avis Section */}
      <section id="avis" className="py-20 bg-brand-gray">
          <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-12 font-serif text-white">Ils nous ont fait confiance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
              </div>
          </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
