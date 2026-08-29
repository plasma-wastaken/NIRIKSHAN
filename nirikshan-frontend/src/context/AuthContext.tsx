import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS, type MockUser, type UserRole } from '../data/mockUser';
import { ROLE_HOME } from '../config/navigation';

interface AuthContextValue {
  currentUser: MockUser;
  updateProfile: (patch: Partial<Pick<MockUser, 'name' | 'email' | 'phone' | 'avatar_url'>>) => void;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with no user if in a real app, but for prototype default to null and handle routing, 
  // OR just default to Inspector for backward compatibility. Let's start with Inspector.
  const [currentUser, setCurrentUser] = useState<MockUser>(MOCK_USERS['INSPECTOR']);
  const navigate = useNavigate();

  const updateProfile = (patch: Partial<Pick<MockUser, 'name' | 'email' | 'phone' | 'avatar_url'>>) => {
    setCurrentUser((prev) => ({ ...prev, ...patch }));
  };

  const login = (role: UserRole) => {
    setCurrentUser(MOCK_USERS[role]);
    navigate(ROLE_HOME[role], { replace: true });
  };

  const logout = () => {
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ currentUser, updateProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
