
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
  minutesBalance?: number;
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
  id: string;
  username: string;
  email: string;
  signupDate: string;
  minutesBalance: number;
}

export interface Agent {
  id: string;
  username: string;
  creationDate: string;
  psychicProfileIds: string[];
  isOnline: boolean;
}

export interface AgentStats {
  agentId: string;
  revenue: number;
  clients: number;
  chatHours: number;
}

export interface SiteVisitData {
  name: string;
  visits: number;
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
  sender: 'CLIENT' | 'AGENT';
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

export interface MinutePack {
    id: number;
    minutes: number;
    price: number;
}
