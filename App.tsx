
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { User } from './types';
import { UserRole } from './types';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import ClientDashboard from './pages/ClientDashboard';

export const AuthContext = React.createContext<{
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  updateBalance: () => {},
});


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user in localStorage
    const storedUser = localStorage.getItem('oraclia_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('oraclia_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('oraclia_user');
    setUser(null);
  };
  
  const updateBalance = (newBalance: number) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, minutesBalance: newBalance };
        localStorage.setItem('oraclia_user', JSON.stringify(updatedUser));
        return updatedUser;
    });
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-brand-gray text-white">Chargement...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateBalance }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/agent" element={user?.role === UserRole.AGENT ? <AgentDashboard /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={user?.role === UserRole.CLIENT ? <ClientDashboard /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
