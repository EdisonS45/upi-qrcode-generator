import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient(); // For clearing cache on logout

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        localStorage.setItem('token', token); // Ensure local storage is in sync
        try {
          // We use our central api client, it has the token
          const res = await api.get('/users/profile');
          setUser(res.data.data); // Our backend returns { success, data }
        } catch (error) {
          console.error('Failed to load user', error);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.data);
      setToken(res.data.data.token);
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data; // Return the whole response { success, data, message }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setUser(res.data.data);
      setToken(res.data.data.token);
      localStorage.setItem('token', res.data.data.token);
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    queryClient.clear(); // Clear all cached data
  };

  // This function is for the settings page
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);