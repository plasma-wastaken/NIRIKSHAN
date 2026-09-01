import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS, type MockUser, type UserRole } from '../data/mockUser';
import { ROLE_HOME } from '../config/navigation';
import { setAuthToken, clearAuthToken, getAuthToken, login as apiLogin, useMockApi } from '../services/api';
import type { LoginRequest, LoginResponse } from '../services/api';

interface AuthContextValue {
  currentUser: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateProfile: (patch: Partial<Pick<MockUser, 'name' | 'email' | 'phone' | 'avatar_url'>>) => void;
  login: (role: UserRole) => void;
  loginWithCredentials: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('nirikshan_user');
      
      if (token && storedUser) {
        try {
          const user = JSON.parse(storedUser) as MockUser;
          setCurrentUser(user);
          setAuthToken(token);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          clearAuthData();
        }
      }
      
      // For mock mode, default to inspector for development
      if (useMockApi && !currentUser) {
        setCurrentUser(MOCK_USERS['INSPECTOR']);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    setCurrentUser(null);
    clearAuthToken();
    localStorage.removeItem('nirikshan_user');
  };

  const updateProfile = (patch: Partial<Pick<MockUser, 'name' | 'email' | 'phone' | 'avatar_url'>>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...patch };
      setCurrentUser(updatedUser);
      localStorage.setItem('nirikshan_user', JSON.stringify(updatedUser));
    }
  };

  const login = (role: UserRole) => {
    const user = MOCK_USERS[role];
    setCurrentUser(user);
    localStorage.setItem('nirikshan_user', JSON.stringify(user));
    navigate(ROLE_HOME[role], { replace: true });
  };

  const loginWithCredentials = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response: LoginResponse = await apiLogin(credentials);
      
      // Store token
      setAuthToken(response.access_token);
      localStorage.setItem('nirikshan_token', response.access_token);
      
      // Create user object from response
      const user: MockUser = {
        user_id: response.user.user_id,
        name: response.user.name,
        email: response.user.email,
        phone: '', // Will be filled by backend in real implementation
        role: response.user.role as UserRole,
        account_status: 'ACTIVE',
        avatar_url: null,
        joined_at: new Date().toISOString(),
      };
      
      setCurrentUser(user);
      localStorage.setItem('nirikshan_user', JSON.stringify(user));
      
      // Navigate to role-specific home
      const homeRoute = ROLE_HOME[user.role as UserRole] || '/dashboard';
      navigate(homeRoute, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        isAuthenticated: !!currentUser, 
        isLoading,
        updateProfile, 
        login, 
        loginWithCredentials,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
