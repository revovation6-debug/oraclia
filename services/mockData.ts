import type { SiteVisitData, Client, Agent, PsychicProfile, AgentStats, Review, Conversation, Message, MinutePack, User, Horoscope, AgentActivity, AdminConversation, SignupData, PaymentHistoryItem } from '../types';
import { UserRole } from '../types';

// --- Real-time Chat Simulation ---
type ChatListener = (message: Message) => void;
const conversationListeners: Record<string, ChatListener[]> = {};

const chatService = {
  subscribe: (conversationId: string, callback: ChatListener) => {
    if (!conversationListeners[conversationId]) {
      conversationListeners[conversationId] = [];
    }
    conversationListeners[conversationId].push(callback);
  },
  unsubscribe: (conversationId: string, callback: ChatListener) => {
    if (conversationListeners[conversationId]) {
      conversationListeners[conversationId] = conversationListeners[conversationId].filter(
        (cb) => cb !== callback
      );
    }
  },
  emit: (conversationId: string, message: Message) => {
    if (conversationListeners[conversationId]) {
      conversationListeners[conversationId].forEach((callback) => callback(message));
    }
  },
};
// --- End Real-time Chat Simulation ---


// IPs that have already registered an account to claim free minutes.
// In a real application, this would be stored in a persistent database.
export let MOCK_REGISTERED_IPS: string[] = ['192.168.1.1', '2001:db8::1'];


// Mock Data Generation
const generateDailyVisits = (days: number): SiteVisitData[] => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            visits: 1000 + Math.floor(Math.random() * 4000)
        });
    }
    return data;
};

const generateDailySignups = (clients: Client[], days: number): SignupData[] => {
    const data: { [date: string]: number } = {};
    const today = new Date();
    
    // Initialize all days in the range to 0
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        data[dateString] = 0;
    }

    // Count signups from mock clients
    clients.forEach(client => {
        const signupDate = client.signupDate;
        if (data.hasOwnProperty(signupDate)) {
            data[signupDate]++;
        }
    });

    // Convert to array format and sort by date
    return Object.entries(data).map(([date, signups]) => ({ date, signups })).sort((a, b) => a.date.localeCompare(b.date));
};


const generateAgentActivity = (days: number): AgentActivity[] => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0],
            paid: Math.floor(Math.random() * 50),
            free: Math.floor(Math.random() * 10),
        });
    }
    return data;
};


export const MOCK_SITE_VISITS: SiteVisitData[] = generateDailyVisits(90);

export let MOCK_CLIENTS: Client[] = [
  { id: '1234567', username: 'ClientFidele', email: 'fidele@email.com', signupDate: '2023-01-15', paidMinutesBalance: 120, freeMinutesBalance: 10, status: 'ACTIVE', fullName: 'Jean Dupont', dateOfBirth: '1985-05-20', phoneNumber: '0612345678', gender: 'male', favoritePsychicIds: ['psychic-1', 'psychic-4'] },
  { id: '7654321', username: 'NouveauClient', email: 'nouveau@email.com', signupDate: '2023-07-20', paidMinutesBalance: 0, freeMinutesBalance: 5, status: 'ACTIVE', favoritePsychicIds: [] },
  { id: '1122334', username: 'CurieuxAstro', email: 'curieux@email.com', signupDate: '2023-06-01', paidMinutesBalance: 0, freeMinutesBalance: 0, status: 'ACTIVE', favoritePsychicIds: ['psychic-2'] },
];

export let MOCK_PAYMENT_HISTORY: PaymentHistoryItem[] = [
    { id: 'pay-1', date: '2023-07-15', amount: 45, description: 'Achat de 15 minutes' },
    { id: 'pay-2', date: '2023-06-28', amount: 90, description: 'Achat de 30 minutes' },
];

(function generateMoreClients() {
    const today = new Date();
    for(let i=1; i < 90; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const numClients = Math.floor(Math.random() * 5); // 0 to 4 new clients per day
        for (let j=0; j < numClients; j++) {
            const id = `${Math.floor(1000000 + Math.random() * 9000000)}`;
            MOCK_CLIENTS.push({
                id: id,
                username: `Client${id.substring(0,4)}`,
                email: `client${id.substring(0,4)}@email.com`,
                signupDate: date.toISOString().split('T')[0],
                paidMinutesBalance: 0,
                freeMinutesBalance: 5,
                status: 'ACTIVE',
                favoritePsychicIds: [],
            });
        }
    }
})();


