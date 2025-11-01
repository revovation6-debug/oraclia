
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AuthContext } from '../App';
import type { Conversation, Message, PsychicProfile, AgentStats } from '../types';
import { mockApi } from '../services/mockData';
import { MOCK_PSYCHICS, MOCK_AGENT_STATS } from '../services/mockData';
import { Button, Card, Input } from '../components/UI';
import { SendIcon, LogOutIcon, BarChartIcon, UsersIcon, ChevronDownIcon } from '../components/Icons';

const AgentHeader: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const [activePage, setActivePage] = useState('dashboard');

    return (
         <header className="bg-brand-light-gray/80 backdrop-blur-md sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-2xl font-bold font-serif text-brand-gold">Espace Agent</h1>
                <div className="relative group">
                    <button className="flex items-center space-x-2 bg-brand-purple-light px-4 py-2 rounded-lg text-white">
                        <span>{user?.username}</span>
                        <ChevronDownIcon className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-brand-light-gray rounded-md shadow-lg py-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a href="#/agent" onClick={() => setActivePage('profiles')} className="block px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple">Mes profils</a>
                        <a href="#/agent" onClick={() => setActivePage('stats')} className="block px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple">Statistiques</a>
                        <button onClick={logout} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple">
                            <LogOutIcon className="w-4 h-4" />
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

const AgentChat: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (user) {
            mockApi.getAgentConversations(user.id).then(data => {
                setConversations(data as Conversation[]);
                if ((data as Conversation[]).length > 0) {
                    const firstConvo = (data as Conversation[])[0];
                    setSelectedConversation(firstConvo);
                    setMessages(firstConvo.messages);
                }
            });
        }
    }, [user]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const selectConversation = (convo: Conversation) => {
        setSelectedConversation(convo);
        setMessages(convo.messages);
        // Mark as read
        const updatedConversations = conversations.map(c => c.id === convo.id ? {...c, hasUnread: false} : c);
        setConversations(updatedConversations);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConversation) return;
        const msgData: Omit<Message, 'id' | 'timestamp'> = { sender: 'AGENT', text: newMessage };
        const sentMessage = await mockApi.sendMessage(selectedConversation.id, msgData) as Message;
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
    };

    return (
        <div className="flex h-[calc(100vh-140px)]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-brand-light-gray overflow-y-auto">
                {conversations.map(convo => (
                    <div key={convo.id} onClick={() => selectConversation(convo)} className={`p-4 cursor-pointer border-b border-brand-light-gray flex justify-between items-center ${selectedConversation?.id === convo.id ? 'bg-brand-purple' : 'hover:bg-brand-light-gray'}`}>
                        <div>
                            <p className="font-bold">{convo.clientUsername}</p>
                            <p className="text-sm text-gray-400">via {convo.psychicName}</p>
                        </div>
                        {convo.hasUnread && <span className="w-3 h-3 bg-brand-gold rounded-full"></span>}
                    </div>
                ))}
            </div>
            {/* Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-4 border-b border-brand-light-gray">
                            <h2 className="text-xl font-bold">Discussion avec {selectedConversation.clientUsername}</h2>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-brand-gray">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'AGENT' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'AGENT' ? 'bg-brand-purple-light text-white rounded-br-none' : 'bg-brand-light-gray text-gray-200 rounded-bl-none'}`}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-brand-light-gray bg-brand-light-gray">
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <Input type="text" placeholder="Répondez ici..." className="flex-grow !bg-brand-gray" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                                <Button type="submit" className="!px-3"><SendIcon className="w-6 h-6"/></Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Sélectionnez une conversation pour commencer.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AgentStatsPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState<AgentStats | null>(null);

    useEffect(() => {
        if(user) {
            const agentStats = MOCK_AGENT_STATS.find(s => s.agentId === user.id);
            setStats(agentStats || null);
        }
    }, [user]);

    const chartData = [
        { name: 'Jan', revenue: 1200 }, { name: 'Fev', revenue: 1900 }, { name: 'Mar', revenue: 1500 },
        { name: 'Avr', revenue: 2100 }, { name: 'Mai', revenue: 1800 }, { name: 'Juin', revenue: 2500 }
    ];

    if (!stats) return <p>Chargement des statistiques...</p>;

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6">Vos Statistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card><p className="text-gray-400">Chiffre d'affaires (ce mois)</p><p className="text-3xl font-bold text-brand-gold">{stats.revenue}€</p></Card>
                <Card><p className="text-gray-400">Clients servis (ce mois)</p><p className="text-3xl font-bold text-brand-gold">{stats.clients}</p></Card>
                <Card><p className="text-gray-400">Heures de tchat (ce mois)</p><p className="text-3xl font-bold text-brand-gold">{stats.chatHours}</p></Card>
            </div>
            <Card>
                <h3 className="text-xl font-bold mb-4">Revenus par mois</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF"/>
                        <YAxis stroke="#9CA3AF"/>
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                        <Bar dataKey="revenue" fill="#FBBF24" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};


const AgentDashboard: React.FC = () => {
    return (
        <div className="bg-brand-gray text-white min-h-screen">
            <AgentHeader />
            <main>
                <AgentChat />
                 {/* The other pages like stats would be conditionally rendered here based on state from header */}
                 {/* For simplicity, only chat is shown by default */}
            </main>
        </div>
    );
};

export default AgentDashboard;
