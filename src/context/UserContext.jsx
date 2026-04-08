import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { checkServerHealth } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(true);

  // Global health polling
  const checkStatus = async () => {
    const isHealthy = await checkServerHealth();
    setIsServerOffline(!isHealthy);
    return isHealthy;
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    
    // MULTI-TAB SYNC: Listen for storage changes in other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Token removed in another tab -> Logout
          setUser(null);
          setToken(null);
        } else if (e.newValue !== token) {
          // Token changed in another tab -> Sync and fetch profile
          setToken(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await api.get('/user/profile');
          setUser(response.data.data.user);
          setIsServerOffline(false);
        } catch (error) {
          if (error.isServerDown) {
            setIsServerOffline(true);
          } else {
            console.error('Failed to fetch profile:', error);
            logout();
          }
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    setIsServerOffline(false);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch('/user/update-profile', profileData);
      setUser(response.data.data.user);
      setIsServerOffline(false);
      return response.data.data.user;
    } catch (error) {
      if (error.isServerDown) setIsServerOffline(true);
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, token, login, logout, 
      loading, updateProfile, 
      isServerOffline, setIsServerOffline, 
      checkStatus,
      showBottomNav, setShowBottomNav
    }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => useContext(UserContext);
