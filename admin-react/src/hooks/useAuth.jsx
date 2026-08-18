import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('inkdraft_admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('inkdraft_admin_token', res.token);
        localStorage.setItem('inkdraft_admin_user', JSON.stringify(res.admin));
        setUser(res.admin);
        return { success: true };
      }
      return { success: false, message: res.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('inkdraft_admin_token');
    localStorage.removeItem('inkdraft_admin_user');
    setUser(null);
  };

  const isAuthenticated = !!user && !!localStorage.getItem('inkdraft_admin_token');

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
