import React, { useState } from 'react';
import { CheckCircle2, Edit2, X, Loader2, ShieldCheck, Calendar, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProfileAvatar } from '../../components/profile/ProfileAvatar';
import { RoleBadge } from '../../components/profile/RoleBadge';
import { ProfileField } from '../../components/profile/ProfileField';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import type { UserRole } from '../../data/mockUser';

// ─── Role-specific activity summary ──────────────────────────────────────────

interface ActivityItem { label: string; value: string }

function getRoleActivity(role: UserRole): { title: string; items: ActivityItem[] } {
  switch (role) {
    case 'INSPECTOR':
      return {
        title: 'Inspection Activity',
        items: [
          { label: 'Assigned',   value: '3' },
          { label: 'In Progress', value: '1' },
          { label: 'Submitted',  value: '12' },
          { label: 'Completed',  value: '47' },
        ],
      };
    case 'SUPERVISOR':
      return {
        title: 'Review Activity',
        items: [
          { label: 'Pending Review', value: '8' },
          { label: 'Approved',       value: '34' },
          { label: 'Returned',       value: '6' },
        ],
      };
    case 'ADMIN':
      return {
        title: 'Administrative Activity',
        items: [
          { label: 'Active Users',    value: '124' },
          { label: 'Open Tickets',    value: '5' },
          { label: 'Closed Tickets',  value: '89' },
          { label: 'System Events',   value: '1,482' },
        ],
      };
    case 'CITIZEN':
      return {
        title: 'Complaint Activity',
        items: [
          { label: 'Submitted',   value: '3' },
          { label: 'In Progress', value: '1' },
          { label: 'Resolved',    value: '2' },
        ],
      };
  }
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved';

interface EditFormProps {
  onCancel: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ onCancel }) => {
  const { currentUser, updateProfile } = useAuth();
  const [name,  setName]  = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const inputCls = cn(
    'w-full rounded-lg border border-surface-300 bg-white px-3 py-2',
    'text-sm text-surface-900 placeholder:text-surface-400',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    'transition-colors'
  );

  const handleSave = () => {
    setSaveState('saving');
    // Simulate API latency
    setTimeout(() => {
      updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      setSaveState('saved');
      setTimeout(() => {
        setSaveState('idle');
        onCancel();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="Email address"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputCls}
            placeholder="Phone number"
          />
        </div>
      </div>

      {/* Server-controlled notice */}
      <p className="text-xs text-surface-400 italic">
        Role and account status are server-controlled and cannot be changed here.
      </p>

      <div className="flex gap-3 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={saveState === 'saving'}>
          <X className="h-4 w-4 mr-1.5" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saveState !== 'idle' || !name.trim()}
        >
          {saveState === 'saving' && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          {saveState === 'saved'  && <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-300" />}
          {saveState === 'idle'   ? 'Save Changes' :
           saveState === 'saving' ? 'Saving…' : 'Saved ✓'}
        </Button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);

  const activity = getRoleActivity(currentUser.role);

  const accountStatusCls =
    currentUser.account_status === 'ACTIVE'
      ? 'bg-green-100 text-green-800 border-green-200'
      : currentUser.account_status === 'SUSPENDED'
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';

  return (
    <div className="space-y-5">
      {/* ── Profile Header ──────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <ProfileAvatar
              name={currentUser.name}
              avatar_url={currentUser.avatar_url}
              size="lg"
            />

            {/* Name / Role / Status */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-surface-900">{currentUser.name}</h2>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider',
                    accountStatusCls
                  )}
                >
                  {currentUser.account_status}
                </span>
              </div>
              <RoleBadge role={currentUser.role} className="mb-3" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-surface-700">
                <span>{currentUser.email}</span>
                <span>{currentUser.phone}</span>
              </div>
            </div>

            {/* Edit button */}
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1.5" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Edit form (inline) */}
          {editing && (
            <div className="mt-5 pt-5 border-t border-surface-100">
              <h3 className="text-sm font-semibold text-surface-700 mb-4">Edit Profile</h3>
              <EditForm onCancel={() => setEditing(false)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Account Information (read-only server fields) ────────────────── */}
      <Card>
        <CardHeader className="pb-2 border-b border-surface-100">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary-600" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ProfileField label="User ID" value={currentUser.user_id} mono />
          <ProfileField
            label="Role"
            value={<RoleBadge role={currentUser.role} size="sm" />}
          />
          <ProfileField
            label="Account Status"
            value={
              <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider', accountStatusCls)}>
                {currentUser.account_status}
              </span>
            }
          />
          <ProfileField
            label="Member Since"
            value={new Date(currentUser.joined_at).toLocaleDateString('en-IN', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          />
        </CardContent>
      </Card>

      {/* ── Role-specific Activity Summary ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" />
            <CardTitle className="text-sm">{activity.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activity.items.map((item) => (
              <div
                key={item.label}
                className="bg-surface-50 border border-surface-200 rounded-lg p-4 text-center"
              >
                <p className="text-2xl font-extrabold text-surface-900 tabular-nums">
                  {item.value}
                </p>
                <p className="text-xs text-surface-500 mt-1 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-surface-400 mt-3 flex items-center gap-1">
            <Hash className="h-3 w-3" />
            Demo values — real counts will be fetched from the backend.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
