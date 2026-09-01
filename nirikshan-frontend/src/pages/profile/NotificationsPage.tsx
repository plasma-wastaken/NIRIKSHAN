import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { ToggleSetting } from '../../components/profile/ToggleSetting';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../data/mockUser';

// ─── Notification group definition ───────────────────────────────────────────

interface NotifGroup {
  title: string;
  items: { id: string; label: string; description: string }[];
}

/** Role-specific notification groups — do not invent unsupported functionality. */
function getNotifGroups(role: UserRole): NotifGroup[] {
  const shared: NotifGroup = {
    title: 'System',
    items: [
      {
        id: 'system_maintenance',
        label: 'Maintenance & Downtime',
        description: 'Notifications about scheduled maintenance and service interruptions.',
      },
      {
        id: 'system_security',
        label: 'Security Alerts',
        description: 'Alerts for unusual sign-in activity on your account.',
      },
    ],
  };

  switch (role) {
    case 'INSPECTOR':
      return [
        {
          title: 'Inspections',
          items: [
            {
              id: 'insp_assigned',
              label: 'Inspection Assigned',
              description: 'When a new inspection is assigned to you.',
            },
            {
              id: 'insp_status',
              label: 'Status Updates',
              description: 'When an inspection you submitted is reviewed or closed.',
            },
            {
              id: 'insp_overdue',
              label: 'Overdue Reminders',
              description: 'Reminders for inspections approaching their deadline.',
            },
          ],
        },
        shared,
      ];

    case 'SUPERVISOR':
      return [
        {
          title: 'Review Queue',
          items: [
            {
              id: 'review_pending',
              label: 'New Submissions to Review',
              description: 'When an inspector submits an inspection for your review.',
            },
            {
              id: 'review_escalated',
              label: 'Escalations',
              description: 'When a high-risk inspection is escalated for urgent review.',
            },
          ],
        },
        shared,
      ];

    case 'ADMIN':
      return [
        {
          title: 'Administration',
          items: [
            {
              id: 'admin_ticket_open',
              label: 'New Tickets',
              description: 'When a new ticket is raised in the system.',
            },
            {
              id: 'admin_ticket_sla',
              label: 'SLA Warnings',
              description: 'When a ticket is approaching its SLA deadline.',
            },
            {
              id: 'admin_user_created',
              label: 'New User Registrations',
              description: 'When a new user account is created in the system.',
            },
            {
              id: 'admin_high_risk',
              label: 'High Risk Inspections',
              description: 'When an inspection is flagged as HIGH or CRITICAL risk.',
            },
          ],
        },
        shared,
      ];

    case 'CITIZEN':
      return [
        {
          title: 'Complaints',
          items: [
            {
              id: 'complaint_status',
              label: 'Complaint Status Updates',
              description: 'When your complaint status changes.',
            },
            {
              id: 'ticket_update',
              label: 'Ticket Updates',
              description: 'When a ticket linked to your complaint is updated.',
            },
          ],
        },
        shared,
      ];
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return null;
  }
  
  const groups = getNotifGroups(currentUser.role);

  // Build initial toggle state — all enabled by default
  const initialState: Record<string, boolean> = {};
  groups.forEach((g) => g.items.forEach((i) => { initialState[i.id] = true; }));
  const [prefs, setPrefs] = useState<Record<string, boolean>>(initialState);

  const toggle = (id: string, val: boolean) =>
    setPrefs((prev) => ({ ...prev, [id]: val }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-700" />
          Notification Preferences
        </h2>
        <p className="text-sm text-surface-500 mt-0.5">
          Choose which notifications you want to receive.
        </p>
      </div>

      {groups.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-2 border-b border-surface-100">
            <CardTitle className="text-sm">{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 divide-y divide-surface-100">
            {group.items.map((item) => (
              <ToggleSetting
                key={item.id}
                id={item.id}
                label={item.label}
                description={item.description}
                checked={prefs[item.id] ?? true}
                onChange={(val) => toggle(item.id, val)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-surface-400 leading-relaxed">
        Notification delivery (email, in-app, push) is configured by the backend.
        These preferences will be persisted via the FastAPI layer when backend
        integration is complete.
      </p>
    </div>
  );
};
