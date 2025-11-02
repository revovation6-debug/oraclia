import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, NotificationContext, UIContext } from '../App';
import type { User, Client } from '../types';
import { UserRole } from '../types';
import { mockApi } from '../services/mockData';
import { Button, Input, Modal } from './UI';

const LoginModal: React.FC = () => {
    const { login } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);
    const { isLoginModalOpen, closeLoginModal, openForgotPasswordModal, switchToRegister } = useContext(UIContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showResend, setShowResend] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowResend(false);
        try {
            const user = await mockApi.login(username, password) as User;
            login(user);
            closeLoginModal();
            if (user.role === UserRole.ADMIN) navigate('/admin');
            else if (user.role === UserRole.AGENT) navigate('/agent');
            else navigate('/');
        } catch (err: any) {
            if (err.code === 'NOT_VERIFIED') {
                setError('Votre compte n\'est pas vérifié. Veuillez cliquer sur le lien dans votre e-mail d\'inscription.');
                setShowResend(true);
            } else {
                setError('Nom d\'utilisateur ou mot de passe incorrect.');
            }
        }
    };
    
    const handleResend = () => {
        addNotification('Un nouveau lien de vérification a été envoyé (simulation).');
        console.log(`Lien de vérification (pour la démo) : /#/verify/${username}`);
    }


    return (
        <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal} title="Connexion">
            <form onSubmit={handleLogin} className="space-y-4">
                <Input id="username" label="Nom d'utilisateur" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                <Input id="password" label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <div className="text-right">
                    <button type="button" onClick={() => { closeLoginModal(); openForgotPasswordModal(); }} className="text-sm text-brand-text-light dark:text-dark-text-secondary hover:text-brand-primary hover:underline">
                        Mot de passe oublié ?
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {showResend && (
                    <Button type="button" variant="ghost" className="text-sm !text-brand-primary hover:underline w-full" onClick={handleResend}>
                        Renvoyer le lien de vérification
                    </Button>
                )}
                <Button type="submit" variant="secondary" className="w-full">Se connecter</Button>
                <p className="text-center text-sm text-brand-text-light dark:text-dark-text-secondary pt-2">
                    Pas encore de compte ?{' '}
                    <button type="button" onClick={switchToRegister} className="font-semibold text-brand-primary hover:underline focus:outline-none">
                        S'inscrire
                    </button>
                </p>
            </form>
        </Modal>
    );
};

