import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { AuthContext, ThemeContext } from '../App';
import type { SiteVisitData, Client, Agent, AgentStats, PsychicProfile, Review, SignupData } from '../types';
import { UserRole } from '../types';
import { mockApi } from '../services/mockData';
import { Card, Button, Input, Modal } from '../components/UI';
import { BarChartIcon, UsersIcon, MessageCircleIcon, SettingsIcon, LogOutIcon, DownloadIcon, SunIcon, MoonIcon } from '../components/Icons';
import { AdminAgentChat } from '../components/AdminAgentChat';
import { downloadCSV } from '../utils';

const PRICE_PER_MINUTE = 3; // 3€ per minute

type AdminPage = 'dashboard' | 'manageLogs' | 'managePsychics' | 'agentStats' | 'generateReviews' | 'profile';

const DateRangeFilter: React.FC<{
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => (
  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark-bg-secondary p-2 rounded-lg">
      <label htmlFor="start-date" className="text-sm font-medium text-brand-text-light dark:text-dark-text-secondary">Du</label>
      <Input 
          type="date" 
          id="start-date" 
          value={startDate} 
          onChange={e => onStartDateChange(e.target.value)} 
          className="!py-1 !px-2 bg-brand-bg-white dark:bg-dark-bg-primary" 
      />
      <label htmlFor="end-date" className="text-sm font-medium text-brand-text-light dark:text-dark-text-secondary">Au</label>
      <Input 
          type="date" 
          id="end-date" 
          value={endDate} 
          onChange={e => onEndDateChange(e.target.value)} 
          className="!py-1 !px-2 bg-brand-bg-white dark:bg-dark-bg-primary" 
      />
  </div>
);


const AdminSidebar: React.FC<{ activePage: AdminPage, setActivePage: (page: AdminPage) => void }> = ({ activePage, setActivePage }) => {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const NavItem: React.FC<{ page: AdminPage, icon: React.ReactNode, children: React.ReactNode }> = ({ page, icon, children }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activePage === page ? 'bg-brand-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary'}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );

  return (
    <aside className="w-64 bg-brand-bg-white dark:bg-dark-bg-secondary p-4 flex flex-col border-r border-gray-200 dark:border-dark-border">
      <h1 className="text-3xl font-bold font-serif text-brand-primary mb-8 px-2">Oraclia<span className="text-sm text-brand-text-dark dark:text-dark-text-primary"> Admin</span></h1>
      <nav className="flex-grow space-y-2">
        <NavItem page="dashboard" icon={<BarChartIcon className="w-6 h-6" />}>Dashboard</NavItem>
        <NavItem page="manageLogs" icon={<UsersIcon className="w-6 h-6" />}>Gérer les Logs</NavItem>
        <NavItem page="managePsychics" icon={<UsersIcon className="w-6 h-6" />}>Gérer les Profils</NavItem>
        <NavItem page="agentStats" icon={<BarChartIcon className="w-6 h-6" />}>Statistiques Agents</NavItem>
        <NavItem page="generateReviews" icon={<MessageCircleIcon className="w-6 h-6" />}>Gérer les Avis</NavItem>
        <NavItem page="profile" icon={<SettingsIcon className="w-6 h-6" />}>Mon Profil</NavItem>
      </nav>
      <div className="mt-auto">
         <div className="p-2 flex justify-center mb-2">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary hover:bg-gray-300 dark:hover:bg-dark-border"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
         </div>
         <button onClick={logout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors">
            <LogOutIcon className="w-6 h-6" />
            <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};


const DashboardPage: React.FC = () => {
  const [allVisits, setAllVisits] = useState<SiteVisitData[]>([]);
  const [allSignups, setAllSignups] = useState<SignupData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allAgentStats, setAllAgentStats] = useState<AgentStats[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [minutesToAdd, setMinutesToAdd] = useState(0);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const { theme } = useContext(ThemeContext);

  const fetchData = () => {
    mockApi.getSiteVisits().then(data => setAllVisits(data as SiteVisitData[]));
    mockApi.getSignupData().then(data => setAllSignups(data as SignupData[]));
    mockApi.getClients().then(data => setClients(data as Client[]));
    mockApi.getAgents().then(data => setAgents(data as Agent[]));
    mockApi.getAllAgentStats().then(d => setAllAgentStats(d as AgentStats[]));
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleAddMinutes = async () => {
    if (selectedClient && minutesToAdd > 0) {
        await mockApi.addFreeMinutesToClient(selectedClient.id, minutesToAdd);
        fetchData(); // Refresh data
        setSelectedClient(null);
        setMinutesToAdd(0);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
        await mockApi.deleteClient(clientId);
        fetchData(); // Refresh data
    }
  };

    const filterByDate = <T extends { date: string }>(data: T[]): T[] => {
        return data.filter(item => {
            const itemDate = new Date(item.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
        });
    };

    const filteredVisits = filterByDate(allVisits);
    const filteredSignups = filterByDate(allSignups);

    const dailyRevenueData = useMemo(() => {
        const revenueByDate: { [date: string]: number } = {};
        allAgentStats.forEach(agent => {
            agent.activityData.forEach(day => {
                if (!revenueByDate[day.date]) {
                    revenueByDate[day.date] = 0;
                }
                revenueByDate[day.date] += day.paid * PRICE_PER_MINUTE;
            });
        });
        
        const dataArray = Object.entries(revenueByDate).map(([date, revenue]) => ({ date, revenue }));
        
        return filterByDate(dataArray);
    }, [allAgentStats, startDate, endDate]);


    const filteredAgentStats = allAgentStats.map(agentStat => {
        const filteredActivity = agentStat.activityData.filter(activity => {
            const activityDate = new Date(activity.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return activityDate >= start && activityDate <= end;
        });

        const paidMinutes = filteredActivity.reduce((acc, day) => acc + day.paid, 0);
        const freeMinutes = filteredActivity.reduce((acc, day) => acc + day.free, 0);
        
        return { ...agentStat, paidMinutes, freeMinutes };
    });

  const totalPaidMinutes = filteredAgentStats.reduce((acc, stat) => acc + stat.paidMinutes, 0);
  const totalRevenue = totalPaidMinutes * PRICE_PER_MINUTE;
  const totalClients = clients.length;
  const newClientsInPeriod = filteredSignups.reduce((sum, s) => sum + s.signups, 0);

  const handleDownloadDashboardData = () => {
    const allDates = new Set([
        ...filteredVisits.map(d => d.date),
        ...filteredSignups.map(d => d.date),
        ...dailyRevenueData.map(d => d.date)
    ]);

    const combinedData = Array.from(allDates).map(date => {
        const visitData = filteredVisits.find(d => d.date === date);
        const signupData = filteredSignups.find(d => d.date === date);
        const revenueData = dailyRevenueData.find(d => d.date === date);
        return {
            date: date,
            visites: visitData?.visits || 0,
            inscriptions: signupData?.signups || 0,
            revenu_EUR: revenueData?.revenue ? revenueData.revenue.toFixed(2) : '0.00',
        };
    }).sort((a, b) => a.date.localeCompare(b.date));

    downloadCSV(combinedData, `oraclia_dashboard_du_${startDate}_au_${endDate}.csv`);
  };
  
  const chartTextColor = theme === 'dark' ? '#A0AEC0' : '#718096';
  const chartGridColor = theme === 'dark' ? '#4A5568' : '#e0e0e0';
  const chartTooltipStyle = {
      backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
      border: `1px solid ${chartGridColor}`
  };


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-brand-text-dark dark:text-dark-text-primary">Dashboard Général</h2>
            <div className="flex items-center space-x-2">
                <DateRangeFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                <Button variant="ghost" onClick={handleDownloadDashboardData} title="Télécharger les données de la période en CSV" className="!p-2">
                    <DownloadIcon className="w-6 h-6" />
                </Button>
            </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Visites (période)</p><p className="text-4xl font-bold text-brand-primary">{filteredVisits.reduce((sum, v) => sum + v.visits, 0).toLocaleString('fr-FR')}</p></Card>
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Clients Inscrits</p><p className="text-4xl font-bold text-brand-primary">{totalClients} <span className="text-lg text-green-500">(+{newClientsInPeriod} sur la période)</span></p></Card>
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Agents en ligne</p><p className="text-4xl font-bold text-brand-primary">{agents.filter(a => a.isOnline).length} / {agents.length}</p></Card>
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Revenu (période)</p><p className="text-4xl font-bold text-brand-primary">{totalRevenue.toLocaleString('fr-FR')}€</p></Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Statistiques de Visite</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredVisits}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
            <XAxis dataKey="date" stroke={chartTextColor} tickFormatter={(tick) => new Date(tick).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
            <YAxis stroke={chartTextColor} />
            <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')} />
            <Area type="monotone" dataKey="visits" name="Visites" stroke="#FF6B6B" fillOpacity={1} fill="url(#colorVisits)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Inscriptions sur la période</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={filteredSignups}>
                    <defs>
                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="date" stroke={chartTextColor} tickFormatter={(tick) => new Date(tick).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
                    <YAxis stroke={chartTextColor} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')} />
                    <Area type="monotone" dataKey="signups" name="Inscriptions" stroke="#6C63FF" fillOpacity={1} fill="url(#colorSignups)" />
                </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Revenu sur la période (€)</h3>
             <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyRevenueData}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="date" stroke={chartTextColor} tickFormatter={(tick) => new Date(tick).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
                    <YAxis stroke={chartTextColor} tickFormatter={(value) => `${value}€`} />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')} formatter={(value: number) => `${value.toLocaleString('fr-FR')}€`} />
                    <Area type="monotone" dataKey="revenue" name="Revenu" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
            </ResponsiveContainer>
          </Card>
      </div>
      
      <Card>
        <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Gérer les Clients</h3>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-gray-50 dark:bg-dark-bg-primary">
              <tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="p-2">ID</th><th className="p-2">Username</th><th className="p-2">Email</th><th className="p-2">Solde Payé</th><th className="p-2">Solde Gratuit</th><th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-primary">
                  <td className="p-2">{client.id}</td>
                  <td className="p-2">{client.username}</td>
                  <td className="p-2">{client.email}</td>
                  <td className="p-2 text-green-600 dark:text-green-400">{client.paidMinutesBalance}</td>
                  <td className="p-2 text-red-600 dark:text-red-400">{client.freeMinutesBalance}</td>
                  <td className="p-2 space-x-2">
                    <Button variant="ghost" className="text-xs !py-1" onClick={() => setSelectedClient(client)}>Ajouter Min Gratuites</Button>
                    <Button variant="ghost" className="text-red-500 hover:text-red-500 text-xs !py-1" onClick={() => handleDeleteClient(client.id)}>Supprimer</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!selectedClient} onClose={() => setSelectedClient(null)} title={`Ajouter des minutes gratuites à ${selectedClient?.username}`}>
          <div className="space-y-4">
            <Input label="Minutes à ajouter" type="number" value={minutesToAdd} onChange={(e) => setMinutesToAdd(parseInt(e.target.value, 10))} />
            <Button onClick={handleAddMinutes} variant="secondary" className="w-full">Confirmer</Button>
          </div>
      </Modal>
    </div>
  );
};

const ManageLogsPage: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [newAgentUsername, setNewAgentUsername] = useState('');

    const fetchData = () => {
        mockApi.getAgents().then(d => setAgents(d as Agent[]));
    };

    useEffect(() => { fetchData() }, []);
    
    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newAgentUsername.trim()) {
            try {
                await mockApi.createAgent(newAgentUsername);
                setNewAgentUsername('');
                fetchData();
            } catch (error) {
                alert(error);
            }
        }
    };

    const handleDeleteAgent = async (agentId: string) => {
        if (window.confirm('Êtes-vous sûr ? Supprimer un agent désassignera ses profils de voyants.')) {
            await mockApi.deleteAgent(agentId);
            fetchData();
        }
    };
    
    return (
      <div className="space-y-6">
         <h2 className="text-3xl font-bold text-brand-text-dark dark:text-dark-text-primary">Gérer les Agents (Logs)</h2>
         <Card>
            <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Créer un Agent</h3>
            <form onSubmit={handleCreateAgent} className="flex space-x-2">
                <Input placeholder="Nom d'utilisateur de l'agent" value={newAgentUsername} onChange={e => setNewAgentUsername(e.target.value)} required />
                <Button type="submit" variant="secondary">Créer</Button>
            </form>
            <p className="text-xs text-brand-text-light dark:text-dark-text-secondary mt-2">Le mot de passe par défaut est généré et doit être changé par l'agent.</p>
         </Card>
         <Card>
            <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Agents existants</h3>
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead><tr className="border-b border-gray-200 dark:border-dark-border"><th className="p-2">ID</th><th className="p-2">Username</th><th className="p-2">Date Création</th><th className="p-2">Actions</th></tr></thead>
                <tbody>
                  {agents.map(agent => (
                    <tr key={agent.id} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-primary">
                      <td className="p-2">{agent.id}</td>
                      <td className="p-2">{agent.username}</td><td className="p-2">{agent.creationDate}</td>
                      <td className="p-2"><Button variant="ghost" className="text-red-500 hover:text-red-500 text-xs !py-1" onClick={() => handleDeleteAgent(agent.id)}>Supprimer</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </Card>
      </div>
    );
};

const ManagePsychicsPage: React.FC = () => {
    const [psychics, setPsychics] = useState<PsychicProfile[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPsychic, setEditingPsychic] = useState<Partial<PsychicProfile> | null>(null);

    const fetchData = () => {
        mockApi.getPsychics().then(d => setPsychics(d as PsychicProfile[]));
        mockApi.getAgents().then(d => setAgents(d as Agent[]));
    };

    useEffect(() => { fetchData() }, []);

    const handleOpenModal = (psychic: PsychicProfile | null = null) => {
        setEditingPsychic(psychic ? { ...psychic } : { agentId: '', name: '', specialty: '', description: '', imageUrl: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPsychic(null);
    };
    
    const handleSave = async () => {
        if (!editingPsychic) return;
        if (editingPsychic.id) { // Update
            await mockApi.updatePsychic(editingPsychic.id, editingPsychic);
        } else { // Create
            await mockApi.createPsychic(editingPsychic as any);
        }
        fetchData();
        handleCloseModal();
    };

    const handleDelete = async (psychicId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce profil de voyant ?')) {
            await mockApi.deletePsychic(psychicId);
            fetchData();
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditingPsychic(prev => prev ? { ...prev, [name]: value } : null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-brand-text-dark dark:text-dark-text-primary">Gérer les Profils de Voyants</h2>
                <Button onClick={() => handleOpenModal()} variant="secondary">Créer un Profil</Button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-dark-border">
                                <th className="p-2">Nom</th><th className="p-2">Spécialité</th><th className="p-2">Agent Assigné</th><th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {psychics.map(p => (
                                <tr key={p.id} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-primary">
                                    <td className="p-2 flex items-center space-x-3"><img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover" /><span>{p.name}</span></td>
                                    <td className="p-2">{p.specialty}</td>
                                    <td className="p-2">{agents.find(a => a.id === p.agentId)?.username || 'N/A'}</td>
                                    <td className="p-2 space-x-2">
                                        <Button variant="ghost" className="text-xs !py-1" onClick={() => handleOpenModal(p)}>Modifier</Button>
                                        <Button variant="ghost" className="text-red-500 hover:text-red-500 text-xs !py-1" onClick={() => handleDelete(p.id)}>Supprimer</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPsychic?.id ? 'Modifier le Profil' : 'Créer un Profil'}>
                {editingPsychic && <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                    <Input label="Nom" name="name" value={editingPsychic.name} onChange={handleInputChange} required />
                    <Input label="Spécialité" name="specialty" value={editingPsychic.specialty} onChange={handleInputChange} required />
                    <Input label="URL de l'image" name="imageUrl" value={editingPsychic.imageUrl} onChange={handleInputChange} required />
                    <div>
                        <label className="block text-sm font-medium text-brand-text-dark dark:text-dark-text-primary mb-1">Description</label>
                        <textarea name="description" value={editingPsychic.description} onChange={handleInputChange} className="w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary placeholder-brand-text-light focus:outline-none focus:ring-2 focus:ring-brand-primary" required />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-brand-text-dark dark:text-dark-text-primary mb-1">Agent Assigné</label>
                         <select name="agentId" value={editingPsychic.agentId} onChange={handleInputChange} className="w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary" required>
                             <option value="">-- Sélectionner un agent --</option>
                             {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.username}</option>)}
                         </select>
                    </div>
                    <Button type="submit" variant="secondary" className="w-full">Sauvegarder</Button>
                </form>}
            </Modal>
        </div>
    );
};


const AgentStatsPage: React.FC = () => {
    const [allStats, setAllStats] = useState<AgentStats[]>([]);
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const { theme } = useContext(ThemeContext);

    useEffect(() => { mockApi.getAllAgentStats().then(d => setAllStats(d as AgentStats[])) }, []);

     const filteredStats = allStats.map(agentStat => {
        const filteredActivity = agentStat.activityData.filter(activity => {
            const activityDate = new Date(activity.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return activityDate >= start && activityDate <= end;
        });

        const paidMinutes = filteredActivity.reduce((acc, day) => acc + day.paid, 0);
        const freeMinutes = filteredActivity.reduce((acc, day) => acc + day.free, 0);
        
        return {
            agentId: agentStat.agentId,
            paidMinutes,
            freeMinutes,
        };
    });

    const totalPaidMinutes = filteredStats.reduce((acc, agentStat) => acc + agentStat.paidMinutes, 0);
    const totalFreeMinutes = filteredStats.reduce((acc, agentStat) => acc + agentStat.freeMinutes, 0);
    const grandTotalMinutes = totalPaidMinutes + totalFreeMinutes;
    const totalRevenue = totalPaidMinutes * PRICE_PER_MINUTE;

    const handleDownloadAgentStats = () => {
        const dataToDownload = filteredStats.map(stat => ({
            agent_id: stat.agentId,
            minutes_payantes: stat.paidMinutes,
            minutes_gratuites: stat.freeMinutes,
            total_minutes: stat.paidMinutes + stat.freeMinutes,
            revenu_estime_EUR: (stat.paidMinutes * PRICE_PER_MINUTE).toFixed(2)
        }));
        downloadCSV(dataToDownload, `oraclia_stats_agents_du_${startDate}_au_${endDate}.csv`);
    };
    
    const chartTextColor = theme === 'dark' ? '#A0AEC0' : '#718096';
    const chartGridColor = theme === 'dark' ? '#4A5568' : '#e0e0e0';
    const chartTooltipStyle = {
      backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
      border: `1px solid ${chartGridColor}`
    };

    return (
        <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-brand-text-dark dark:text-dark-text-primary">Statistiques des Agents</h2>
            <div className="flex items-center space-x-2">
                <DateRangeFilter startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
                <Button variant="ghost" onClick={handleDownloadAgentStats} title="Télécharger les statistiques des agents en CSV" className="!p-2">
                    <DownloadIcon className="w-6 h-6" />
                </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Minutes Payantes (période)</p><p className="text-3xl font-bold text-green-500">{totalPaidMinutes.toLocaleString('fr-FR')}</p></Card>
            <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Minutes Gratuites (période)</p><p className="text-3xl font-bold text-red-500">{totalFreeMinutes.toLocaleString('fr-FR')}</p></Card>
            <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Total Minutes (période)</p><p className="text-3xl font-bold text-brand-primary">{grandTotalMinutes.toLocaleString('fr-FR')}</p></Card>
            <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Revenu (période)</p><p className="text-3xl font-bold text-brand-primary">{totalRevenue.toLocaleString('fr-FR')}€</p></Card>
         </div>

         <Card>
            <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Productivité par Agent (Total Minutes sur période)</h3>
             <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis type="number" stroke={chartTextColor} />
                    <YAxis type="category" dataKey="agentId" stroke={chartTextColor} width={100} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{fill: theme === 'dark' ? '#4A5568' : '#f1f5f9'}} formatter={(value, name) => [`${value} min (${(Number(value) * PRICE_PER_MINUTE).toLocaleString('fr-FR')}€)`, name === 'paidMinutes' ? 'Payantes' : 'Gratuites']} />
                    <Legend wrapperStyle={{ color: chartTextColor }}/>
                    <Bar dataKey="paidMinutes" stackId="a" fill="#22c55e" name="Minutes Payantes" />
                    <Bar dataKey="freeMinutes" stackId="a" fill="#ef4444" name="Minutes Gratuites" />
                </BarChart>
            </ResponsiveContainer>
         </Card>
        </div>
    );
};

const GenerateReviewsPage: React.FC = () => {
    const [psychics, setPsychics] = useState<PsychicProfile[]>([]);
    const [formState, setFormState] = useState({ author: '', rating: 5, text: '', psychicId: ''});

    useEffect(() => {
        mockApi.getPsychics().then(d => setPsychics(d as PsychicProfile[]));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({...prev, [name]: name === 'rating' ? parseInt(value, 10) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { author, rating, text, psychicId } = formState;
        if (!author || !text) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        await mockApi.createReview({ author, rating, text, psychicId: psychicId || undefined });
        alert('Avis créé avec succès !');
        setFormState({ author: '', rating: 5, text: '', psychicId: ''});
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-brand-text-dark dark:text-dark-text-primary">Gérer les Avis</h2>
            <Card>
                <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Créer un nouvel avis</h3>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input label="Auteur" name="author" value={formState.author} onChange={handleInputChange} required />
                    <Input label="Note (1-5)" name="rating" type="number" min="1" max="5" value={formState.rating} onChange={handleInputChange} required />
                    <div>
                         <label className="block text-sm font-medium text-brand-text-dark dark:text-dark-text-primary mb-1">Voyant concerné (Optionnel)</label>
                         <select name="psychicId" value={formState.psychicId} onChange={handleInputChange} className="w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary">
                             <option value="">Avis général sur le site</option>
                             {psychics.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-dark dark:text-dark-text-primary mb-1">Texte de l'avis</label>
                        <textarea name="text" value={formState.text} onChange={handleInputChange} rows={4} className="w-full bg-brand-bg-light dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded-lg px-3 py-2 text-brand-text-dark dark:text-dark-text-primary placeholder-brand-text-light dark:placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary" required />
                    </div>
                    <Button type="submit" variant="secondary">Créer l'avis</Button>
                </form>
            </Card>
            <Card>
                 <h3 className="text-xl font-bold mb-4 dark:text-dark-text-primary">Avis en attente de validation</h3>
                 <p className="text-brand-text-light dark:text-dark-text-secondary">Aucun avis en attente.</p>
            </Card>
        </div>
    );
};

const AdminProfilePage: React.FC = () => {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas.');
            return;
        }

        try {
            // In a real app, you'd send this to the backend for validation and update.
            // Here, we just simulate the update by updating the context.
            if(user) {
                // We simulate a password check
                if (formData.currentPassword && formData.currentPassword !== 'admin123') {
                     setError('Le mot de passe actuel est incorrect.');
                     return;
                }

                const updatedUser = { ...user, email: formData.email };
                login(updatedUser); // Using login to update the user in context and localStorage
                setSuccess('Profil mis à jour avec succès !');

                 setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-brand-text-dark dark:text-dark-text-primary">Mon Profil</h2>
            <Card className="max-w-2xl">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input 
                        label="Nom d'utilisateur" 
                        name="username" 
                        value={user?.username || ''} 
                        disabled 
                        className="bg-gray-200 dark:bg-dark-bg-primary dark:border-dark-border cursor-not-allowed"
                    />
                    <Input 
                        label="Adresse e-mail" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                    />
                    <p className="text-sm text-brand-text-light dark:text-dark-text-secondary pt-4 border-t border-gray-200 dark:border-dark-border">Changer le mot de passe</p>
                    <Input 
                        label="Mot de passe actuel" 
                        name="currentPassword" 
                        type="password" 
                        value={formData.currentPassword} 
                        onChange={handleInputChange} 
                        placeholder="Laissez vide pour ne pas changer"
                    />
                    <Input 
                        label="Nouveau mot de passe" 
                        name="newPassword" 
                        type="password" 
                        value={formData.newPassword} 
                        onChange={handleInputChange}
                        placeholder="Laissez vide pour ne pas changer"
                    />
                    <Input 
                        label="Confirmer le nouveau mot de passe" 
                        name="confirmPassword" 
                        type="password" 
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    <Button type="submit" variant="secondary">Mettre à jour le profil</Button>
                </form>
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
      case 'managePsychics': return <ManagePsychicsPage />;
      case 'agentStats': return <AgentStatsPage />;
      case 'generateReviews': return <GenerateReviewsPage />;
      case 'profile': return <AdminProfilePage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg-light dark:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary">
      <AdminSidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
      <AdminAgentChat userRole={UserRole.ADMIN} />
    </div>
  );
};

export default AdminDashboard;