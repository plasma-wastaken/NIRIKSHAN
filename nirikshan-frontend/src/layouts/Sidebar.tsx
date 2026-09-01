import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, X, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';
import { ROLE_NAV, ROLE_HOME } from '../config/navigation';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  const navItems = ROLE_NAV[currentUser.role] || [];
  const homePath = ROLE_HOME[currentUser.role] || '/';

  // Simple matching for active state, handling query params
  const isRouteActive = (itemHref: string, exact?: boolean) => {
    if (exact && (itemHref === '/inspector/inspections' || itemHref === '/citizen/complaints')) {
      return location.pathname === itemHref && location.search === '';
    }
    if (itemHref.includes('?')) {
      return location.pathname + location.search === itemHref;
    }
    return location.pathname.startsWith(itemHref);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-surface-950/80 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar component */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-white border-r border-surface-200 transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0 shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0 flex" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-surface-200 bg-surface-50">
          <Link to={homePath} className="flex items-center gap-2 text-primary-800">
            <ShieldCheck className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">NIRIKSHAN</span>
          </Link>
          <button 
            className="ml-auto lg:hidden text-surface-500 hover:text-surface-900"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = isRouteActive(item.href, item.exact);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-primary-50 text-primary-700 shadow-sm"
                      : "text-surface-600 hover:bg-surface-50 hover:text-surface-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary-600" : "text-surface-400 group-hover:text-surface-600"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-surface-200 p-4 bg-surface-50">
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="group flex items-center px-3 py-2.5 text-sm font-medium text-surface-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors w-full"
          >
            <LogOut className="mr-3 h-5 w-5 text-surface-400 group-hover:text-red-500 transition-colors" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
