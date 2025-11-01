
import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import type { Conversation, Message, PsychicProfile, MinutePack } from '../types';
import { mockApi } from '../services/mockData';
import { Button, Card, Input, Modal } from '../components/UI';
import { SendIcon, ClockIcon, XIcon } from '../components/Icons';

const ChatWindow: React.FC<{ conversation: Conversation, psychic: PsychicProfile, onEndChat: (minutesUsed: number) => void }> = ({ conversation, psychic, onEndChat }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState<Message[]>(conversation.messages);
    const [newMessage, setNewMessage] = useState('');
    const [minutesLeft, setMinutesLeft] = useState(user?.minutesBalance || 0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setMinutesLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleEndChat();
                    return 0;
                }
                return prev - (1/60);
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        const msgData: Omit<Message, 'id' | 'timestamp'> = { sender: 'CLIENT', text: newMessage };
        const sentMessage = await mockApi.sendMessage(conversation.id, msgData) as Message;
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');

        // Simulate agent response
        setTimeout(async () => {
            const agentMsgData: Omit<Message, 'id' | 'timestamp'> = { sender: 'AGENT', text: 'Je ressens une forte énergie autour de votre question...' };
            const agentMessage = await mockApi.sendMessage(conversation.id, agentMsgData) as Message;
            setMessages(prev => [...prev, agentMessage]);
        }, 1500);
    };

    const handleEndChat = () => {
        const totalMinutes = user?.minutesBalance || 0;
        const remainingMinutes = Math.floor(minutesLeft);
        const minutesUsed = totalMinutes - remainingMinutes;
        onEndChat(minutesUsed);
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl h-[90vh] flex flex-col bg-brand-gray">
                <div className="flex justify-between items-center p-4 border-b border-brand-light-gray">
                    <div className="flex items-center space-x-4">
                        <img src={psychic.imageUrl} alt={psychic.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <h2 className="text-xl font-bold text-white">{psychic.name}</h2>
                            <p className="text-sm text-green-400">En ligne</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center space-x-2 text-brand-gold">
                            <ClockIcon className="w-6 h-6"/>
                            <span className="text-xl font-mono">{formatTime(Math.floor(minutesLeft * 60))}</span>
                        </div>
                         <p className="text-xs text-gray-400">Temps restant</p>
                    </div>
                    <Button variant="secondary" onClick={handleEndChat}>Clôturer</Button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'CLIENT' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'CLIENT' ? 'bg-brand-purple-light text-white rounded-br-none' : 'bg-brand-light-gray text-gray-200 rounded-bl-none'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-brand-light-gray">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input type="text" placeholder="Écrivez votre message..." className="flex-grow" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <Button type="submit" className="!px-3"><SendIcon className="w-6 h-6"/></Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};


const ClientDashboard: React.FC = () => {
    const { user, logout, updateBalance } = useContext(AuthContext);
    const [activeChat, setActiveChat] = useState<{conversation: Conversation, psychic: PsychicProfile} | null>(null);
    const [psychics, setPsychics] = useState<PsychicProfile[]>([]);
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    
    useEffect(() => {
        mockApi.getPsychics().then(data => setPsychics(data as PsychicProfile[]));
    }, []);

    const handleStartChat = (psychic: PsychicProfile) => {
        if (!user || (user.minutesBalance || 0) < 1) {
            alert("Veuillez recharger votre compte pour commencer un tchat.");
            setPurchaseModalOpen(true);
            return;
        }
        const newConversation: Conversation = {
            id: `convo-${Date.now()}`,
            clientId: user.id,
            clientUsername: user.username,
            psychicId: psychic.id,
            psychicName: psychic.name,
            messages: [{id: 'start-msg', sender: 'AGENT', text: `Bonjour ${user.username}, comment puis-je vous aider aujourd'hui ?`, timestamp: Date.now() }],
            hasUnread: false,
        };
        setActiveChat({ conversation: newConversation, psychic });
    };
    
    const handleEndChat = (minutesUsed: number) => {
        const newBalance = (user?.minutesBalance || 0) - minutesUsed;
        updateBalance(newBalance < 0 ? 0 : newBalance);
        setActiveChat(null);
    };

    if (!user) return null;

    return (
        <div className="bg-brand-gray min-h-screen text-white">
             <header className="bg-brand-light-gray">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="/#" className="text-3xl font-bold font-serif text-brand-gold">Oraclia</a>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                           <p className="font-bold text-lg">{user.username}</p>
                           <p className="text-sm text-gray-300">ID: {user.id}</p>
                        </div>
                        <div className="text-center bg-brand-purple p-2 rounded-lg">
                           <p className="font-bold text-2xl text-brand-gold">{user.minutesBalance || 0}</p>
                           <p className="text-xs">Minutes restantes</p>
                        </div>
                        <Button onClick={() => setPurchaseModalOpen(true)}>Recharger</Button>
                        <Button variant="ghost" onClick={logout}>Déconnexion</Button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Nos experts disponibles</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {psychics.filter(p => p.isOnline).map(expert => (
                        <Card key={expert.id} className="text-center">
                             <img src={expert.imageUrl} alt={expert.name} className="w-24 h-24 rounded-full mx-auto border-2 border-brand-gold" />
                             <h3 className="text-xl font-bold mt-4">{expert.name}</h3>
                             <p className="text-brand-gold-light">{expert.specialty}</p>
                             <Button variant="secondary" className="mt-4 w-full" onClick={() => handleStartChat(expert)} disabled={!!activeChat}>
                                {activeChat ? 'Conversation en cours' : 'Commencer le tchat'}
                            </Button>
                        </Card>
                    ))}
                </div>
                 {psychics.filter(p => p.isOnline).length === 0 && <p className="text-center text-gray-400 py-12">Aucun expert n'est disponible pour le moment.</p>}
            </main>
            {activeChat && <ChatWindow conversation={activeChat.conversation} psychic={activeChat.psychic} onEndChat={handleEndChat} />}
            <PurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} />
        </div>
    );
};

const PurchaseModal: React.FC<{isOpen: boolean, onClose: () => void}> = ({isOpen, onClose}) => {
    const { user, updateBalance } = useContext(AuthContext);
    const [packs, setPacks] = useState<MinutePack[]>([]);
    const [selectedPack, setSelectedPack] = useState<MinutePack | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            mockApi.getMinutePacks().then(data => setPacks(data as MinutePack[]));
            setIsSuccess(false);
            setSelectedPack(null);
        }
    }, [isOpen]);

    const handlePurchase = async () => {
        if (!selectedPack || !user) return;
        setIsLoading(true);
        const result = await mockApi.purchaseMinutes(user.id, selectedPack.id) as { success: boolean; newBalance?: number };
        setIsLoading(false);
        if (result.success && result.newBalance) {
            updateBalance(result.newBalance);
            setIsSuccess(true);
            setTimeout(() => onClose(), 2000);
        } else {
            alert('Achat échoué');
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recharger votre compte">
            {isSuccess ? (
                <div className="text-center py-8">
                    <p className="text-2xl text-green-400 font-bold">Paiement réussi !</p>
                    <p className="text-gray-300 mt-2">Votre solde a été mis à jour.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-300">Sélectionnez un pack de minutes :</p>
                    <div className="space-y-3">
                        {packs.map(pack => (
                            <div key={pack.id} onClick={() => setSelectedPack(pack)} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPack?.id === pack.id ? 'border-brand-gold bg-brand-purple-dark' : 'border-brand-light-gray hover:border-brand-purple'}`}>
                                <p className="font-bold text-lg text-white">{pack.minutes} minutes</p>
                                <p className="text-brand-gold text-xl font-semibold">{pack.price}€</p>
                            </div>
                        ))}
                    </div>
                    {/* Mock Stripe element */}
                    <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-400">Informations de paiement (Simulation Stripe)</p>
                        <div className="mt-2 p-2 bg-black rounded">
                            <span className="text-green-400 font-mono">**** **** **** 4242</span>
                        </div>
                    </div>
                    <Button onClick={handlePurchase} disabled={!selectedPack || isLoading} className="w-full">
                        {isLoading ? 'Paiement en cours...' : `Payer ${selectedPack?.price || ''}€`}
                    </Button>
                </div>
            )}
        </Modal>
    );
}

export default ClientDashboard;
