import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('soutenza_theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('soutenza_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const refreshMe = async () => {
    try {
      const response = await client.get('/auth/me');
      setUser(response.data);
    } catch {
      setUser(null);
      localStorage.removeItem('soutenza_token');
    }
  };

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('soutenza_token');
      if (!token) {
        setLoading(false);
        return;
      }
      await refreshMe();
      setLoading(false);
    })();
  }, []);

  const login = async (email, password) => {
    const response = await client.post('/auth/login', { email, password });
    const payload = response.data;
    localStorage.setItem('soutenza_token', payload.token);
    await refreshMe();
    return payload;
  };

  const logout = async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // no-op
    }
    localStorage.removeItem('soutenza_token');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshMe,
      hasRole: (role) => user?.roles?.includes(role),
      theme,
      toggleTheme,
    }),
    [user, loading, theme],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