const ForgotPasswordModal: React.FC = () => {
    const { isForgotPasswordModalOpen, closeForgotPasswordModal } = useContext(UIContext);
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    useEffect(() => {
        if (isForgotPasswordModalOpen) {
            setEmail('');
            setIsSuccess(false);
        }
    }, [isForgotPasswordModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await mockApi.requestPasswordReset(email);
        setIsSuccess(true);
    };

    return (
        <Modal isOpen={isForgotPasswordModalOpen} onClose={closeForgotPasswordModal} title="Réinitialiser le mot de passe">
             {isSuccess ? (
                 <div className="text-center py-4">
                    <h3 className="text-xl font-bold text-green-500">Demande envoyée</h3>
                    <p className="mt-2 text-brand-text-light dark:text-dark-text-secondary">Si un compte est associé à cette adresse e-mail, vous recevrez un lien pour réinitialiser votre mot de passe.</p>
                    <Button onClick={closeForgotPasswordModal} variant="secondary" className="mt-6 w-full">Fermer</Button>
                </div>
            ) : (
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-brand-text-light dark:text-dark-text-secondary">Veuillez entrer l'adresse e-mail de votre compte. Nous vous enverrons les instructions pour réinitialiser votre mot de passe.</p>
                    <Input id="reset-email" label="Adresse e-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Button type="submit" variant="secondary" className="w-full">Envoyer le lien</Button>
                </form>
            )}
        </Modal>
    );
};

const RegisterModal: React.FC = () => {
    const { isRegisterModalOpen, closeRegisterModal, switchToLogin } = useContext(UIContext);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gender, setGender] = useState<Client['gender']>('prefer_not_to_say');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
    });
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const isPasswordStrong = Object.values(passwordStrength).every(Boolean);

    useEffect(() => {
        setPasswordStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    }, [password]);
    
    useEffect(() => {
        if (isRegisterModalOpen) {
            setEmail('');
            setUsername('');
            setPassword('');
            setFullName('');
            setDateOfBirth('');
            setPhoneNumber('');
            setGender('prefer_not_to_say');
            setError('');
            setIsSuccess(false);
            setIsPasswordFocused(false);
        }
    }, [isRegisterModalOpen]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isPasswordStrong) {
            setError('Veuillez utiliser un mot de passe qui respecte tous les critères de sécurité.');
            return;
        }

        // In a real app, you would get the user's IP from the server.
        // For this demo, we'll simulate it with a hardcoded value.
        // Try registering once, it will work. Try again, it will be blocked.
        const mockUserIp = '203.0.113.42';

        try {
            await mockApi.registerClient({ email, username, fullName, dateOfBirth, phoneNumber, gender }, mockUserIp);
            setIsSuccess(true);
        // FIX: The error "Cannot find name 'err'" suggests the variable in the catch block was misnamed or the scope was broken.
        // Unifying the variable name to `err` and ensuring it's used correctly within the block fixes the issue.
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        }
    };
    
    const PasswordRequirement: React.FC<{met: boolean, children: React.ReactNode}> = ({ met, children }) => (
        <p className={`transition-colors ${met ? 'text-green-500' : 'text-brand-text-light dark:text-dark-text-secondary'}`}>
            <span className="inline-block w-4">{met ? '✓' : '•'}</span> {children}
        </p>
    );

    return (
        <Modal isOpen={isRegisterModalOpen} onClose={closeRegisterModal} title="Inscription">
             {isSuccess ? (
                 <div className="text-center py-4">
                    <h3 className="text-xl font-bold text-green-500">Inscription presque terminée !</h3>
                    <p className="mt-2 text-brand-text-light dark:text-dark-text-secondary">Votre compte a été crédité de 5 minutes gratuites. Veuillez consulter votre boîte de réception pour vérifier votre adresse e-mail avant de vous connecter.</p>
                     <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">(Pour les besoins de cette démo, cliquez sur le lien ci-dessous pour vérifier votre compte.)</p>
                    <a 
                        href={`/#/verify/${username}`} 
                        className="mt-2 inline-block text-brand-primary hover:underline font-bold"
                        onClick={closeRegisterModal}
                    >
                        Vérifier mon compte maintenant
                    </a>
                    <Button onClick={closeRegisterModal} variant="secondary" className="mt-6 w-full">Fermer</Button>
                </div>
            ) : (
                 <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="reg-fullName" label="Nom complet" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                        <Input id="reg-username" label="Nom d'utilisateur" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <Input id="reg-email" label="Adresse e-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="reg-phoneNumber" label="N° de téléphone" type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
                        <Input id="reg-dateOfBirth" label="Date de naissance" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
                    </div>
                     <div>
                        <label htmlFor="reg-gender" className="block text-sm font-medium text-brand-text-dark dark:text-dark-text-primary mb-1">Genre</label>
                        <select 
                            id="reg-gender"
                            name="gender"
                            value={gender}
                            onChange={e => setGender(e.target.value as Client['gender'])}
                            className="w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary placeholder-brand-text-light focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            required
                        >
                             <option value="prefer_not_to_say">Ne pas spécifier</option>
                             <option value="male">Homme</option>
                             <option value="female">Femme</option>
                             <option value="other">Autre</option>
                         </select>
                    </div>
                    <div>
                        <Input 
                            id="reg-password" 
                            label="Mot de passe" 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            required 
                        />
                        {isPasswordFocused && (
                            <div className="mt-2 text-xs space-y-1">
                                <PasswordRequirement met={passwordStrength.length}>Au moins 8 caractères</PasswordRequirement>
                                <PasswordRequirement met={passwordStrength.uppercase}>Une lettre majuscule</PasswordRequirement>
                                <PasswordRequirement met={passwordStrength.lowercase}>Une lettre minuscule</PasswordRequirement>
                                <PasswordRequirement met={passwordStrength.number}>Un chiffre</PasswordRequirement>
                                <PasswordRequirement met={passwordStrength.special}>Un caractère spécial (!@#...)</PasswordRequirement>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" variant="secondary" className="w-full" disabled={!isPasswordStrong}>Créer mon compte</Button>
                    <p className="text-center text-sm text-brand-text-light dark:text-dark-text-secondary pt-2">
                        Déjà un compte ?{' '}
                        <button type="button" onClick={switchToLogin} className="font-semibold text-brand-primary hover:underline focus:outline-none">
                            Se connecter
                        </button>
                    </p>
                </form>
            )}
        </Modal>
    );
};


export const AuthModals: React.FC = () => {
    return (
        <>
            <LoginModal />
            <RegisterModal />
            <ForgotPasswordModal />
        </>
    );
};