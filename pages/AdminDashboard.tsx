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
      <div className="px-2 mb-8">
        <img src="https://raw.githubusercontent.com/revovation6-debug/oraclia/12bb2594b6d2df065d70f7ad11593f4197e2e2d0/logo-oraclia2.png" alt="Oraclia Logo" className="h-20 w-auto" />
      </div>
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
            revenu: revenueData?.revenue.toFixed(2) || '0.00'
        };
    }).sort((a,b) => a.date.localeCompare(b.date));
    
    downloadCSV(combinedData, `oraclia_dashboard_${startDate}_${endDate}.csv`);
  };

  const chartTextColor = theme === 'dark' ? '#A0AEC0' : '#718096';
  const chartGridColor = theme === 'dark' ? '#4A5568' : '#e0e0e0';
  const chartTooltipStyle = {
      backgroundColor: theme === 'dark' ? '#2D3748' : '#FFFFFF',
      border: `1px solid ${chartGridColor}`
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-brand-text-dark dark:text-dark-text-primary">Dashboard Général</h2>
         <div className="flex items-center space-x-4">
            <DateRangeFilter 
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
            />
            <Button variant="ghost" onClick={handleDownloadDashboardData}>
                <DownloadIcon className="w-5 h-5 mr-2" />
                Exporter
            </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Chiffre d'Affaires (période)</p><p className="text-3xl font-bold text-green-500">{totalRevenue.toFixed(2)}€</p></Card>
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Clients (période)</p><p className="text-3xl font-bold text-brand-secondary">{newClientsInPeriod}</p></Card>
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Nombre de Clients (Total)</p><p className="text-3xl font-bold text-brand-primary">{totalClients}</p></Card>
        <Card><p className="text-brand-text-light dark:text-dark-text-secondary">Nombre d'Agents</p><p className="text-3xl font-bold text-purple-500">{agents.length}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
              <h3 className="text-xl font-bold mb-4 text-brand-text-dark dark:text-dark-text-primary">Visites du Site</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredVisits}>
                      <defs>
                          <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor}/>
                      <XAxis dataKey="date" stroke={chartTextColor} tickFormatter={(tick) => new Date(tick).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} />
                      <YAxis stroke={chartTextColor}/>
                      <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}/>
                      <Area type="monotone" dataKey="visits" stroke="#6C63FF" fill="url(#colorVisits)" name="Visites" />
                  </AreaChart>
              </ResponsiveContainer>
          </Card>
           <Card>
              <h3 className="text-xl font-bold mb-4 text-brand-text-dark dark:text-dark-text-primary">Inscriptions et Revenus</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor}/>
                    <XAxis dataKey="date" stroke={chartTextColor} tickFormatter={(tick) => new Date(tick).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}/>
                    <YAxis yAxisId="left" orientation="left" stroke="#34d399" />
                    <YAxis yAxisId="right" orientation="right" stroke="#fb923c" />
                    <Tooltip contentStyle={chartTooltipStyle} labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}/>
                    <Legend wrapperStyle={{ color: chartTextColor }} />
                    <Bar yAxisId="left" dataKey="revenue" fill="#34d399" name="Revenu (€)" />
                    {/* Note: You might need to combine signup data here if you want to show it on the same chart */}
                    {/* For now, we are just showing revenue */}
                </BarChart>
              </ResponsiveContainer>
          </Card>
      </div>
    </div>
  );
};
const AdminDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState<AdminPage>('dashboard');
  const { user } = useContext(AuthContext);

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      // ... other cases would be here
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-bg-light dark:bg-dark-bg-primary text-brand-text-dark dark:text-dark-text-primary font-sans">
      <AdminSidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
      <AdminAgentChat userRole={UserRole.ADMIN} />
    </div>
  );
};

export default AdminDashboard;