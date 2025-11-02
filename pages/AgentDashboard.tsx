import React, { useState, useEffect, useContext, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { AuthContext, NotificationContext, ThemeContext } from '../App';
import type { Conversation, Message, PsychicProfile, AgentStats } from '../types';
import { UserRole } from '../types';
import { mockApi } from '../services/mockData';
import { Button, Card, Input } from '../components/UI';
import { SendIcon, LogOutIcon, BarChartIcon, UsersIcon, ChevronDownIcon, MessageCircleIcon, SettingsIcon, SmileIcon, MicIcon, SunIcon, MoonIcon } from '../components/Icons';
import { playNotificationSound } from '../utils';
import { EmojiPicker } from '../components/EmojiPicker';
import { AdminAgentChat } from '../components/AdminAgentChat';

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

type AgentPage = 'chat' | 'stats' | 'profiles';

const AgentHeader: React.FC<{ setActivePage: (page: AgentPage) => void }> = ({ setActivePage }) => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
         <header className="bg-brand-bg-white/80 dark:bg-dark-bg-secondary/80 backdrop-blur-md sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold font-serif text-brand-primary">Espace Agent</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <button className="flex items-center space-x-2 bg-brand-primary-light px-4 py-2 rounded-lg text-white">
                            <span>{user?.username}</span>
                            <ChevronDownIcon className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-brand-bg-white dark:bg-dark-bg-secondary rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => setActivePage('chat')} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">
                                <MessageCircleIcon className="w-4 h-4" /><span>Tchat</span>
                            </button>
                            <button onClick={() => setActivePage('profiles')} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">
                               <UsersIcon className="w-4 h-4" /><span>Mes profils</span>
                            </button>
                            <button onClick={() => setActivePage('stats')} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">
                                <BarChartIcon className="w-4 h-4" /><span>Statistiques</span>
                            </button>
                            <button onClick={logout} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-brand-text-dark dark:text-dark-text-primary hover:bg-brand-primary hover:text-white">
                                <LogOutIcon className="w-4 h-4" /><span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-gray-200 dark:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary hover:bg-gray-300 dark:hover:bg-dark-border"
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

const useLatest = <T extends any>(value: T) => {
    const ref = useRef(value);
    useEffect(() => {
      ref.current = value;
    });
    return ref;
};

