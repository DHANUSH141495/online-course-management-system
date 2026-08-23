import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coursify_token') || null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Helper fetch with auth headers
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const currentToken = localStorage.getItem('coursify_token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.error('API Fetch Network Error:', err);
      return { ok: false, status: 500, data: { message: 'Network or server connection failed.' } };
    }
  };

  // Verify stored token on app load
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('coursify_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token expired or invalid
            localStorage.removeItem('coursify_token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to verify token:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { ok, data } = await authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (ok) {
      localStorage.setItem('coursify_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };
    } else {
      showToast(data.message || 'Login failed', 'error');
      return { success: false, message: data.message };
    }
  };

  const register = async (name, email, password, role = 'student') => {
    const { ok, data } = await authFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    if (ok) {
      localStorage.setItem('coursify_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthModalOpen(false);
      showToast(`Account created! Welcome, ${data.user.name}`, 'success');
      return { success: true };
    } else {
      showToast(data.message || 'Registration failed', 'error');
      return { success: false, message: data.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('coursify_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const demoLogin = async (role = 'student') => {
    if (role === 'admin') {
      return await login('admin@coursify.com', 'Admin@123');
    } else {
      return await login('dhanush@gmail.com', 'Student@123');
    }
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        demoLogin,
        authFetch,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        showToast,
        toasts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
