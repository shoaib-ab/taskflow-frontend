import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On every app load, ask the server who is currently logged in.
  // The httpOnly access token cookie is sent automatically.
  // If the access token is expired the axios interceptor will refresh it
  // before this request completes, so we always get an accurate answer.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch {
        // 401 means not authenticated — that is fine, just clear user
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // LOGIN — server sets httpOnly cookies; we just store the user in state
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network Error' };
    }
  };

  // REGISTER — same as login: server sets cookies, we store user in state
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setUser(res.data.user);
    } catch (error) {
      throw error.response ? error.response.data : { message: 'Network Error' };
    }
  };

  // LOGOUT — server clears cookies + invalidates refresh token in DB
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // If the server call fails we still clear local state
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser: setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
