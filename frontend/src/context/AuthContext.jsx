import { createContext, useContext, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../api/auth';

const AuthContext = createContext(null);

const storedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('shelfwatch_user'));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(localStorage.getItem('shelfwatch_token'));

  const persistSession = (data) => {
    localStorage.setItem('shelfwatch_token', data.token);
    localStorage.setItem('shelfwatch_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    const { data } = await loginRequest(payload);
    persistSession(data);
  };

  const register = async (payload) => {
    const { data } = await registerRequest(payload);
    persistSession(data);
  };

  const logout = () => {
    localStorage.removeItem('shelfwatch_token');
    localStorage.removeItem('shelfwatch_user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: Boolean(token), login, register, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
