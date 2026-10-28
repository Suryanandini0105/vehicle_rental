import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('driveease_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('driveease_token'));
  const [loading, setLoading] = useState(true);

  // Verify and fetch latest user info on mount if token exists
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('driveease_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('driveease_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session verification failed:', err.message);
          localStorage.removeItem('driveease_token');
          localStorage.removeItem('driveease_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('driveease_token', receivedToken);
      localStorage.setItem('driveease_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('driveease_token', receivedToken);
      localStorage.setItem('driveease_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please check inputs.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('driveease_token');
    localStorage.removeItem('driveease_user');
    setUser(null);
    setToken(null);
  };

  // Update current user state (e.g. after profile edit)
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('driveease_user', JSON.stringify(updatedUser));
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
