import React, { useState } from 'react';
import { Shield, Monitor, Key, AlertTriangle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

// ─── Password Change Form ─────────────────────────────────────────────────────

type PwSaveState = 'idle' | 'saving' | 'saved' | 'error';

const PasswordForm: React.FC = () => {
  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [saveState, setSaveState] = useState<PwSaveState>('idle');
  const [errMsg,   setErrMsg]   = useState('');

  const inputCls = cn(
    'flex-1 rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    'transition-colors placeholder:text-surface-400'
  );

  const handleSubmit = () => {
    setErrMsg('');
    if (!current) { setErrMsg('Enter your current password.'); return; }
    if (next.length < 8) { setErrMsg('New password must be at least 8 characters.'); return; }
    if (next !== confirm) { setErrMsg('Passwords do not match.'); return; }

    setSaveState('saving');
    setTimeout(() => {
      // Mock success — real flow: POST /auth/change-password with JWT
      setSaveState('saved');
      setCurrent(''); setNext(''); setConfirm('');
      setTimeout(() => setSaveState('idle'), 2500);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Current password */}
      {[
        { label: 'Current Password', value: current, setter: setCurrent, placeholder: '••••••••' },
        { label: 'New Password',     value: next,    setter: setNext,    placeholder: 'Min. 8 characters' },
        { label: 'Confirm New Password', value: confirm, setter: setConfirm, placeholder: '••••••••' },
      ].map(({ label, value, setter, placeholder }) => (
        <div key={label}>
          <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">
            {label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type={showPw ? 'text' : 'password'}
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              autoComplete="off"
              className={inputCls}
            />
          </div>
        </div>
      ))}

      {/* Show/hide toggle */}
      <button
        type="button"
        onClick={() => setShowPw((p) => !p)}
        className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 transition-colors"
      >
        {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {showPw ? 'Hide passwords' : 'Show passwords'}
      </button>

      {/* Error */}
      {errMsg && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          {errMsg}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSubmit} disabled={saveState === 'saving'}>
          {saveState === 'saving' && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
          {saveState === 'saved'  && <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-300" />}
          {saveState === 'idle'   ? 'Change Password' :
           saveState === 'saving' ? 'Saving…' : 'Password Changed ✓'}
        </Button>
        {saveState === 'saved' && (
          <span className="text-xs text-green-700">
            Password updated (mock — no real auth yet).
          </span>
        )}
      </div>

      <p className="text-xs text-surface-400 leading-relaxed">
        The backend will use bcrypt password hashing (SRS §7). No passwords are stored in the
        frontend. Do not share your password with anyone.
      </p>
    </div>
  );
};

// ─── Mock session row ─────────────────────────────────────────────────────────

interface SessionRowProps {
  device: string;
  location: string;
  lastSeen: string;
  current?: boolean;
}

const SessionRow: React.FC<SessionRowProps> = ({ device, location, lastSeen, current }) => (
  <div className="flex items-center justify-between py-3 border-b border-surface-100 last:border-0">
    <div className="flex items-center gap-3">
      <Monitor className="h-4 w-4 text-surface-400 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium text-surface-900">
          {device}
          {current && (
            <span className="ml-2 text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Current
            </span>
          )}
        </p>
        <p className="text-xs text-surface-500">{location} · {lastSeen}</p>
      </div>
    </div>
    {!current && (
      <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700">
        Revoke
      </Button>
    )}
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export const SecurityPage: React.FC = () => (
  <div className="space-y-5">
    {/* ── Page header */}
    <div>
      <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary-700" />
        Security
      </h2>
      <p className="text-sm text-surface-500 mt-0.5">
        Manage your password and review active sessions.
      </p>
    </div>

    {/* ── Auth Status ─────────────────────────────────────────────────────── */}
    <Card>
      <CardHeader className="pb-3 border-b border-surface-100">
        <CardTitle className="text-sm">Authentication Status</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Session Active</p>
            <p className="text-xs text-green-700 mt-0.5">
              Authenticated via JWT (mock session for prototype). Real authentication
              requires FastAPI + bcrypt integration (SRS §7).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-surface-50 rounded-lg border border-surface-200 p-3">
            <p className="text-surface-500 font-medium uppercase tracking-wider mb-1">Auth Method</p>
            <p className="font-semibold text-surface-900">JWT Bearer Token</p>
          </div>
          <div className="bg-surface-50 rounded-lg border border-surface-200 p-3">
            <p className="text-surface-500 font-medium uppercase tracking-wider mb-1">Password Hashing</p>
            <p className="font-semibold text-surface-900">bcrypt (server-side)</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-surface-500 bg-surface-50 border border-surface-200 rounded-lg p-3">
          <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <span>
            This is a prototype. Real JWT validation and session management will be
            implemented in the FastAPI backend layer.
          </span>
        </div>
      </CardContent>
    </Card>

    {/* ── Change Password ────────────────────────────────────────────────── */}
    <Card>
      <CardHeader className="pb-3 border-b border-surface-100">
        <CardTitle className="text-sm flex items-center gap-2">
          <Key className="h-4 w-4 text-primary-600" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <PasswordForm />
      </CardContent>
    </Card>

    {/* ── Active Sessions ────────────────────────────────────────────────── */}
    <Card>
      <CardHeader className="pb-3 border-b border-surface-100">
        <CardTitle className="text-sm flex items-center gap-2">
          <Monitor className="h-4 w-4 text-primary-600" />
          Active Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <SessionRow
          device="Chrome on Windows"
          location="New Delhi, India"
          lastSeen="Active now"
          current
        />
        <SessionRow
          device="Firefox on Android"
          location="Mumbai, India"
          lastSeen="3 hours ago"
        />
        <SessionRow
          device="Safari on iPhone"
          location="Bengaluru, India"
          lastSeen="2 days ago"
        />
        <p className="text-xs text-surface-400 mt-3">
          Session data is for demonstration. Real session management requires backend integration.
        </p>
      </CardContent>
    </Card>
  </div>
);
