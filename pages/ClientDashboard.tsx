import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext, NotificationContext, UIContext } from '../App';
import type { Conversation, Message, PsychicProfile, PaymentHistoryItem, Client, User } from '../types';
import { mockApi, MOCK_CONVERSATIONS } from '../services/mockData';
import { Button, Card, Input } from '../components/UI';
import { SendIcon, ClockIcon, XIcon, SmileIcon, MicIcon, UserIcon, MessageSquareIcon, CreditCardIcon, HeartIcon } from '../components/Icons';
import { playNotificationSound } from '../utils';
import { EmojiPicker } from '../components/EmojiPicker';
import { Header, Footer, ExpertCard } from './HomePage';

// FIX: Define a minimal interface for the SpeechRecognition API to provide type safety
// for this non-standard browser feature.
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type ChatUsage = {
    paidMinutes: number;
    freeMinutes: number;
};

const ChatWindow: React.FC<{
  conversation: Conversation;
  psychic: PsychicProfile;
  onClose: (usage: ChatUsage) => void;
  isReadOnly?: boolean;
  initialPaidMinutes: number;
  initialFreeMinutes: number;
}> = ({ conversation, psychic, onClose, isReadOnly = false, initialPaidMinutes, initialFreeMinutes }) => {
    const { addNotification } = useContext(NotificationContext);
    
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const savedMessages = localStorage.getItem(`oraclia_chat_${conversation.id}`);
            return savedMessages ? JSON.parse(savedMessages) : conversation.messages;
        } catch (error) {
            console.error("Failed to parse messages from localStorage", error);
            return conversation.messages;
        }
    });

    const [newMessage, setNewMessage] = useState('');
    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // FIX: The return type of setInterval in the browser is `number`, not `NodeJS.Timeout`.
    const timerIdRef = useRef<number | null>(null);
    const chatStartTimeRef = useRef(Date.now());
    const initialFreeSecondsRef = useRef(initialFreeMinutes * 60);
    const initialTotalSecondsRef = useRef((initialPaidMinutes + initialFreeMinutes) * 60);

    const [secondsLeft, setSecondsLeft] = useState(initialTotalSecondsRef.current);
    const [timerColor, setTimerColor] = useState('text-brand-secondary');
    const [lowBalanceNotified, setLowBalanceNotified] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const stopTimerAndEndChat = useCallback(() => {
        if (timerIdRef.current) {
            // FIX: Use window.clearInterval to ensure the browser's implementation is used, which expects a number.
            window.clearInterval(timerIdRef.current);
            timerIdRef.current = null;
            
            const elapsedSeconds = Math.floor((Date.now() - chatStartTimeRef.current) / 1000);
            const totalSecondsUsed = Math.min(elapsedSeconds, initialTotalSecondsRef.current);

            const freeSecondsUsed = Math.min(totalSecondsUsed, initialFreeSecondsRef.current);
            const paidSecondsUsed = totalSecondsUsed - freeSecondsUsed;

            const usage: ChatUsage = {
                freeMinutes: Math.ceil(freeSecondsUsed / 60),
                paidMinutes: Math.ceil(paidSecondsUsed / 60),
            };
            
            onClose(usage);
        }
    }, [onClose]);

    // Speech Recognition Logic
    // FIX: Use `(window as any)` to access non-standard browser APIs and rename the constructor
    // to avoid collision with the `SpeechRecognition` type interface.
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const hasRecognitionSupport = !!SpeechRecognitionAPI;
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!hasRecognitionSupport) return;
        
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'fr-FR';

        recognition.onresult = (event) => {
            let final_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                }
            }
            if (final_transcript) {
                setNewMessage(prev => (prev.trim() + ' ' + final_transcript.trim()).trim());
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event) => {
            if (event.error !== 'no-speech') {
                console.error('Speech recognition error:', event.error);
                addNotification('Erreur de reconnaissance vocale.', 'warning');
            }
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        
        return () => {
            recognitionRef.current?.abort();
        };
    }, [hasRecognitionSupport, addNotification]);

    const toggleListening = () => {
        if (!hasRecognitionSupport) {
            addNotification("La reconnaissance vocale n'est pas supportée par votre navigateur.", 'warning');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    recognitionRef.current?.start();
                    setIsListening(true);
                })
                .catch(err => {
                    console.error("Microphone access denied.", err);
                    addNotification("L'accès au microphone est requis pour la transcription vocale.", 'warning');
                });
        }
    };
    // End Speech Recognition Logic

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setEmojiPickerOpen(false);
        inputRef.current?.focus();
    };


    useEffect(() => {
        try {
            localStorage.setItem(`oraclia_chat_${conversation.id}`, JSON.stringify(messages));
        } catch (error) {
            console.error("Failed to save messages to localStorage", error);
        }
    }, [messages, conversation.id]);

    useEffect(() => {
        const handleNewMessage = (newMessage: Message) => {
            if (newMessage.sender === 'AGENT') {
                playNotificationSound(); // Always play sound
                if (document.hidden) {
                    addNotification(`Nouveau message de ${psychic.name}`);
                }
            }
            setMessages(prevMessages => {
                if (prevMessages.some(msg => msg.id === newMessage.id)) {
                    return prevMessages;
                }
                return [...prevMessages, newMessage];
            });
        };
        mockApi.subscribeToConversation(conversation.id, handleNewMessage);
        
        return () => {
            mockApi.unsubscribeFromConversation(conversation.id, handleNewMessage);
        };
    }, [conversation.id, psychic.name, addNotification]);

    useEffect(() => {
        if (isReadOnly) return;

        // FIX: Use window.setInterval to get a `number` return type, matching the ref's type, instead of NodeJS.Timeout.
        timerIdRef.current = window.setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - chatStartTimeRef.current) / 1000);
            const remaining = initialTotalSecondsRef.current - elapsedSeconds;

            if (remaining <= 0) {
                setSecondsLeft(0);
                stopTimerAndEndChat();
            } else {
                setSecondsLeft(remaining);
                setTimerColor(remaining > initialTotalSecondsRef.current - initialFreeSecondsRef.current ? 'text-brand-secondary' : 'text-green-500');

                if (remaining <= 60 && !lowBalanceNotified) {
                    addNotification('Moins d\'une minute restante !', 'warning');
                    setLowBalanceNotified(true);
                }
            }
        }, 1000);

        return () => {
            // FIX: Use window.clearInterval to match the use of window.setInterval.
            if (timerIdRef.current) window.clearInterval(timerIdRef.current);
        };
    }, [isReadOnly, stopTimerAndEndChat, lowBalanceNotified, addNotification]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || isReadOnly || secondsLeft <= 0) return;
        const msgData: Omit<Message, 'id' | 'timestamp'> = { sender: 'CLIENT', text: newMessage };
        await mockApi.sendMessage(conversation.id, msgData);
        setNewMessage('');
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl h-[90vh] flex flex-col bg-brand-bg-white dark:bg-dark-bg-secondary !p-0">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border">
                    <div className="flex items-center space-x-4">
                        <img src={psychic.imageUrl} alt={psychic.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <h2 className="text-xl font-bold text-brand-text-dark dark:text-dark-text-primary">{psychic.name}</h2>
                             <p className={`text-sm ${isReadOnly ? 'text-brand-text-light dark:text-dark-text-secondary' : 'text-green-500'}`}>{isReadOnly ? 'Conversation archivée' : 'En ligne'}</p>
                        </div>
                    </div>
                    {!isReadOnly && (
                        <div className="text-center">
                            <div className={`flex items-center space-x-2 ${timerColor}`}>
                                <ClockIcon className="w-6 h-6"/>
                                <span className="text-xl font-mono">{formatTime(secondsLeft)}</span>
                            </div>
                            <p className="text-xs text-brand-text-light dark:text-dark-text-secondary">Temps restant</p>
                        </div>
                    )}
                    {isReadOnly ? (
                        <Button variant="ghost" onClick={() => onClose({paidMinutes: 0, freeMinutes: 0})}>Fermer</Button>
                    ) : (
                        <Button variant="primary" onClick={stopTimerAndEndChat}>Clôturer</Button>
                    )}
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-brand-bg-light dark:bg-dark-bg-primary">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'CLIENT' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'CLIENT' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-bg-white dark:bg-dark-bg-secondary text-brand-text-dark dark:text-dark-text-primary rounded-bl-none shadow-sm'}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                     <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                             {isEmojiPickerOpen && <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setEmojiPickerOpen(false)} />}
                            <Input 
                                ref={inputRef}
                                type="text" 
                                placeholder={isReadOnly ? "Ceci est un aperçu en lecture seule." : secondsLeft > 0 ? "Écrivez votre message..." : "Le temps est écoulé."} 
                                className="!pr-24"
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                                disabled={isReadOnly || secondsLeft <= 0}
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                                <button type="button" onClick={() => setEmojiPickerOpen(o => !o)} disabled={isReadOnly || secondsLeft <= 0} className="text-gray-400 dark:text-dark-text-secondary hover:text-brand-text-dark dark:hover:text-dark-text-primary disabled:opacity-50">
                                    <SmileIcon className="w-6 h-6" />
                                </button>
                                <button type="button" onClick={toggleListening} disabled={isReadOnly || secondsLeft <= 0 || !hasRecognitionSupport} className={`text-gray-400 dark:text-dark-text-secondary hover:text-brand-text-dark dark:hover:text-dark-text-primary disabled:opacity-50 ${isListening ? 'text-red-500 animate-pulse' : ''}`}>
                                    <MicIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <Button type="submit" variant="secondary" className="!px-3" disabled={isReadOnly || secondsLeft <= 0 || newMessage.trim() === ''}><SendIcon className="w-6 h-6"/></Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};


