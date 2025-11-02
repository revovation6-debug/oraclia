import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, UIContext } from '../App';
import type { MinutePack } from '../types';
import { mockApi } from '../services/mockData';
import { XIcon, CheckCircleIcon } from './Icons';

export const PurchaseModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, updateBalances } = useContext(AuthContext);
    const { openLoginModal } = useContext(UIContext);
    const [packs, setPacks] = useState<MinutePack[]>([]);
    const [selectedPackId, setSelectedPackId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            mockApi.getMinutePacks().then(data => {
                const packsData = data as MinutePack[];
                setPacks(packsData);
                // Pre-select the popular pack
                const popularPack = packsData.find(p => p.popular);
                if (popularPack) {
                    setSelectedPackId(popularPack.id);
                }
            });
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handlePurchase = async () => {
        if (!user) {
            onClose();
            openLoginModal();
            return;
        }

        if (!selectedPackId) return;
        setIsLoading(true);
        // Simulate payment processing
        const result = await mockApi.purchaseMinutes(user.id, selectedPackId) as { success: boolean; newPaidBalance?: number, newFreeBalance?: number };
        setIsLoading(false);
        if (result.success && result.newPaidBalance !== undefined && result.newFreeBalance !== undefined) {
            updateBalances({ paid: result.newPaidBalance, free: result.newFreeBalance });
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            alert('Achat échoué');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 font-sans" onClick={onClose}>
            <div className="bg-brand-bg-white dark:bg-dark-bg-secondary rounded-lg shadow-2xl w-full max-w-lg m-4 transform transition-all text-brand-text-dark dark:text-dark-text-primary relative animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="text-center py-4 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-2xl font-bold font-serif text-brand-primary">Oraclia</h2>
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-brand-text-dark dark:hover:text-dark-text-primary">
                    <XIcon className="w-6 h-6" />
                </button>

                {isSuccess ? (
                    <div className="text-center p-12">
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-2xl text-green-500 font-bold">Paiement réussi !</p>
                        <p className="text-brand-text-light dark:text-dark-text-secondary mt-2">Votre solde a été mis à jour.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-brand-primary text-white flex">
                            <div className="w-1/2 text-center py-3 font-bold border-b-4 border-white">MA RECHARGE</div>
                            <div className="w-1/2 text-center py-3 font-bold opacity-70">PAIEMENT</div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold">Créditer mon compte</h3>
                            <p className="text-brand-text-light dark:text-dark-text-secondary text-sm mt-1">Crédit actuel : <span className="font-bold">{user?.paidMinutesBalance || 0} min payées / {user?.freeMinutesBalance || 0} min offertes</span></p>

                            <div className="grid grid-cols-3 gap-4 my-6">
                                {packs.map(pack => (
                                    <div 
                                        key={pack.id} 
                                        onClick={() => setSelectedPackId(pack.id)} 
                                        className={`relative rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ${selectedPackId === pack.id ? 'ring-2 ring-brand-primary' : ''} ${pack.popular ? 'bg-brand-secondary' : 'bg-gray-100 dark:bg-dark-bg-primary'}`}
                                    >
                                        {pack.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white dark:bg-dark-bg-secondary text-brand-secondary text-xs font-bold px-2 py-0.5 rounded-full shadow">
                                                La + populaire
                                            </div>
                                        )}
                                        <h4 className={`text-3xl font-bold ${pack.popular ? 'text-white' : 'text-brand-text-dark dark:text-dark-text-primary'}`}>{pack.price.toFixed(2)}€</h4>
                                        <p className={`${pack.popular ? 'text-red-100' : 'text-brand-text-light dark:text-dark-text-secondary'}`}>{pack.minutes} minutes</p>
                                        <div className="absolute bottom-2 right-2 w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all" style={{borderColor: pack.popular ? 'white' : '#ccc'}}>
                                            {selectedPackId === pack.id && <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: pack.popular ? 'white' : '#6C63FF'}}></div>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handlePurchase} disabled={!selectedPackId || isLoading} className="w-full bg-brand-primary hover:bg-brand-primary-light text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50">
                                {isLoading ? 'Paiement en cours...' : 'VALIDER MA SÉLECTION'}
                            </button>

                            <div className="flex justify-center items-center mt-6">
                                <img src="https://raw.githubusercontent.com/revovation6-debug/oraclia/9b6dfb236d2727303701af7c14941848bad05230/stripe-paiement-1.png" alt="Paiement 100% sécurisé par Stripe" className="w-full max-w-xs" />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};