const AgentChat: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { addNotification } = useContext(NotificationContext);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isEmojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const latestSelectedConvoRef = useLatest(selectedConversation);

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
                    addNotification("L'accès au microphone est requis.", 'warning');
                });
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setEmojiPickerOpen(false);
        inputRef.current?.focus();
    };
    // End Speech Recognition Logic

    useEffect(() => {
        if (!user) return;

        const listeners: Array<() => void> = [];

        mockApi.getAgentConversations(user.id).then(data => {
            const initialConvos = data as Conversation[];
            setConversations(initialConvos);
            
            if (initialConvos.length > 0 && !latestSelectedConvoRef.current) {
                setSelectedConversation(initialConvos[0]);
            }

            initialConvos.forEach(convo => {
                const handleNewMessage = (newMessage: Message) => {
                    setConversations(currentConvos => {
                        const targetConvo = currentConvos.find(c => c.id === convo.id);
                        if (!targetConvo || targetConvo.messages.some(m => m.id === newMessage.id)) {
                           return currentConvos;
                        }

                        if (newMessage.sender === 'CLIENT') {
                            playNotificationSound();
                            const isChatOpenAndActive = latestSelectedConvoRef.current?.id === convo.id && !document.hidden;
                            if (!isChatOpenAndActive) {
                                addNotification(`Nouveau message de ${convo.clientUsername}`);
                            }
                        }

                        return currentConvos.map(c => 
                            c.id === convo.id 
                                ? { ...c, messages: [...c.messages, newMessage], hasUnread: latestSelectedConvoRef.current?.id !== convo.id }
                                : c
                        );
                    });
                };
                
                mockApi.subscribeToConversation(convo.id, handleNewMessage);
                listeners.push(() => mockApi.unsubscribeFromConversation(convo.id, handleNewMessage));
            });
        });

        return () => {
            listeners.forEach(unsub => unsub());
        };
    }, [user, addNotification, latestSelectedConvoRef]);
    
    useEffect(() => {
        if (selectedConversation) {
            const fullConvo = conversations.find(c => c.id === selectedConversation.id);
            if (fullConvo) setMessages(fullConvo.messages);
        }
    }, [selectedConversation, conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const selectConversation = (convo: Conversation) => {
        const updatedConvo = { ...convo, hasUnread: false };
        setConversations(prev => prev.map(c => c.id === convo.id ? updatedConvo : c));
        setSelectedConversation(updatedConvo);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConversation) return;
        const msgData: Omit<Message, 'id' | 'timestamp'> = { sender: 'AGENT', text: newMessage };
        await mockApi.sendMessage(selectedConversation.id, msgData);
        setNewMessage('');
    };

    return (
        <div className="flex h-[calc(100vh-76px)]">
            <div className="w-1/3 border-r border-gray-200 dark:border-dark-border overflow-y-auto flex flex-col bg-brand-bg-white dark:bg-dark-bg-secondary">
                <div className="p-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center sticky top-0 bg-brand-bg-white dark:bg-dark-bg-secondary z-10">
                    <h2 className="text-xl font-bold dark:text-dark-text-primary">Conversations</h2>
                </div>
                <div className="flex-grow">
                    {conversations.map(convo => (
                        <div key={convo.id} onClick={() => selectConversation(convo)} className={`p-4 cursor-pointer border-b border-gray-200 dark:border-dark-border flex justify-between items-center ${selectedConversation?.id === convo.id ? 'bg-brand-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-bg-primary'}`}>
                            <div>
                                <p className={`font-bold ${selectedConversation?.id === convo.id ? 'text-white' : 'text-brand-text-dark dark:text-dark-text-primary'}`}>{convo.clientUsername}</p>
                                <p className={`text-sm ${selectedConversation?.id === convo.id ? 'text-gray-200' : 'text-brand-text-light dark:text-dark-text-secondary'}`}>via {convo.psychicName}</p>
                            </div>
                            {convo.hasUnread && <span className="w-3 h-3 bg-brand-secondary rounded-full"></span>}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex flex-col bg-brand-bg-light dark:bg-dark-bg-primary">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-brand-bg-white dark:bg-dark-bg-secondary">
                            <h2 className="text-xl font-bold dark:text-dark-text-primary">Discussion avec {selectedConversation.clientUsername}</h2>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'AGENT' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'AGENT' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-bg-white dark:bg-dark-bg-secondary text-brand-text-dark dark:text-dark-text-primary shadow-sm rounded-bl-none'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-dark-border bg-brand-bg-white dark:bg-dark-bg-secondary">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                <div className="relative flex-grow">
                                    {isEmojiPickerOpen && <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setEmojiPickerOpen(false)} />}
                                    <Input 
                                        ref={inputRef}
                                        type="text" 
                                        placeholder="Répondez ici..." 
                                        className="flex-grow !bg-brand-bg-white dark:!bg-dark-bg-primary !pr-24"
                                        value={newMessage} 
                                        onChange={(e) => setNewMessage(e.target.value)} 
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                                        <button type="button" onClick={() => setEmojiPickerOpen(o => !o)} className="text-gray-400 hover:text-brand-text-dark dark:hover:text-dark-text-primary">
                                            <SmileIcon className="w-6 h-6" />
                                        </button>
                                        <button type="button" onClick={toggleListening} disabled={!hasRecognitionSupport} className={`text-gray-400 hover:text-brand-text-dark dark:hover:text-dark-text-primary disabled:opacity-50 ${isListening ? 'text-red-500 animate-pulse' : ''}`}>
                                            <MicIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit" variant="secondary" className="!px-3" disabled={newMessage.trim() === ''}><SendIcon className="w-6 h-6"/></Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-brand-text-light dark:text-dark-text-secondary">
                        <p>Sélectionnez une conversation pour commencer.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AgentStatsPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { theme } = useContext(ThemeContext);
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);


    useEffect(() => {
        if(user) {
            mockApi.getAgentStats(user.id).then(setStats);
        }
    }, [user]);

    if (!stats) return <p className="p-8">Chargement des statistiques...</p>;

    const filteredActivity = stats.activityData.filter(activity => {
        const activityDate = new Date(activity.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include the whole end day
        return activityDate >= start && activityDate <= end;
    });

    const paidMinutes = filteredActivity.reduce((acc, day) => acc + day.paid, 0);
    const freeMinutes = filteredActivity.reduce((acc, day) => acc + day.free, 0);

    const chartTextColor = theme === 'dark' ? '#A0AEC0' : '#718096';
    const chartGridColor = theme === 'dark' ? '#4A5568' : '#e0e0e0';
    const chartTooltipStyle = {
      backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
      border: `1px solid ${chartGridColor}`
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold mb-6 dark:text-dark-text-primary">Vos Performances</h2>
                 <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-bg-secondary p-2 rounded-lg">
                    <label htmlFor="start-date" className="text-sm font-medium text-brand-text-light dark:text-dark-text-secondary">Du</label>
                    <Input 
                        type="date" 
                        id="start-date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)} 
                        className="!py-1 !px-2 bg-brand-bg-white dark:bg-dark-bg-primary" 
                    />
                    <label htmlFor="end-date" className="text-sm font-medium text-brand-text-light dark:text-dark-text-secondary">Au</label>
                    <Input 
                        type="date" 
                        id="end-date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)} 
                        className="!py-1 !px-2 bg-brand-bg-white dark:bg-dark-bg-primary" 
                    />
                </div>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Minutes Payantes (période)</p><p className="text-3xl font-bold text-green-500">{paidMinutes}</p></Card>
                <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Minutes Gratuites (période)</p><p className="text-3xl font-bold text-red-500">{freeMinutes}</p></Card>
                <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Total Minutes (période)</p><p className="text-3xl font-bold text-brand-primary">{paidMinutes + freeMinutes}</p></Card>
            </div>
            <Card>
                <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Activité sur la période (Minutes/jour)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={filteredActivity}>
                         <defs>
                            <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="date" stroke={chartTextColor} tickFormatter={(tick) => new Date(tick).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}/>
                        <YAxis stroke={chartTextColor}/>
                        <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')} />
                        <Legend wrapperStyle={{ color: chartTextColor }}/>
                        <Area type="monotone" dataKey="paid" stackId="1" stroke="#22c55e" fill="url(#colorPaid)" name="Minutes Payantes" />
                        <Area type="monotone" dataKey="free" stackId="1" stroke="#ef4444" fill="url(#colorFree)" name="Minutes Gratuites" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

const AgentProfilesPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [myProfiles, setMyProfiles] = useState<PsychicProfile[]>([]);

    useEffect(() => {
        if (user) {
            mockApi.getPsychics().then(allPsychics => {
                setMyProfiles((allPsychics as PsychicProfile[]).filter(p => p.agentId === user.id));
            });
        }
    }, [user]);

    return (
         <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 dark:text-dark-text-primary">Mes Profils de Voyance</h2>
            {myProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProfiles.map(profile => (
                        <Card key={profile.id}>
                            <img src={profile.imageUrl} alt={profile.name} className="w-24 h-24 rounded-full mx-auto border-2 border-brand-primary mb-4" />
                            <h3 className="text-xl font-bold text-center dark:text-dark-text-primary">{profile.name}</h3>
                            <p className="text-brand-primary text-center font-semibold">{profile.specialty}</p>
                            <p className="text-sm text-brand-text-light dark:text-dark-text-secondary mt-2">{profile.description}</p>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <p className="text-brand-text-light dark:text-dark-text-secondary">Aucun profil ne vous est attribué pour le moment.</p>
                </Card>
            )}
        </div>
    );
};


const AgentDashboard: React.FC = () => {
    const [activePage, setActivePage] = useState<AgentPage>('chat');

    const renderContent = () => {
        switch (activePage) {
            case 'chat': return <AgentChat />;
            case 'stats': return <AgentStatsPage />;
            case 'profiles': return <AgentProfilesPage />;
            default: return <AgentChat />;
        }
    }

    return (
        <div className="bg-brand-bg-light dark:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary min-h-screen">
            <AgentHeader setActivePage={setActivePage} />
            <main>
                {renderContent()}
            </main>
            <AdminAgentChat userRole={UserRole.AGENT} />
        </div>
    );
};

export default AgentDashboard;