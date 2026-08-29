import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User, Shield, Bell, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from './ProfileAvatar';
import { RoleBadge } from './RoleBadge';
import { ROLE_HOME } from '../../config/navigation';

export const SettingsLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Create base path (e.g. '/inspector' or '/citizen')
  const basePortalPath = ROLE_HOME[currentUser.role]?.split('/dashboard')[0] || '/inspector';
  const basePath = `${basePortalPath}/profile`;

  const SETTINGS_NAV = [
    { name: 'Profile',       href: basePath,                   icon: User,         end: true },
    { name: 'Security',      href: `${basePath}/security`,     icon: Shield,       end: false },
    { name: 'Notifications', href: `${basePath}/notifications`,icon: Bell,         end: false },
    { name: 'Preferences',   href: `${basePath}/preferences`,  icon: SettingsIcon, end: false },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left sidebar ──────────────────────────────────────────────── */}
        <aside className="w-full lg:w-56 flex-shrink-0">
          {/* Mini user card */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-surface-200 shadow-sm mb-3">
            <ProfileAvatar
              name={currentUser.name}
              avatar_url={currentUser.avatar_url}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900 truncate">
                {currentUser.name}
              </p>
              <RoleBadge role={currentUser.role} size="sm" className="mt-0.5" />
            </div>
          </div>

          {/* Nav — horizontal scroll on mobile, vertical on desktop */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {SETTINGS_NAV.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ── Right content area ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
