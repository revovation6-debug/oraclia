
import React, { useState, useEffect, useContext } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { AuthContext } from '../App';
import type { SiteVisitData, Client, Agent, AgentStats, Review } from '../types';
import { mockApi } from '../services/mockData';
import { Card, Button, Input, Modal } from '../components/UI';
import { BarChartIcon, UsersIcon, MessageCircleIcon, SettingsIcon, LogOutIcon } from '../components/Icons';

type AdminPage = 'dashboard' | 'manageLogs' | 'agentStats' | 'generateReviews' | 'profile';

const AdminSidebar: React.FC<{ activePage: AdminPage, setActivePage: (page: AdminPage) => void }> = ({ activePage, setActivePage }) => {
  const { logout } = useContext(AuthContext);
  
  const NavItem: React.FC<{ page: AdminPage, icon: React.ReactNode, children: React.ReactNode }> = ({ page, icon, children }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activePage === page ? 'bg-brand-purple-light text-white' : 'hover:bg-brand-light-gray text-gray-300'}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-brand-gray p-4 flex flex-col">
      <h1 className="text-3xl font-bold font-serif text-brand-gold mb-8 px-2">Oraclia<span className="text-sm text-white"> Admin</span></h1>
      <nav className="flex-grow space-y-2">
        <NavItem page="dashboard" icon={<BarChartIcon className="w-6 h-6" />}>Dashboard</NavItem>
        <NavItem page="manageLogs" icon={<UsersIcon className="w-6 h-6" />}>Gérer les Logs</NavItem>
        <NavItem page="agentStats" icon={<BarChartIcon className="w-6 h-6" />}>Statistiques Agents</NavItem>
        <NavItem page="generateReviews" icon={<MessageCircleIcon className="w-6 h-6" />}>Générer des Avis</NavItem>
        <NavItem page="profile" icon={<SettingsIcon className="w-6 h-6" />}>Mon Profil</NavItem>
      </nav>
      <div className="mt-auto">
         <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-800/20 text-red-400">
            <LogOutIcon className="w-6 h-6" />
            <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};


const DashboardPage: React.FC = () => {
  const [visits, setVisits] = useState<SiteVisitData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [minutesToAdd, setMinutesToAdd] = useState(0);

  useEffect(() => {
    mockApi.getSiteVisits().then(data => setVisits(data as SiteVisitData[]));
    mockApi.getClients().then(data => setClients(data as Client[]));
    mockApi.getAgents().then(data => setAgents(data as Agent[]));
  }, []);
  
  const handleAddMinutes = async () => {
    if (selectedClient && minutesToAdd > 0) {
        await mockApi.addMinutesToClient(selectedClient.id, minutesToAdd);
        // Refresh client data
        mockApi.getClients().then(data => setClients(data as Client[]));
        setSelectedClient(null);
        setMinutesToAdd(0);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Dashboard Général</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><p className="text-gray-400">Visites du site (30j)</p><p className="text-4xl font-bold text-brand-gold">{visits.reduce((sum, v) => sum + v.visits, 0)}</p></Card>
        <Card><p className="text-gray-400">Clients Inscrits</p><p className="text-4xl font-bold text-brand-gold">{clients.length}</p></Card>
        <Card><p className="text-gray-400">Agents en ligne</p><p className="text-4xl font-bold text-brand-gold">{agents.filter(a => a.isOnline).length} / {agents.length}</p></Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold mb-4">Statistiques de Visite</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={visits}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
            <Area type="monotone" dataKey="visits" stroke="#FBBF24" fillOpacity={1} fill="url(#colorVisits)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      
      <Card>
        <h3 className="text-xl font-bold mb-4">Gérer les Clients</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-light-gray">
                <th className="p-2">ID</th><th className="p-2">Username</th><th className="p-2">Email</th><th className="p-2">Solde (min)</th><th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-b border-brand-light-gray hover:bg-brand-gray">
                  <td className="p-2">{client.id}</td>
                  <td className="p-2">{client.username}</td>
                  <td className="p-2">{client.email}</td>
                  <td className="p-2">{client.minutesBalance}</td>
                  <td className="p-2 space-x-2">
                    <Button variant="ghost" className="text-xs !py-1" onClick={() => setSelectedClient(client)}>Ajouter Min</Button>
                    <Button variant="ghost" className="text-red-400 hover:text-red-400 text-xs !py-1">Supprimer</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title={`Ajouter des minutes à ${selectedClient?.username}`}>
          <div className="space-y-4">
            <Input label="Minutes à ajouter" type="number" value={minutesToAdd} onChange={(e) => setMinutesToAdd(parseInt(e.target.value, 10))} />
            <Button onClick={handleAddMinutes} className="w-full">Confirmer</Button>
          </div>
      </Modal>
    </div>
  );
};

const ManageLogsPage: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    useEffect(() => { mockApi.getAgents().then(d => setAgents(d as Agent[])) }, []);
    
    return (
      <div className="space-y-6">
         <h2 className="text-3xl font-bold text-white">Gérer les Agents (Logs)</h2>
         <Card>
            <h3 className="text-xl font-bold mb-4">Créer un Agent</h3>
            {/* Form to create new agent */}
         </Card>
         <Card>
            <h3 className="text-xl font-bold mb-4">Agents existants</h3>
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b border-brand-light-gray"><th className="p-2">ID</th><th className="p-2">Username</th><th className="p-2">Date Création</th><th className="p-2">Actions</th></tr></thead>
                <tbody>
                  {agents.map(agent => (
                    <tr key={agent.id} className="border-b border-brand-light-gray hover:bg-brand-gray">
                      <td className="p-2">{agent.id}</td><td className="p-2">{agent.username}</td><td className="p-2">{agent.creationDate}</td>
                      <td className="p-2"><Button variant="ghost" className="text-red-400 hover:text-red-400 text-xs !py-1">Supprimer</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </Card>
      </div>
    );
};
const AgentStatsPage: React.FC = () => {
    const [stats, setStats] = useState<AgentStats[]>([]);
    useEffect(() => { mockApi.getAgentStats().then(d => setStats(d as AgentStats[])) }, []);
    
    return (
        <div className="space-y-6">
         <h2 className="text-3xl font-bold text-white">Statistiques des Agents</h2>
         <Card>
            <h3 className="text-xl font-bold mb-4">Productivité par Agent</h3>
             <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis type="category" dataKey="agentId" stroke="#9CA3AF" width={100} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#FBBF24" name="Chiffre d'affaires (€)" />
                    <Bar dataKey="clients" fill="#6D28D9" name="Clients Servis" />
                </BarChart>
            </ResponsiveContainer>
         </Card>
        </div>
    );
};
const GenerateReviewsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Gérer les Avis</h2>
            <Card>
                <h3 className="text-xl font-bold mb-4">Créer un nouvel avis</h3>
                <form className="space-y-4">
                    <Input label="Auteur" />
                    <Input label="Note (1-5)" type="number" min="1" max="5" />
                    <Input label="Texte de l'avis" />
                    <Button>Créer l'avis</Button>
                </form>
            </Card>
            <Card>
                 <h3 className="text-xl font-bold mb-4">Avis en attente de validation</h3>
                 <p className="text-gray-400">Aucun avis en attente.</p>
            </Card>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'manageLogs': return <ManageLogsPage />;
      case 'agentStats': return <AgentStatsPage />;
      case 'generateReviews': return <GenerateReviewsPage />;
      case 'profile': return <h2 className="text-3xl font-bold text-white">Mon Profil</h2>;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-light-gray text-gray-200">
      <AdminSidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