type DashboardSection = 'home' | 'profile' | 'consultations' | 'payments' | 'favorites';

const ClientDashboard: React.FC = () => {
    const { user, logout, updateBalances, login } = useContext(AuthContext);
    const { openPurchaseModal } = useContext(UIContext);
    const [activeChat, setActiveChat] = useState<{ conversation: Conversation; psychic: PsychicProfile; } | null>(null);
    const [viewingPastChat, setViewingPastChat] = useState<{conversation: Conversation, psychic: PsychicProfile} | null>(null);
    const [psychics, setPsychics] = useState<PsychicProfile[]>([]);
    const [pastConversations, setPastConversations] = useState<Conversation[]>([]);
    const [activeSection, setActiveSection] = useState<DashboardSection>('home');
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
    const { addNotification } = useContext(NotificationContext);
    
    // FIX: Use a non-null assertion `!`. The component is route-protected, so `user` is guaranteed to be a Client user here.
    const clientUser = user!;

    useEffect(() => {
        mockApi.getPsychics().then(data => setPsychics(data as PsychicProfile[]));
        if (user?.id) {
            mockApi.getClientConversations(user.id).then(data => setPastConversations(data as Conversation[]));
            mockApi.getClientPaymentHistory(user.id).then(data => setPaymentHistory(data as PaymentHistoryItem[]));
        }
    }, [user?.id]);
    
    const handleStartChat = (psychic: PsychicProfile) => {
        if (viewingPastChat || !user) return;
        const totalBalance = (user.paidMinutesBalance || 0) + (user.freeMinutesBalance || 0);

        if (totalBalance < 1) {
            openPurchaseModal();
            return;
        }

        let conversation = MOCK_CONVERSATIONS.find(c => c.clientId === user.id && c.psychicId === psychic.id);

        if (!conversation) {
            conversation = {
                id: `convo-${user.id}-${psychic.id}-${Date.now()}`,
                clientId: user.id,
                clientUsername: user.username,
                psychicId: psychic.id,
                psychicName: psychic.name,
                messages: [{id: 'start-msg', sender: 'AGENT', text: `Bonjour ${user.username}, comment puis-je vous aider aujourd'hui ?`, timestamp: Date.now() }],
                hasUnread: true,
            };
            MOCK_CONVERSATIONS.push(conversation);
        }

        setActiveChat({ conversation, psychic });
    };
    
    const handleEndChat = (usage: ChatUsage) => {
        const currentPaid = user?.paidMinutesBalance || 0;
        const currentFree = user?.freeMinutesBalance || 0;

        const newPaidBalance = Math.max(0, currentPaid - usage.paidMinutes);
        const newFreeBalance = Math.max(0, currentFree - usage.freeMinutes);

        updateBalances({ paid: newPaidBalance, free: newFreeBalance });
        
        if (activeChat) {
           mockApi.logChatSession(activeChat.psychic.agentId, usage.paidMinutes, usage.freeMinutes);
        }

        setActiveChat(null);

        if (user?.id) { // Refresh past chats
            mockApi.getClientConversations(user.id).then(data => setPastConversations(data as Conversation[]));
        }
    };
    
    const handleToggleFavorite = async (psychicId: string) => {
        if (user) {
            await mockApi.toggleFavoritePsychic(user.id, psychicId);
            const newFavorites = clientUser.favoritePsychicIds?.includes(psychicId)
                ? clientUser.favoritePsychicIds.filter(id => id !== psychicId)
                : [...(clientUser.favoritePsychicIds || []), psychicId];
            const updatedUser = { ...clientUser, favoritePsychicIds: newFavorites };
            login(updatedUser);
            addNotification('Favoris mis à jour !');
        }
    };

    const NavItem: React.FC<{ section: DashboardSection; icon: React.ReactNode; children: React.ReactNode }> = ({ section, icon, children }) => (
        <button
            onClick={() => setActiveSection(section)}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${activeSection === section ? 'bg-brand-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary'}`}
        >
            {icon}
            <span>{children}</span>
        </button>
    );

    if (!user) return null;
    
    const renderSection = () => {
        switch(activeSection) {
            case 'profile':
                return <ProfileSection client={clientUser as Client} />;
            case 'consultations':
                return <ConsultationsSection conversations={pastConversations} psychics={psychics} onViewChat={(c, p) => setViewingPastChat({conversation: c, psychic: p})} />;
            case 'payments':
                return <PaymentsSection history={paymentHistory} />;
            case 'favorites':
                return <FavoritesSection psychics={psychics} favoriteIds={clientUser.favoritePsychicIds || []} onToggleFavorite={handleToggleFavorite} onChatClick={handleStartChat} />;
            case 'home':
            default:
                return <HomeSection psychics={psychics} onChatClick={handleStartChat} disabled={!!activeChat || !!viewingPastChat} onToggleFavorite={handleToggleFavorite} favoriteIds={clientUser.favoritePsychicIds || []}/>;
        }
    };

    return (
        <div className="bg-brand-bg-light dark:bg-dark-bg-primary min-h-screen text-brand-text-dark dark:text-dark-text-primary font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-1/4 lg:w-1/5">
                        <Card className="p-4 space-y-2">
                           <NavItem section="home" icon={<MessageSquareIcon className="w-5 h-5" />}>Accueil & Consultation</NavItem>
                           <NavItem section="profile" icon={<UserIcon className="w-5 h-5" />}>Mon Profil</NavItem>
                           <NavItem section="consultations" icon={<ClockIcon className="w-5 h-5" />}>Mes Consultations</NavItem>
                           <NavItem section="payments" icon={<CreditCardIcon className="w-5 h-5" />}>Mes Paiements</NavItem>
                           <NavItem section="favorites" icon={<HeartIcon className="w-5 h-5" />}>Mes Favoris</NavItem>
                        </Card>
                    </aside>
                    <div className="flex-1">
                        {renderSection()}
                    </div>
                </div>
            </main>
            {activeChat && <ChatWindow 
                conversation={activeChat.conversation} 
                psychic={activeChat.psychic} 
                onClose={handleEndChat} 
                initialPaidMinutes={user.paidMinutesBalance || 0}
                initialFreeMinutes={user.freeMinutesBalance || 0}
            />}
            {viewingPastChat && <ChatWindow conversation={viewingPastChat.conversation} psychic={viewingPastChat.psychic} onClose={() => setViewingPastChat(null)} isReadOnly={true} initialPaidMinutes={0} initialFreeMinutes={0} />}
        </div>
    );
};

// --- Sections ---

const HomeSection: React.FC<{psychics: PsychicProfile[], onChatClick: (p: PsychicProfile) => void, disabled: boolean, onToggleFavorite: (id: string) => void, favoriteIds: string[]}> = ({psychics, onChatClick, disabled, onToggleFavorite, favoriteIds}) => (
    <div>
        <h1 className="text-3xl font-bold mb-6 dark:text-dark-text-primary">Nos experts disponibles</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {psychics.filter(p => p.isOnline).map(expert => (
                <ExpertCard 
                    key={expert.id} 
                    expert={expert}
                    onChatClick={onChatClick}
                    isFavorite={favoriteIds.includes(expert.id)} 
                    onToggleFavorite={onToggleFavorite} 
                />
            ))}
        </div>
        {psychics.filter(p => p.isOnline).length === 0 && <p className="text-center text-brand-text-light dark:text-dark-text-secondary py-12">Aucun expert n'est disponible pour le moment.</p>}
    </div>
);

const ProfileSection: React.FC<{client: Client}> = ({client}) => {
    const { login } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);
    const [formData, setFormData] = useState({
        fullName: client.fullName || '',
        dateOfBirth: client.dateOfBirth || '',
        phoneNumber: client.phoneNumber || '',
        gender: client.gender || 'prefer_not_to_say',
        email: client.email || '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await mockApi.updateClientProfile(client.id, formData);
        // FIX: Check for res.success and res.user, then pass the full User object to login.
        if (res.success && res.user) {
            login(res.user);
            addNotification('Profil mis à jour avec succès !');
        } else {
            addNotification('Erreur lors de la mise à jour.', 'warning');
        }
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-brand-primary">Mon Profil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Nom d'utilisateur" value={client.username} disabled className="dark:bg-dark-bg-primary dark:border-dark-border cursor-not-allowed"/>
                    <Input label="ID Client" value={client.id} disabled className="dark:bg-dark-bg-primary dark:border-dark-border cursor-not-allowed"/>
                    <Input label="Nom complet" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                    <Input label="Date de naissance" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
                    <Input label="Numéro de téléphone" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} />
                     <div>
                        <label className="block text-sm font-medium text-brand-text-dark dark:text-dark-text-primary mb-1">Genre</label>
                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary">
                             <option value="prefer_not_to_say">Ne pas spécifier</option>
                             <option value="male">Homme</option>
                             <option value="female">Femme</option>
                             <option value="other">Autre</option>
                         </select>
                    </div>
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
                    <Button type="submit" variant="secondary">Enregistrer les modifications</Button>
                </div>
            </form>
        </Card>
    );
};

const ConsultationsSection: React.FC<{conversations: Conversation[], psychics: PsychicProfile[], onViewChat: (c: Conversation, p: PsychicProfile) => void}> = ({conversations, psychics, onViewChat}) => (
    <div>
        <h2 className="text-3xl font-bold mb-6 dark:text-dark-text-primary">Mes anciennes conversations</h2>
        {conversations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {conversations.map(convo => {
                    const psychic = psychics.find(p => p.id === convo.psychicId);
                    if (!psychic) return null;
                    const lastMessage = convo.messages[convo.messages.length - 1];
                    return (
                        <Card key={convo.id} className="cursor-pointer hover:border-brand-primary border-2 border-transparent transition-colors flex flex-col justify-between" onClick={() => onViewChat(convo, psychic)}>
                            <div>
                                <div className="flex items-center space-x-3 mb-3">
                                    <img src={psychic.imageUrl} alt={psychic.name} className="w-12 h-12 rounded-full" />
                                    <div>
                                        <h4 className="font-bold text-lg dark:text-dark-text-primary">{psychic.name}</h4>
                                        <p className="text-sm text-brand-text-light dark:text-dark-text-secondary">{new Date(lastMessage.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-brand-text-light dark:text-dark-text-secondary italic line-clamp-2">"{lastMessage.text}"</p>
                            </div>
                            <Button variant="ghost" className="mt-4 w-full !justify-start text-brand-primary">Voir la conversation</Button>
                        </Card>
                    )
                })}
            </div>
        ) : (
            <Card className="text-center py-12">
                <p className="text-brand-text-light dark:text-dark-text-secondary">Vous n'avez pas encore de conversations.</p>
            </Card>
        )}
    </div>
);

const PaymentsSection: React.FC<{history: PaymentHistoryItem[]}> = ({history}) => (
    <Card>
        <h2 className="text-2xl font-bold mb-4 text-brand-primary">Historique des Paiements</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="border-b border-gray-200 dark:border-dark-border"><tr className="text-sm text-brand-text-light dark:text-dark-text-secondary"><th className="p-2">Date</th><th className="p-2">Description</th><th className="p-2 text-right">Montant</th></tr></thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.id} className="border-b border-gray-200 dark:border-dark-border hover:bg-brand-bg-light dark:hover:bg-dark-bg-primary"><td className="p-2">{item.date}</td><td className="p-2">{item.description}</td><td className="p-2 text-right font-semibold text-brand-secondary">{item.amount.toFixed(2)}€</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

const FavoritesSection: React.FC<{psychics: PsychicProfile[], favoriteIds: string[], onToggleFavorite: (id: string) => void, onChatClick: (expert: PsychicProfile) => void}> = ({psychics, favoriteIds, onToggleFavorite, onChatClick}) => {
    const favoritePsychics = psychics.filter(p => favoriteIds.includes(p.id));
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 dark:text-dark-text-primary">Mes Experts Favoris</h2>
            {favoritePsychics.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favoritePsychics.map(expert => (
                        <ExpertCard 
                            key={expert.id} 
                            expert={expert} 
                            isFavorite={true}
                            onToggleFavorite={onToggleFavorite}
                            onChatClick={onChatClick}
                        />
                    ))}
                </div>
            ) : (
                 <Card className="text-center py-12">
                    <p className="text-brand-text-light dark:text-dark-text-secondary">Vous n'avez pas encore ajouté de favoris.</p>
                </Card>
            )}
        </div>
    );
};


export default ClientDashboard;