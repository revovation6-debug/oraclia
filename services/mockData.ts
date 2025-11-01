
import type { SiteVisitData, Client, Agent, PsychicProfile, AgentStats, Review, Conversation, Message, MinutePack } from '../types';

// Mock Data
export const MOCK_SITE_VISITS: SiteVisitData[] = [
  { name: 'Jan', visits: 4000 },
  { name: 'Feb', visits: 3000 },
  { name: 'Mar', visits: 5000 },
  { name: 'Apr', visits: 4500 },
  { name: 'May', visits: 6000 },
  { name: 'Jun', visits: 5500 },
  { name: 'Jul', visits: 7000 },
];

export let MOCK_CLIENTS: Client[] = [
  { id: '1234567', username: 'ClientFidele', email: 'fidele@email.com', signupDate: '2023-01-15', minutesBalance: 120 },
  { id: '7654321', username: 'NouveauClient', email: 'nouveau@email.com', signupDate: '2023-07-20', minutesBalance: 15 },
  { id: '1122334', username: 'CurieuxAstro', email: 'curieux@email.com', signupDate: '2023-06-01', minutesBalance: 0 },
];

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

export const MOCK_AGENT_STATS: AgentStats[] = [
    { agentId: 'agent-1', revenue: 5230, clients: 45, chatHours: 120 },
    { agentId: 'agent-2', revenue: 3105, clients: 30, chatHours: 85 },
    { agentId: 'agent-3', revenue: 4500, clients: 40, chatHours: 100 },
];

export let MOCK_REVIEWS: Review[] = [
    { id: 'rev-1', author: 'Sophie D.', rating: 5, text: 'Consultation incroyable avec Madame Irma, très précise !', psychicId: 'psychic-1', date: '2023-07-28' },
    { id: 'rev-2', author: 'Marc L.', rating: 5, text: 'Leo Astro a vu juste sur toute la ligne. Bluffant.', psychicId: 'psychic-2', date: '2023-07-27' },
    { id: 'rev-3', author: 'ClientAnonyme', rating: 5, text: 'Oraclia est la meilleure plateforme de voyance que j\'ai testée. Très pro.', date: '2023-07-25' },
    { id: 'rev-4', author: 'Julie B.', rating: 4, text: 'Clara Vision m\'a bien aidée, même si elle était un peu directe.', psychicId: 'psychic-3', date: '2023-07-22' },
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

export const MOCK_MINUTE_PACKS: MinutePack[] = [
    { id: 1, minutes: 5, price: 15 },
    { id: 2, minutes: 15, price: 45 },
    { id: 3, minutes: 30, price: 90 },
];

// Mock API Functions
const apiDelay = 500;

export const mockApi = {
    // General
    login: (username: string, password?: string) => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') resolve({ id: 'admin-user', username: 'admin', role: 'ADMIN' });
            else if (MOCK_AGENTS.find(a => a.username === username)) resolve({ id: MOCK_AGENTS.find(a => a.username === username)!.id, username, role: 'AGENT' });
            else if (MOCK_CLIENTS.find(c => c.username === username)) resolve({ id: MOCK_CLIENTS.find(c => c.username === username)!.id, username, role: 'CLIENT', minutesBalance: MOCK_CLIENTS.find(c=>c.username===username)!.minutesBalance });
            else reject(new Error('Invalid credentials'));
        }, apiDelay);
    }),
    
    // Admin
    getSiteVisits: () => new Promise(resolve => setTimeout(() => resolve(MOCK_SITE_VISITS), apiDelay)),
    getClients: () => new Promise(resolve => setTimeout(() => resolve(MOCK_CLIENTS), apiDelay)),
    deleteClient: (clientId: string) => new Promise(resolve => {
        setTimeout(() => {
            MOCK_CLIENTS = MOCK_CLIENTS.filter(c => c.id !== clientId);
            resolve({ success: true });
        }, apiDelay);
    }),
    addMinutesToClient: (clientId: string, minutes: number) => new Promise(resolve => {
        setTimeout(() => {
            const client = MOCK_CLIENTS.find(c => c.id === clientId);
            if (client) {
                client.minutesBalance += minutes;
            }
            resolve({ success: true, newBalance: client?.minutesBalance });
        }, apiDelay);
    }),
    getAgents: () => new Promise(resolve => setTimeout(() => resolve(MOCK_AGENTS), apiDelay)),
    getAgentStats: () => new Promise(resolve => setTimeout(() => resolve(MOCK_AGENT_STATS), apiDelay)),
    createAgent: (username: string) => new Promise(resolve => {
        setTimeout(() => {
            const newAgent: Agent = { id: `agent-${Date.now()}`, username, creationDate: new Date().toISOString().split('T')[0], psychicProfileIds: [], isOnline: false };
            MOCK_AGENTS.push(newAgent);
            resolve(newAgent);
        }, apiDelay);
    }),
    deleteAgent: (agentId: string) => new Promise(resolve => {
        setTimeout(() => {
            MOCK_AGENTS = MOCK_AGENTS.filter(a => a.id !== agentId);
            MOCK_PSYCHICS = MOCK_PSYCHICS.filter(p => p.agentId !== agentId);
            resolve({ success: true });
        }, apiDelay);
    }),
    createReview: (review: Omit<Review, 'id'>) => new Promise(resolve => {
        setTimeout(() => {
            const newReview: Review = { ...review, id: `rev-${Date.now()}` };
            MOCK_REVIEWS.unshift(newReview);
            resolve(newReview);
        }, apiDelay);
    }),

    // Public / Client
    getPsychics: () => new Promise(resolve => setTimeout(() => resolve(MOCK_PSYCHICS), apiDelay)),
    getHomepageReviews: () => new Promise(resolve => setTimeout(() => resolve(MOCK_REVIEWS.slice(0, 4)), apiDelay)),
    getMinutePacks: () => new Promise(resolve => setTimeout(() => resolve(MOCK_MINUTE_PACKS), apiDelay)),
    purchaseMinutes: (userId: string, packId: number) => new Promise(resolve => {
        setTimeout(() => {
            const pack = MOCK_MINUTE_PACKS.find(p => p.id === packId);
            const client = MOCK_CLIENTS.find(c => c.id === userId);
            if (pack && client) {
                client.minutesBalance += pack.minutes;
                resolve({ success: true, newBalance: client.minutesBalance });
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

    // Agent
    getAgentConversations: (agentId: string) => new Promise(resolve => {
        setTimeout(() => {
            const agent = MOCK_AGENTS.find(a => a.id === agentId);
            if (!agent) return resolve([]);
            const convos = MOCK_CONVERSATIONS.filter(c => agent.psychicProfileIds.includes(c.psychicId));
            resolve(convos);
        }, apiDelay);
    }),
    
    // Chat
    sendMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => new Promise(resolve => {
        setTimeout(() => {
            const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
            if (conversation) {
                const newMessage: Message = { ...message, id: `msg-${Date.now()}`, timestamp: Date.now() };
                conversation.messages.push(newMessage);
                resolve(newMessage);
            }
        }, 200);
    }),
};