export let MOCK_AGENTS: Agent[] = [
  { id: 'agent-1', username: 'AgentAlpha', creationDate: '2022-11-10', psychicProfileIds: ['psychic-1', 'psychic-2'], isOnline: true },
  { id: 'agent-2', username: 'AgentBeta', creationDate: '2023-02-05', psychicProfileIds: ['psychic-3'], isOnline: false },
  { id: 'agent-3', username: 'AgentGamma', creationDate: '2023-05-20', psychicProfileIds: ['psychic-4'], isOnline: true },
];

export let MOCK_PSYCHICS: PsychicProfile[] = [
  { id: 'psychic-1', agentId: 'agent-1', name: 'Madame Irma', specialty: 'Tarot', description: 'Spécialiste du Tarot de Marseille, je lis votre avenir avec précision.', imageUrl: 'https://picsum.photos/seed/irma/400/400', rating: 4.9, reviewsCount: 134, isOnline: true },
  { id: 'psychic-2', agentId: 'agent-1', name: 'Leo Astro', specialty: 'Astrologie', description: 'Votre ciel astral n\'a aucun secret pour moi. Découvrez votre destinée.', imageUrl: 'https://picsum.photos/seed/leo/400/400', rating: 4.8, reviewsCount: 98, isOnline: true },
  { id: 'psychic-3', agentId: 'agent-2', name: 'Clara Vision', specialty: 'Clairvoyance', description: 'Je perçois des flashs de votre futur pour vous guider.', imageUrl: 'https://picsum.photos/seed/clara/400/400', rating: 4.7, reviewsCount: 210, isOnline: false },
  { id: 'psychic-4', agentId: 'agent-3', name: 'Rune Master', specialty: 'Runes', description: 'Les anciennes runes nordiques répondent à vos questions les plus profondes.', imageUrl: 'https://picsum.photos/seed/rune/400/400', rating: 5.0, reviewsCount: 77, isOnline: true },
];

export let MOCK_AGENT_STATS: AgentStats[] = MOCK_AGENTS.map(agent => ({
    agentId: agent.id,
    paidMinutes: 0,
    freeMinutes: 0,
    activityData: generateAgentActivity(90)
}));

// Calculate initial totals from daily data
MOCK_AGENT_STATS.forEach(stat => {
    stat.paidMinutes = stat.activityData.reduce((acc, day) => acc + day.paid, 0);
    stat.freeMinutes = stat.activityData.reduce((acc, day) => acc + day.free, 0);
});

export const MOCK_SIGNUPS: SignupData[] = generateDailySignups(MOCK_CLIENTS, 90);


export let MOCK_REVIEWS: Review[] = [
    { id: 'rev-1', author: 'Sophie D.', rating: 5, text: 'Consultation incroyable avec Madame Irma, très précise !', psychicId: 'psychic-1', date: '2023-07-28' },
    { id: 'rev-2', author: 'Marc L.', rating: 5, text: 'Leo Astro a vu juste sur toute la ligne. Bluffant.', psychicId: 'psychic-2', date: '2023-07-27' },
    { id: 'rev-3', author: 'ClientAnonyme', rating: 5, text: 'Oraclia est la meilleure plateforme de voyance que j\'ai testée. Très pro.', date: '2023-07-25' },
    { id: 'rev-4', author: 'Julie B.', rating: 4, text: 'Clara Vision m\'a bien aidée, même si elle était un peu directe.', psychicId: 'psychic-3', date: '2023-07-22' },
    { id: 'rev-5', author: 'Thomas P.', rating: 5, text: 'Rune Master est impressionnant. Ses lectures sont claires et profondes.', psychicId: 'psychic-4', date: '2023-07-21' },
    { id: 'rev-6', author: 'Elodie F.', rating: 5, text: 'Une expérience très positive. Je recommande vivement les services d\'Oraclia.', date: '2023-07-20' },
];

