import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../services/api';

export const useAuth = (type = 'login') => {
  const navigate = useNavigate();
  const { login, isServerOffline, setIsServerOffline } = useUser();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contact: '',
    companyId: '',
    officeId: '',
    role: 'EMPLOYEE'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    if (isServerOffline) {
      setError('Cannot connect to server. Please try again later.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/user/login', { 
        email: formData.email, 
        password: formData.password 
      });
      const { user, token } = response.data.data;
      login(user, token);
      
      // Check if location permission is already granted
      if ('permissions' in navigator) {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        if (permissionStatus.state === 'granted') {
          navigate('/dashboard');
        } else {
          navigate('/location-access');
        }
      } else {
        navigate('/location-access');
      }
    } catch (err) {
      if (err.isServerDown) {
        setIsServerOffline(true);
        setError('Server is currently offline. Please wait...');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/user/add-user', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleSignIn,
    handleRegister,
    showPassword,
    setShowPassword,
    error,
    setError,
    loading,
    isServerOffline
  };
};
