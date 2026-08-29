/**
 * Centralized mock current-user state.
 * Field names use snake_case to match the SRS data contract (Section 6.1).
 * Role values match the exact SRS enum: CITIZEN | INSPECTOR | SUPERVISOR | DEPT_ADMIN | GOVT_ADMIN
 *
 * DO NOT connect this to the backend yet.
 * When real auth ships, replace MOCK_CURRENT_USER with the decoded JWT payload
 * returned by POST /auth/me on the FastAPI layer.
 */

export type UserRole =
  | 'CITIZEN'
  | 'INSPECTOR'
  | 'SUPERVISOR'
  | 'ADMIN';

export interface MockUser {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  /** account_status is server-controlled — never mutated on the frontend */
  account_status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  /** null → show initials fallback in ProfileAvatar */
  avatar_url: string | null;
  /** ISO 8601 — set by server on registration */
  joined_at: string;
}

/** One realistic mock user per role. */
export const MOCK_USERS: Record<UserRole, MockUser> = {
  INSPECTOR: {
    user_id: 'USR-INS-001',
    name: 'Jane Doe',
    email: 'jane.doe@nirikshan.gov.in',
    phone: '+91 98100 00001',
    role: 'INSPECTOR',
    account_status: 'ACTIVE',
    avatar_url: null,
    joined_at: '2024-03-15T09:00:00Z',
  },
  SUPERVISOR: {
    user_id: 'USR-SUP-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@nirikshan.gov.in',
    phone: '+91 98100 00002',
    role: 'SUPERVISOR',
    account_status: 'ACTIVE',
    avatar_url: null,
    joined_at: '2023-11-01T09:00:00Z',
  },
  ADMIN: {
    user_id: 'USR-ADM-001',
    name: 'Priya Sharma',
    email: 'admin@nirikshan.gov.in',
    phone: '+91 98100 00003',
    role: 'ADMIN',
    account_status: 'ACTIVE',
    avatar_url: null,
    joined_at: '2023-06-20T09:00:00Z',
  },
  CITIZEN: {
    user_id: 'USR-CIT-001',
    name: 'Meera Pillai',
    email: 'meera.pillai@example.com',
    phone: '+91 98100 00005',
    role: 'CITIZEN',
    account_status: 'ACTIVE',
    avatar_url: null,
    joined_at: '2025-02-14T09:00:00Z',
  },
};

/**
 * The active mock session — change this to demo a different role.
 * In production this is replaced by decoded JWT from FastAPI /auth/me.
 */
export const MOCK_CURRENT_USER: MockUser = MOCK_USERS['INSPECTOR'];
