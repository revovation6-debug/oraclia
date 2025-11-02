import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockApi } from '../services/mockData';
import { Card, Button } from '../components/UI';
import { Header, Footer } from './HomePage';

const VerificationPage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!username) {
            setStatus('error');
            setErrorMessage('Aucun utilisateur spécifié pour la vérification.');
            return;
        }

        const verifyAccount = async () => {
            try {
                await mockApi.verifyClient(username);
                setStatus('success');
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.message || 'Une erreur de vérification est survenue.');
            }
        };

        // Add a small delay for demo purposes to show the loading state
        const timer = setTimeout(() => {
            verifyAccount();
        }, 1000);
        
        return () => clearTimeout(timer);

    }, [username]);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return <p className="text-xl text-brand-text-light dark:text-dark-text-secondary">Vérification de votre compte en cours...</p>;
            case 'success':
                return (
                    <>
                        <h2 className="text-3xl font-bold text-green-500 mb-4">Compte vérifié !</h2>
                        <p className="text-brand-text-dark dark:text-dark-text-primary">Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter et commencer votre voyage avec Oraclia.</p>
                        <Link to="/">
                           <Button variant="secondary" className="mt-6">Se connecter</Button>
                        </Link>
                    </>
                );
            case 'error':
                 return (
                    <>
                        <h2 className="text-3xl font-bold text-red-500 mb-4">Échec de la vérification</h2>
                        <p className="text-brand-text-light dark:text-dark-text-secondary">{errorMessage}</p>
                         <Link to="/">
                           <Button variant="primary" className="mt-6">Retourner à l'accueil</Button>
                        </Link>
                    </>
                );
        }
    };

    return (
        <div className="bg-brand-bg-light dark:bg-dark-bg-primary min-h-screen font-sans flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-24 flex justify-center items-center">
                <Card className="text-center max-w-2xl w-full p-8 md:p-12">
                    {renderContent()}
                </Card>
            </main>
            <Footer />
        </div>
    );
};

export default VerificationPage;