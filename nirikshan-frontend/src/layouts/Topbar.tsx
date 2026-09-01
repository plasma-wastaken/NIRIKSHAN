import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, Settings, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { RoleBadge } from '../components/profile/RoleBadge';
import { ROLE_HOME } from '../config/navigation';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  const basePortalPath = ROLE_HOME[currentUser.role]?.split('/dashboard')[0] || '/inspector';
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // Close dropdown on navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const getPageTitle = () => {
    if (!currentUser) return 'NIRIKSHAN';
    
    const path = location.pathname;
    const search = location.search;
    
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/profile'))   return 'Account Settings';
    if (path.includes('/inspections')) {
      if (search.includes('status=pending')) return 'Pending Inspections';
      if (search.includes('status=completed')) return 'Completed Inspections';
      return 'My Inspections';
    }
    if (path.includes('/sync')) return 'Sync Status';
    return 'Inspector Portal';
  };

  const handleLogout = () => {
    // Simple frontend-only logout for prototype
    logout();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-surface-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-surface-600 hover:text-surface-900 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-surface-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center gap-x-6">
          <h1 className="text-xl font-semibold leading-6 text-surface-900 truncate min-w-0">
            {getPageTitle()}
          </h1>
          
          <div className="hidden lg:flex flex-1 max-w-md">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-surface-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-surface-900 ring-1 ring-inset ring-surface-300 placeholder:text-surface-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 bg-surface-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-surface-400 hover:text-surface-600 transition-colors relative">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* Network Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-green-700">ONLINE</span>
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-surface-200" aria-hidden="true" />

          {/* ── Profile Section & Dropdown ──────────────────────────────── */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-x-3 focus:outline-none rounded-full p-0.5 hover:bg-surface-50 transition-colors"
            >
              <ProfileAvatar
                name={currentUser.name}
                avatar_url={currentUser.avatar_url}
                size="sm"
                className="ring-2 ring-transparent group-hover:ring-surface-200 transition-all"
              />
              <div className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center">
                <span className="text-sm font-semibold leading-tight text-surface-900" aria-hidden="true">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-0.5">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-50 mt-2.5 w-60 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-surface-100 flex items-center gap-3">
                  <ProfileAvatar
                    name={currentUser.name}
                    avatar_url={currentUser.avatar_url}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-900 truncate">
                      {currentUser.name}
                    </p>
                    <RoleBadge role={currentUser.role} size="sm" className="mt-1" />
                  </div>
                </div>

                <div className="py-2">
                  <button
                    onClick={() => navigate(`${basePortalPath}/profile`)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => navigate(`${basePortalPath}/profile/preferences`)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-primary-600 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Preferences
                  </button>
                </div>

                <div className="py-2 border-t border-surface-100">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
