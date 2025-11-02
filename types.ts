

export enum UserRole {
  CLIENT = 'CLIENT',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  paidMinutesBalance?: number;
  freeMinutesBalance?: number;
  status?: 'ACTIVE' | 'PENDING_VERIFICATION';
  // FIX: Add client-specific fields to the base User type to avoid unsafe casting.
  signupDate?: string;
  fullName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  favoritePsychicIds?: string[];
}

export interface PsychicProfile {
  id: string;
  agentId: string;
  name: string;
  specialty: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  isOnline: boolean;
}

export interface Client {
  id:string;
  username: string;
  email: string;
  signupDate: string;
  paidMinutesBalance: number;
  freeMinutesBalance: number;
  status: 'ACTIVE' | 'PENDING_VERIFICATION';
  fullName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  favoritePsychicIds?: string[];
}

export interface Agent {
  id: string;
  username: string;
  creationDate: string;
  psychicProfileIds: string[];
  isOnline: boolean;
}

export interface AgentActivity {
    date: string; // YYYY-MM-DD
    paid: number;
    free: number;
}

export interface AgentStats {
  agentId: string;
  paidMinutes: number;
  freeMinutes: number;
  activityData: AgentActivity[];
}

export interface SiteVisitData {
  date: string; // YYYY-MM-DD
  visits: number;
}

export interface SignupData {
  date: string; // YYYY-MM-DD
  signups: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  psychicId?: string;
  date: string;
}

export interface Message {
  id: string;
  sender: 'CLIENT' | 'AGENT' | 'ADMIN';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientUsername: string;
  psychicId: string;
  psychicName: string;
  messages: Message[];
  hasUnread: boolean;
}

export interface AdminConversation {
  id: string; // e.g., 'admin-chat-agent-1' or 'admin-chat-broadcast'
  recipientId: string; // agentId or 'BROADCAST'
  recipientName: string; // agent username or 'Tous les agents'
  messages: Message[];
  hasUnread: boolean;
}

export interface MinutePack {
    id: number;
    minutes: number;
    price: number;
    popular?: boolean;
}

export type Notification = {
  id: number;
  message: string;
  type: 'info' | 'warning';
};

export interface Horoscope {
  sign: string;
  icon: string;
  dateRange: string;
  prediction: string;
}

export interface PaymentHistoryItem {
    id: string;
    date: string;
    amount: number;
    description: string;
}