export let MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'convo-1', clientId: '1234567', clientUsername: 'ClientFidele', psychicId: 'psychic-1', psychicName: 'Madame Irma', hasUnread: true,
        messages: [
            { id: 'msg-1', sender: 'CLIENT', text: 'Bonjour Madame Irma, j\'ai une question importante.', timestamp: Date.now() - 200000 },
            { id: 'msg-2', sender: 'AGENT', text: 'Bonjour, je vous écoute attentivement.', timestamp: Date.now() - 180000 },
            { id: 'msg-3', sender: 'CLIENT', text: 'C\'est à propos de mon avenir professionnel...', timestamp: Date.now() - 50000 },
        ]
    },
    {
        id: 'convo-2', clientId: '7654321', clientUsername: 'NouveauClient', psychicId: 'psychic-4', psychicName: 'Rune Master', hasUnread: false,
        messages: [
             { id: 'msg-4', sender: 'CLIENT', text: 'Bonjour, que me réservent les runes ?', timestamp: Date.now() - 600000 },
             { id: 'msg-5', sender: 'AGENT', text: 'Les runes parlent de changement. Soyez prêt.', timestamp: Date.now() - 550000 },
        ]
    }
];

export let MOCK_ADMIN_CONVERSATIONS: AdminConversation[] = [
    {
        id: 'admin-chat-broadcast',
        recipientId: 'BROADCAST',
        recipientName: 'Tous les agents',
        messages: [
            { id: 'admin-msg-1', sender: 'ADMIN', text: 'Rappel : La réunion mensuelle aura lieu demain à 10h.', timestamp: Date.now() - 86400000 }
        ],
        hasUnread: false,
    },
    {
        id: 'admin-chat-agent-1',
        recipientId: 'agent-1',
        recipientName: 'AgentAlpha',
        messages: [
            { id: 'admin-msg-2', sender: 'ADMIN', text: 'Bonjour AgentAlpha, pouvez-vous me faire un point sur vos disponibilités cette semaine ?', timestamp: Date.now() - 3600000 },
            { id: 'admin-msg-3', sender: 'AGENT', text: 'Bonjour, bien sûr. Je suis disponible tous les soirs de 18h à 22h.', timestamp: Date.now() - 3500000 },
        ],
        hasUnread: true,
    }
];

export const MOCK_MINUTE_PACKS: MinutePack[] = [
    { id: 1, minutes: 5, price: 15.00 },
    { id: 2, minutes: 15, price: 45.00, popular: true },
    { id: 3, minutes: 30, price: 90.00 },
];

export const MOCK_HOROSCOPES: Horoscope[] = [
    { sign: 'Bélier', icon: '♈', dateRange: '21 Mars - 19 Avril', prediction: 'Une énergie débordante vous pousse à prendre des initiatives audacieuses aujourd\'hui. Foncez !' },
    { sign: 'Taureau', icon: '♉', dateRange: '20 Avril - 20 Mai', prediction: 'La patience est votre meilleure alliée. Une opportunité financière se présentera si vous savez attendre le bon moment.' },
    { sign: 'Gémeaux', icon: '♊', dateRange: '21 Mai - 20 Juin', prediction: 'Votre aisance communicationnelle sera un atout majeur. N\'hésitez pas à engager des conversations importantes.' },
    { sign: 'Cancer', icon: '♋', dateRange: '21 Juin - 22 Juillet', prediction: 'Votre intuition est particulièrement forte. Écoutez votre petite voix intérieure, elle vous guidera vers les bonnes décisions.' },
    { sign: 'Lion', icon: '♌', dateRange: '23 Juillet - 22 Août', prediction: 'Vous rayonnez et attirez tous les regards. Profitez de cette journée pour briller et mettre en avant vos talents.' },
    { sign: 'Vierge', icon: '♍', dateRange: '23 Août - 22 Septembre', prediction: 'L\'organisation est la clé de votre succès aujourd\'hui. Planifiez votre journée pour une efficacité maximale.' },
    { sign: 'Balance', icon: '♎', dateRange: '23 Septembre - 22 Octobre', prediction: 'L\'harmonie relationnelle est au premier plan. Cherchez le compromis dans les situations délicates.' },
    { sign: 'Scorpion', icon: '♏', dateRange: '23 Octobre - 21 Novembre', prediction: 'Une transformation intérieure s\'opère. Accueillez le changement, il est porteur de renouveau positif.' },
    { sign: 'Sagittaire', icon: '♐', dateRange: '22 Novembre - 21 Décembre', prediction: 'Votre soif d\'aventure est à son comble. Une nouvelle expérience ou un voyage pourrait se profiler à l\'horizon.' },
    { sign: 'Capricorne', icon: '♑', dateRange: '22 Décembre - 19 Janvier', prediction: 'Votre persévérance porte ses fruits. Un projet de longue haleine pourrait enfin se concrétiser.' },
    { sign: 'Verseau', icon: '♒', dateRange: '20 Janvier - 18 Février', prediction: 'Votre originalité est votre force. Ne craignez pas de sortir des sentiers battus, vos idées seront appréciées.' },
    { sign: 'Poissons', icon: '♓', dateRange: '19 Février - 20 Mars', prediction: 'Laissez libre cours à votre créativité. C\'est une excellente journée pour vous consacrer à vos passions artistiques.' },
];


