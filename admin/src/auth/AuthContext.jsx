import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, if we have a token, try to load the current user.
  useEffect(() => {
    let active = true;
    async function bootstrap() {
      if (!tokenStore.access && !tokenStore.refresh) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api('/auth/me');
        if (active) setUser(user);
      } catch {
        tokenStore.clear();
      } finally {
        if (active) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const data = await api('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    if (data.user.role !== 'super_admin') {
      tokenStore.clear();
      throw new Error('This account does not have admin access.');
    }
    tokenStore.set(data);
    setUser(data.user);
  }

  async function logout() {
    try {
      if (tokenStore.refresh) {
        await api('/auth/logout', { method: 'POST', auth: false, body: { refreshToken: tokenStore.refresh } });
      }
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
