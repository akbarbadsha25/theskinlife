import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ? buildUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ? buildUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function buildUser(user) {
    const meta = user.user_metadata || {};
    const name = meta.name || user.email;
    return {
      id: user.id,
      email: user.email,
      name,
      role: meta.role || 'receptionist',
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    };
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const isDoctor = currentUser?.role === 'doctor';
  const isReceptionist = currentUser?.role === 'receptionist';

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isDoctor, isReceptionist }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