// Mock API Functions
const apiDelay = 500;

export const mockApi = {
    // General
    login: (username: string, password?: string) => new Promise<User>((resolve, reject) => {
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                resolve({ id: 'admin-user', username: 'admin', email: 'admin@oraclia.com', role: UserRole.ADMIN });
                return;
            }
            
            const agent = MOCK_AGENTS.find(a => a.username === username);
            if (agent) {
                resolve({ id: agent.id, username: agent.username, email: `${agent.username}@oraclia.com`, role: UserRole.AGENT });
                return;
            }

            const client = MOCK_CLIENTS.find(c => c.username === username);
            if (client) {
                if (client.status === 'PENDING_VERIFICATION') {
                    reject({ code: 'NOT_VERIFIED', message: 'Email not verified', username: client.username });
                } else {
                    resolve({ 
                        ...client,
                        role: UserRole.CLIENT, 
                    });
                }
                return;
            }

            reject(new Error('Invalid credentials'));
        }, apiDelay);
    }),

    requestPasswordReset: (email: string) => new Promise(resolve => {
        setTimeout(() => {
            // Check if the email belongs to an agent. Agents' emails are derived from their username for this mock.
            // In a real system, agents might not have a self-service password reset.
            const isAgentEmail = MOCK_AGENTS.some(agent => `${agent.username}@oraclia.com` === email);

            if (isAgentEmail) {
                // For agents, we simulate that no email is sent. The password should be reset by an admin.
                console.log(`Password reset requested for an agent account (${email}). This functionality is disabled for agents.`);
            } else {
                // For clients and admin, we simulate the password reset email being sent.
                console.log(`Password reset requested for email: ${email}. In a real app, an email would be sent if the user exists.`);
            }
            
            // We always resolve to `true` to prevent email enumeration attacks, where an attacker
            // could otherwise determine which email addresses are registered with the service.
            resolve({ success: true });
        }, apiDelay);
    }),

    registerClient: (data: { email: string, username: string, fullName: string, dateOfBirth: string, phoneNumber: string, gender: Client['gender'] }, mockIp: string) => new Promise((resolve, reject) => {
        setTimeout(() => {
            // IP address check to prevent abuse of the free minutes offer
            if (MOCK_REGISTERED_IPS.includes(mockIp)) {
                return reject(new Error('Un compte a déjà été créé à partir de cet appareil pour bénéficier de l\'offre de bienvenue.'));
            }

            if (MOCK_CLIENTS.some(c => c.username === data.username)) {
                return reject(new Error('Ce nom d\'utilisateur est déjà pris.'));
            }
            if (MOCK_CLIENTS.some(c => c.email === data.email)) {
                return reject(new Error('Cette adresse e-mail est déjà enregistrée.'));
            }

            const newClient: Client = {
                id: `${Math.floor(1000000 + Math.random() * 9000000)}`,
                username: data.username,
                email: data.email,
                fullName: data.fullName,
                dateOfBirth: data.dateOfBirth,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                signupDate: new Date().toISOString().split('T')[0],
                paidMinutesBalance: 0,
                freeMinutesBalance: 5, // Grant 5 free minutes to new users
                status: 'PENDING_VERIFICATION',
                favoritePsychicIds: [],
            };
            MOCK_CLIENTS.push(newClient);
            MOCK_REGISTERED_IPS.push(mockIp); // Log the IP after successful registration
            resolve({ success: true, user: newClient });
        }, apiDelay);
    }),

    verifyClient: (username: string) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const client = MOCK_CLIENTS.find(c => c.username === username);
            if (client) {
                if(client.status === 'PENDING_VERIFICATION') {
                    client.status = 'ACTIVE';
                    resolve({ success: true });
                } else {
                    resolve({ success: true }); // Already verified, still success
                }
            } else {
                reject(new Error('User not found'));
            }
        }, apiDelay / 2);
    }),
    
    // Admin
    getSiteVisits: () => new Promise(resolve => setTimeout(() => resolve([...MOCK_SITE_VISITS]), apiDelay)),
    getSignupData: () => new Promise(resolve => setTimeout(() => resolve([...MOCK_SIGNUPS]), apiDelay)),
    getClients: () => new Promise(resolve => setTimeout(() => resolve([...MOCK_CLIENTS]), apiDelay)),
    deleteClient: (clientId: string) => new Promise(resolve => {
        setTimeout(() => {
            MOCK_CLIENTS = MOCK_CLIENTS.filter(c => c.id !== clientId);
            resolve({ success: true });
        }, apiDelay);
    }),
    addFreeMinutesToClient: (clientId: string, minutes: number) => new Promise(resolve => {
        setTimeout(() => {
            const client = MOCK_CLIENTS.find(c => c.id === clientId);
            if (client) {
                client.freeMinutesBalance += minutes;
            }
            resolve({ success: true, newPaidBalance: client?.paidMinutesBalance, newFreeBalance: client?.freeMinutesBalance });
        }, apiDelay);
    }),
    getAgents: () => new Promise(resolve => setTimeout(() => resolve([...MOCK_AGENTS]), apiDelay)),
    
    createAgent: (username: string) => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (MOCK_AGENTS.some(a => a.username === username)) {
                return reject(new Error('Username already exists'));
            }
            const newAgent: Agent = { id: `agent-${Date.now()}`, username, creationDate: new Date().toISOString().split('T')[0], psychicProfileIds: [], isOnline: false };
            MOCK_AGENTS.push(newAgent);
            // Create a corresponding admin chat for the new agent
            const newAdminChat: AdminConversation = {
                id: `admin-chat-${newAgent.id}`,
                recipientId: newAgent.id,
                recipientName: newAgent.username,
                messages: [],
                hasUnread: false
            };
            MOCK_ADMIN_CONVERSATIONS.push(newAdminChat);
            resolve(newAgent);
        }, apiDelay);
    }),
    deleteAgent: (agentId: string) => new Promise(resolve => {
        setTimeout(() => {
            MOCK_AGENTS = MOCK_AGENTS.filter(a => a.id !== agentId);
            MOCK_ADMIN_CONVERSATIONS = MOCK_ADMIN_CONVERSATIONS.filter(c => c.recipientId !== agentId);
            // Also un-assign psychics from this agent
            MOCK_PSYCHICS.forEach(p => {
                if (p.agentId === agentId) {
                    p.agentId = ''; // Or handle as needed
                }
            });
            resolve({ success: true });
        }, apiDelay);
    }),
    createReview: (review: Omit<Review, 'id' | 'date'>) => new Promise(resolve => {
        setTimeout(() => {
            const newReview: Review = { ...review, id: `rev-${Date.now()}`, date: new Date().toISOString().split('T')[0] };
            MOCK_REVIEWS.unshift(newReview);
            resolve(newReview);
        }, apiDelay);
    }),
    createPsychic: (psychicData: Omit<PsychicProfile, 'id' | 'rating' | 'reviewsCount' | 'isOnline'>) => new Promise(resolve => {
        setTimeout(() => {
            const newPsychic: PsychicProfile = {
                ...psychicData,
                id: `psychic-${Date.now()}`,
                rating: 0,
                reviewsCount: 0,
                isOnline: false,
            };
            MOCK_PSYCHICS.push(newPsychic);
            const agent = MOCK_AGENTS.find(a => a.id === psychicData.agentId);
            agent?.psychicProfileIds.push(newPsychic.id);
            resolve(newPsychic);
        }, apiDelay);
    }),
    updatePsychic: (psychicId: string, psychicData: Partial<PsychicProfile>) => new Promise(resolve => {
        setTimeout(() => {
            const index = MOCK_PSYCHICS.findIndex(p => p.id === psychicId);
            if (index > -1) {
                MOCK_PSYCHICS[index] = { ...MOCK_PSYCHICS[index], ...psychicData };
                resolve(MOCK_PSYCHICS[index]);
            } else {
                resolve(null);
            }
        }, apiDelay);
    }),
    deletePsychic: (psychicId: string) => new Promise(resolve => {
        setTimeout(() => {
            MOCK_PSYCHICS = MOCK_PSYCHICS.filter(p => p.id !== psychicId);
            MOCK_AGENTS.forEach(agent => {
                agent.psychicProfileIds = agent.psychicProfileIds.filter(id => id !== psychicId);
            });
            resolve({ success: true });
        }, apiDelay);
    }),
    getAdminConversations: () => new Promise<AdminConversation[]>(resolve => {
        // Ensure there's a conversation for every agent
        MOCK_AGENTS.forEach(agent => {
            if (!MOCK_ADMIN_CONVERSATIONS.some(c => c.recipientId === agent.id)) {
                 MOCK_ADMIN_CONVERSATIONS.push({
                    id: `admin-chat-${agent.id}`,
                    recipientId: agent.id,
                    recipientName: agent.username,
                    messages: [],
                    hasUnread: false
                 });
            }
        });
        setTimeout(() => resolve(JSON.parse(JSON.stringify(MOCK_ADMIN_CONVERSATIONS))), apiDelay / 2);
    }),
     sendAdminMessage: (conversationId: string, text: string) => new Promise<Message>(resolve => {
        setTimeout(() => {
            const conversation = MOCK_ADMIN_CONVERSATIONS.find(c => c.id === conversationId);
            const newMessage: Message = { id: `admin-msg-${Date.now()}`, sender: 'ADMIN', text, timestamp: Date.now() };
            if (conversation) {
                conversation.messages.push(newMessage);
                // In a real app, you would notify the specific agent(s) via WebSocket
                chatService.emit(conversationId, newMessage);
            }
            resolve(newMessage);
        }, 200);
    }),

    // Public / Client
    getPsychics: () => new Promise(resolve => setTimeout(() => resolve([...MOCK_PSYCHICS]), apiDelay)),
    getHomepageReviews: () => new Promise(resolve => setTimeout(() => resolve(MOCK_REVIEWS.slice(0, 4)), apiDelay)),
    getAllReviews: () => new Promise(resolve => setTimeout(() => resolve([...MOCK_REVIEWS]), apiDelay)),
    getHoroscopes: () => new Promise(resolve => setTimeout(() => resolve(MOCK_HOROSCOPES), apiDelay)),
    getMinutePacks: () => new Promise(resolve => setTimeout(() => resolve(MOCK_MINUTE_PACKS), apiDelay)),
    purchaseMinutes: (userId: string, packId: number) => new Promise(resolve => {
        setTimeout(() => {
            const pack = MOCK_MINUTE_PACKS.find(p => p.id === packId);
            const client = MOCK_CLIENTS.find(c => c.id === userId);
            if (pack && client) {
                client.paidMinutesBalance += pack.minutes;
                const paymentRecord: PaymentHistoryItem = {
                    id: `payment-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    amount: pack.price,
                    description: `Achat de ${pack.minutes} minutes`,
                };
                MOCK_PAYMENT_HISTORY.push(paymentRecord);
                resolve({ success: true, newPaidBalance: client.paidMinutesBalance, newFreeBalance: client.freeMinutesBalance });
            } else {
                resolve({ success: false });
            }
        }, apiDelay * 2);
    }),
    getClientConversations: (clientId: string) => new Promise(resolve => {
        setTimeout(() => {
            const convos = MOCK_CONVERSATIONS.filter(c => c.clientId === clientId);
            resolve(convos);
        }, apiDelay);
    }),
    getClientPaymentHistory: (clientId: string) => new Promise(resolve => setTimeout(() => resolve([...MOCK_PAYMENT_HISTORY]), apiDelay)),
    // FIX: Update the return type to be a Promise of an object containing a User, not a Client, to ensure type safety with the AuthContext.
    updateClientProfile: (clientId: string, data: Partial<Client>) => new Promise<{ success: boolean; user?: User }>(resolve => {
        setTimeout(() => {
            const clientIndex = MOCK_CLIENTS.findIndex(c => c.id === clientId);
            if(clientIndex > -1) {
                MOCK_CLIENTS[clientIndex] = { ...MOCK_CLIENTS[clientIndex], ...data };
                // FIX: Return a User object that includes the role, matching the AuthContext type.
                const user: User = { ...MOCK_CLIENTS[clientIndex], role: UserRole.CLIENT };
                resolve({ success: true, user: user });
            } else {
                resolve({ success: false });
            }
        }, apiDelay);
    }),
    toggleFavoritePsychic: (clientId: string, psychicId: string) => new Promise(resolve => {
        setTimeout(() => {
            const client = MOCK_CLIENTS.find(c => c.id === clientId);
            if (client) {
                if (!client.favoritePsychicIds) {
                    client.favoritePsychicIds = [];
                }
                const index = client.favoritePsychicIds.indexOf(psychicId);
                if (index > -1) {
                    client.favoritePsychicIds.splice(index, 1);
                } else {
                    client.favoritePsychicIds.push(psychicId);
                }
                 resolve({ success: true, favorites: client.favoritePsychicIds });
            } else {
                 resolve({ success: false });
            }
        }, 200);
    }),

    // Agent
    getAgentConversations: (agentId: string) => new Promise(resolve => {
        setTimeout(() => {
            const agent = MOCK_AGENTS.find(a => a.id === agentId);
            if (!agent) return resolve([]);
            const convos = MOCK_CONVERSATIONS.filter(c => agent.psychicProfileIds.includes(c.psychicId));
            resolve(convos);
        }, apiDelay);
    }),
    getAgentAdminConversation: (agentId: string) => new Promise<AdminConversation[]>(resolve => {
        setTimeout(() => {
            const convos = MOCK_ADMIN_CONVERSATIONS.filter(c => c.recipientId === agentId || c.recipientId === 'BROADCAST');
            resolve(JSON.parse(JSON.stringify(convos)));
        }, apiDelay / 2);
    }),
    sendAgentMessage: (conversationId: string, text: string) => new Promise<Message>(resolve => {
        setTimeout(() => {
            const conversation = MOCK_ADMIN_CONVERSATIONS.find(c => c.id === conversationId);
            const newMessage: Message = { id: `agent-reply-${Date.now()}`, sender: 'AGENT', text, timestamp: Date.now() };
            if (conversation) {
                conversation.messages.push(newMessage);
                conversation.hasUnread = true; // Mark as unread for the admin
                chatService.emit(conversationId, newMessage);
            }
            resolve(newMessage);
        }, 200);
    }),

    getAgentStats: (agentId: string) => new Promise<AgentStats | null>(resolve => {
        setTimeout(() => {
            const stats = MOCK_AGENT_STATS.find(s => s.agentId === agentId);
            resolve(stats ? {...stats} : null);
        }, apiDelay);
    }),
    getAllAgentStats: () => new Promise(resolve => setTimeout(() => resolve([...MOCK_AGENT_STATS]), apiDelay)),

    
    // Chat
    logChatSession: (agentId: string, paidMinutesUsed: number, freeMinutesUsed: number) => new Promise(resolve => {
        setTimeout(() => {
            const stats = MOCK_AGENT_STATS.find(s => s.agentId === agentId);
            if (stats) {
                stats.paidMinutes += paidMinutesUsed;
                stats.freeMinutes += freeMinutesUsed;
                
                const today = new Date().toISOString().split('T')[0];
                const todayStat = stats.activityData.find(d => d.date === today);
                if (todayStat) {
                    todayStat.paid += paidMinutesUsed;
                    todayStat.free += freeMinutesUsed;
                } else {
                    stats.activityData.push({ date: today, paid: paidMinutesUsed, free: freeMinutesUsed });
                }
            }
            resolve({ success: true });
        }, 100);
    }),
    sendMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => new Promise(resolve => {
        setTimeout(() => {
            const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
            if (conversation) {
                const newMessage: Message = { ...message, id: `msg-${Date.now()}`, timestamp: Date.now() };
                conversation.messages.push(newMessage);
                chatService.emit(conversationId, newMessage);

                // If a client sends a message, simulate an agent auto-response for demo purposes
                if (message.sender === 'CLIENT') {
                    setTimeout(() => {
                         const agentResponse: Message = {
                            id: `msg-${Date.now() + 1}`,
                            sender: 'AGENT',
                            text: 'Je ressens une forte énergie autour de votre question...',
                            timestamp: Date.now(),
                        };
                        conversation.messages.push(agentResponse);
                        chatService.emit(conversationId, agentResponse);
                    }, 1500);
                }
                
                resolve(newMessage);
            }
        }, 200);
    }),

    subscribeToConversation: (conversationId: string, callback: ChatListener) => {
        chatService.subscribe(conversationId, callback);
    },

    unsubscribeFromConversation: (conversationId: string, callback: ChatListener) => {
        chatService.unsubscribe(conversationId, callback);
    },
};