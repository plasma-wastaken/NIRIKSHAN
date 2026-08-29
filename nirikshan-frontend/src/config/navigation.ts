/**
 * Role-aware navigation configuration.
 *
 * Maps each SRS UserRole to the sidebar nav items it sees.
 * This is the single source of truth for role-based navigation.
 *
 * When new portals are built (Supervisor, Citizen, etc.) simply add
 * their nav items here — do NOT create separate AppShell components.
 */
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle,
  RefreshCw,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Ticket,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../data/mockUser';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /** When true, match href exactly (including query). */
  exact?: boolean;
}

/** Nav items per role, under each portal's base path. */
export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  INSPECTOR: [
    { name: 'Dashboard',      href: '/inspector/dashboard',                    icon: LayoutDashboard },
    { name: 'My Inspections', href: '/inspector/inspections',                  icon: ClipboardList, exact: true },
    { name: 'Pending',        href: '/inspector/inspections?status=pending',   icon: Clock },
    { name: 'Completed',      href: '/inspector/inspections?status=completed', icon: CheckCircle },
    { name: 'Sync Status',    href: '/inspector/sync',                         icon: RefreshCw },
  ],
  SUPERVISOR: [
    { name: 'Dashboard',       href: '/supervisor/dashboard',  icon: LayoutDashboard },
    { name: 'Review Queue',    href: '/supervisor/reviews',    icon: ClipboardList },
    { name: 'High Risk',       href: '/supervisor/high-risk',  icon: AlertTriangle },
    { name: 'Complaints',      href: '/supervisor/complaints', icon: MessageSquare },
    { name: 'Tickets',         href: '/supervisor/tickets',    icon: Ticket },
  ],
  ADMIN: [
    { name: 'Dashboard',      href: '/admin/dashboard',    icon: LayoutDashboard },
    { name: 'Inspections',    href: '/admin/inspections',  icon: ClipboardList },
    { name: 'Complaints',     href: '/admin/complaints',   icon: MessageSquare },
    { name: 'Tickets',        href: '/admin/tickets',      icon: Ticket },
    { name: 'Team & Users',   href: '/admin/users',        icon: Users },
    { name: 'Reports',        href: '/admin/reports',      icon: BarChart3 },
  ],
  CITIZEN: [
    { name: 'Dashboard',    href: '/citizen/dashboard',  icon: LayoutDashboard },
    { name: 'My Complaints', href: '/citizen/complaints', icon: MessageSquare },
    { name: 'My Tickets',   href: '/citizen/tickets',    icon: Ticket },
    { name: 'Reports',      href: '/citizen/reports',    icon: FileText },
  ],
};

/** Home route for each role (used for post-login redirect). */
export const ROLE_HOME: Record<UserRole, string> = {
  INSPECTOR:  '/inspector/dashboard',
  SUPERVISOR: '/supervisor/dashboard',
  ADMIN: '/admin/dashboard',
  CITIZEN:    '/citizen/dashboard',
};
