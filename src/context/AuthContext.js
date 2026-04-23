// src/context/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { getAdmins, seedIfEmpty, writeAuditLog } from '../firebase/db';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => { try { return JSON.parse(sessionStorage.getItem('dt_user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);

  async function login(username, pin) {
    if (loading) return { ok: false, error: 'Login already in progress' };
    setLoading(true);
    try {
      await Promise.race([
        seedIfEmpty(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Login timed out')), 8000))
      ]);
      const admins = await Promise.race([
        getAdmins(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Login timed out')), 8000))
      ]);
      const found  = admins.find(a =>
        String(a.username || '').toLowerCase().trim() === username.trim() &&
        String(a.pin || '').trim() === pin.trim()
      );
      if (found) {
        const u = { id: found.id, name: found.name, username: found.username, role: found.role };
        sessionStorage.setItem('dt_user', JSON.stringify(u));
        setUser(u);
        await writeAuditLog({
          action: 'LOGIN',
          entity: 'admin',
          entityId: found.id,
          adminId: found.id,
          adminName: found.name,
          details: {
            username: found.username,
            role: found.role,
            description: 'Admin signed in',
          },
        });
        setLoading(false);
        return { ok: true };
      }
      setLoading(false);
      return { ok: false, error: 'Wrong username or PIN' };
    } catch (e) {
      setLoading(false);
      return { ok: false, error: 'Login timed out. Check Firebase config or internet.' };
    }
  }

  function logout() { sessionStorage.removeItem('dt_user'); setUser(null); }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
