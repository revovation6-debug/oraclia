import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import type { AdminConversation, Message } from '../types';
import { UserRole } from '../types';
import { mockApi } from '../services/mockData';
import { Button, Card, Input } from './UI';
import { MessageSquareIcon, XIcon, SendIcon } from './Icons';
import { playNotificationSound } from '../utils';

interface AdminAgentChatProps {
    userRole: UserRole.ADMIN | UserRole.AGENT;
}

export const AdminAgentChat: React.FC<AdminAgentChatProps> = ({ userRole }) => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<AdminConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchData = () => {
        if (userRole === UserRole.ADMIN) {
            mockApi.getAdminConversations().then(data => {
                setConversations(data);
                if (!selectedConversationId && data.length > 0) {
                    setSelectedConversationId(data[0].id);
                }
            });
        } else if (userRole === UserRole.AGENT && user) {
            mockApi.getAgentAdminConversation(user.id).then(data => {
                setConversations(data);
                if (!selectedConversationId && data.length > 0) {
                    setSelectedConversationId(data.find(c => c.recipientId === user.id)?.id || data[0].id);
                }
            });
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, userRole, user]);
    
     useEffect(() => {
        if (!isOpen || conversations.length === 0) return;

        const listeners: Array<() => void> = [];
        
        conversations.forEach(convo => {
            const handleNewMessage = (newMessage: Message) => {
                 setConversations(currentConvos => {
                    if (newMessage.sender !== userRole) {
                        playNotificationSound();
                    }
                    return currentConvos.map(c => {
                        if (c.id === convo.id && !c.messages.some(m => m.id === newMessage.id)) {
                             // Mark as unread if the chat window is open but this convo is not selected,
                             // or if the sender is not the current user.
                            const shouldBeUnread = (isOpen && selectedConversationId !== convo.id && newMessage.sender !== userRole) || !isOpen;
                            return { ...c, messages: [...c.messages, newMessage], hasUnread: shouldBeUnread };
                        }
                        return c;
                    });
                });
            };
            mockApi.subscribeToConversation(convo.id, handleNewMessage);
            listeners.push(() => mockApi.unsubscribeFromConversation(convo.id, handleNewMessage));
        });

        return () => listeners.forEach(unsub => unsub());
    }, [isOpen, conversations, selectedConversationId, userRole]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations, selectedConversationId]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen && selectedConversationId) {
             // Mark the currently selected conversation as read when opening
            markConversationAsRead(selectedConversationId);
        }
    };
    
    const markConversationAsRead = (convoId: string) => {
         setConversations(convos => convos.map(c => c.id === convoId ? { ...c, hasUnread: false } : c));
    };

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
        markConversationAsRead(id);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConversationId) return;

        if (userRole === UserRole.ADMIN) {
            await mockApi.sendAdminMessage(selectedConversationId, newMessage);
        } else if (userRole === UserRole.AGENT) {
            await mockApi.sendAgentMessage(selectedConversationId, newMessage);
        }
        
        setNewMessage('');
    };

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);
    const unreadCount = conversations.reduce((count, convo) => count + (convo.hasUnread ? 1 : 0), 0);

    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-5 right-5 bg-brand-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-brand-primary-light transition-transform transform hover:scale-110"
                aria-label="Ouvrir le chat admin"
            >
                <MessageSquareIcon className="w-7 h-7" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-brand-secondary text-white text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-primary">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="fixed bottom-21 right-5 w-96 h-[60vh] bg-brand-bg-white dark:bg-dark-bg-secondary shadow-2xl rounded-lg flex flex-col z-50 border border-gray-200 dark:border-dark-border animate-pop-in">
                    <header className="p-4 bg-gray-50 dark:bg-dark-bg-primary flex justify-between items-center rounded-t-lg border-b border-gray-200 dark:border-dark-border">
                        <h3 className="font-bold text-brand-text-dark dark:text-dark-text-primary">Messagerie Interne</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 dark:text-dark-text-secondary hover:text-brand-text-dark dark:hover:text-dark-text-primary"><XIcon className="w-6 h-6" /></button>
                    </header>
                    
                    {userRole === UserRole.ADMIN && (
                        <div className="p-2 border-b border-gray-200 dark:border-dark-border">
                            <select 
                                value={selectedConversationId || ''} 
                                onChange={e => handleSelectConversation(e.target.value)}
                                className="w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            >
                                {conversations.map(c => <option key={c.id} value={c.id}>{c.recipientName}</option>)}
                            </select>
                        </div>
                    )}
                     {userRole === UserRole.AGENT && (
                        <div className="p-2 border-b border-gray-200 dark:border-dark-border flex space-x-2">
                             {conversations.map(c => (
                                 <button 
                                    key={c.id} 
                                    onClick={() => handleSelectConversation(c.id)}
                                    className={`flex-1 text-sm px-2 py-1 rounded-md transition-colors relative ${selectedConversationId === c.id ? 'bg-brand-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-bg-primary dark:text-dark-text-primary'}`}
                                >
                                    {c.recipientId === 'BROADCAST' ? 'Messages Généraux' : 'Admin'}
                                    {c.hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-brand-secondary rounded-full"></span>}
                                </button>
                            ))}
                        </div>
                    )}

                    <main className="flex-1 p-4 overflow-y-auto space-y-4 bg-brand-bg-light dark:bg-dark-bg-primary">
                        {selectedConversation ? selectedConversation.messages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.sender === userRole ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-2xl ${msg.sender === userRole ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-bg-white dark:bg-dark-bg-secondary text-brand-text-dark dark:text-dark-text-primary rounded-bl-none shadow-sm'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        )) : <p className="text-center text-brand-text-light dark:text-dark-text-secondary">Sélectionnez une conversation.</p>}
                        <div ref={messagesEndRef} />
                    </main>

                    <footer className="p-2 border-t border-gray-200 dark:border-dark-border">
                         <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <Input 
                                type="text"
                                placeholder="Votre message..."
                                className="flex-grow !bg-brand-bg-white dark:!bg-dark-bg-primary"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                disabled={!selectedConversation || (userRole === UserRole.AGENT && selectedConversation?.recipientId === 'BROADCAST')}
                            />
                            <Button type="submit" variant="secondary" className="!px-3" disabled={!selectedConversation || newMessage.trim() === '' || (userRole === UserRole.AGENT && selectedConversation?.recipientId === 'BROADCAST')}>
                                <SendIcon className="w-5 h-5" />
                            </Button>
                        </form>
                    </footer>
                </div>
            )}
        </>
    );
};