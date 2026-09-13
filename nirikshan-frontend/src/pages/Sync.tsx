import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { cn } from '../utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

type SyncItemStatus = 'pending' | 'syncing' | 'synced' | 'failed';
type SyncItemType  = 'inspection' | 'evidence';

interface SyncItem {
  id: string;
  type: SyncItemType;
  label: string;
  description: string;
  sizeMb: number;
  status: SyncItemStatus;
  queuedAt: string; // ISO
  lastAttempt?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SyncItemStatus,
  { label: string; badgeCls: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    badgeCls: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  syncing: {
    label: 'Syncing…',
    badgeCls: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  synced: {
    label: 'Synced',
    badgeCls: 'bg-green-100 text-green-800 border border-green-200',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    label: 'Failed',
    badgeCls: 'bg-red-100 text-red-800 border border-red-200',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

// ─── Initial mock data ────────────────────────────────────────────────────────

const INITIAL_ITEMS: SyncItem[] = [
  {
    id: 'sync-1',
    type: 'inspection',
    label: 'INS-2026-1039',
    description: 'Inspection submission — Riverside Block B',
    sizeMb: 0.8,
    status: 'pending',
    queuedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'sync-2',
    type: 'evidence',
    label: 'EV-1042, EV-1043, EV-1044',
    description: '3 photo evidence items — Central Market Complex',
    sizeMb: 2.4,
    status: 'failed',
    queuedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    lastAttempt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'sync-3',
    type: 'inspection',
    label: 'INS-2026-1041',
    description: 'Inspection submission — Sector 12 Construction',
    sizeMb: 0.4,
    status: 'pending',
    queuedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

const LAST_SYNC_TIME = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

// ─── Helper ───────────────────────────────────────────────────────────────────

const relativeTime = (isoStr: string): string => {
  const diffMs = Date.now() - new Date(isoStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
};

const formatBytes = (mb: number): string =>
  mb < 1 ? `${Math.round(mb * 1000)} KB` : `${mb.toFixed(1)} MB`;

// ─── Sync item row ────────────────────────────────────────────────────────────

interface SyncItemRowProps {
  item: SyncItem;
  onRetry: (id: string) => void;
}

const SyncItemRow: React.FC<SyncItemRowProps> = ({ item, onRetry }) => {
  const cfg = STATUS_CONFIG[item.status];
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-colors',
        item.status === 'synced' && 'border-green-200 bg-green-50/40',
        item.status === 'failed' && 'border-red-200 bg-red-50/40',
        item.status === 'syncing' && 'border-blue-200 bg-blue-50/40',
        item.status === 'pending' && 'border-surface-200 bg-white',
      )}
    >
      {/* Type icon */}
      <div
        className={cn(
          'flex-shrink-0 p-2 rounded-lg mt-0.5',
          item.status === 'synced'  && 'bg-green-100',
          item.status === 'failed'  && 'bg-red-100',
          item.status === 'syncing' && 'bg-blue-100',
          item.status === 'pending' && 'bg-surface-100',
        )}
      >
        {item.type === 'inspection' ? (
          <FileText
            className={cn(
              'h-4 w-4',
              item.status === 'synced'  && 'text-green-700',
              item.status === 'failed'  && 'text-red-700',
              item.status === 'syncing' && 'text-blue-700',
              item.status === 'pending' && 'text-surface-500',
            )}
          />
        ) : (
          <ImageIcon
            className={cn(
              'h-4 w-4',
              item.status === 'synced'  && 'text-green-700',
              item.status === 'failed'  && 'text-red-700',
              item.status === 'syncing' && 'text-blue-700',
              item.status === 'pending' && 'text-surface-500',
            )}
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-surface-900 font-mono">{item.label}</span>
          <div
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border',
              cfg.badgeCls
            )}
          >
            {cfg.icon}
            {cfg.label}
          </div>
        </div>
        <p className="text-xs text-surface-500 mt-0.5">{item.description}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-surface-400">
          <span>Queued {relativeTime(item.queuedAt)}</span>
          {item.lastAttempt && (
            <span>· Last attempt {relativeTime(item.lastAttempt)}</span>
          )}
          <span>· {formatBytes(item.sizeMb)}</span>
        </div>

        {/* Syncing progress bar */}
        {item.status === 'syncing' && (
          <div className="mt-2 h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-[pulse_1s_ease-in-out_infinite] w-2/3" />
          </div>
        )}
      </div>

      {/* Retry */}
      {item.status === 'failed' && (
        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-8 text-xs border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => onRetry(item.id)}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const Sync: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [items, setItems] = useState<SyncItem[]>(INITIAL_ITEMS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(LAST_SYNC_TIME);
  const [now, setNow] = useState(new Date());

  // Keep relative timestamps ticking
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(tick);
  }, []);

  // Listen to online/offline events
  useEffect(() => {
    const online  = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener('online',  online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online',  online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  const pendingItems  = items.filter((i) => i.status === 'pending' || i.status === 'failed');
  const syncingItems  = items.filter((i) => i.status === 'syncing');
  const syncedItems   = items.filter((i) => i.status === 'synced');
  const totalPendingMb = pendingItems.reduce((s, i) => s + i.sizeMb, 0);

  const handleRetry = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'syncing', lastAttempt: new Date().toISOString() } : item
      )
    );
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'synced' } : item
        )
      );
      setLastSync(new Date());
    }, 2000);
  };

  const handleSyncNow = () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);

    // Mark all pending/failed as syncing
    setItems((prev) =>
      prev.map((item) =>
        item.status === 'pending' || item.status === 'failed'
          ? { ...item, status: 'syncing', lastAttempt: new Date().toISOString() }
          : item
      )
    );

    // Simulate staggered completion
    const ids = pendingItems.map((i) => i.id);
    ids.forEach((id, idx) => {
      setTimeout(() => {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'synced' } : item))
        );
        if (idx === ids.length - 1) {
          setIsSyncing(false);
          setLastSync(new Date());
        }
      }, 1200 + idx * 900);
    });
  };

  // Relative "last sync" display
  const lastSyncLabel = (() => {
    const diffMs  = now.getTime() - lastSync.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24)  return `${diffHr} hr ago`;
    return `${Math.floor(diffHr / 24)} days ago`;
  })();

  const allSynced = items.every((i) => i.status === 'synced');

  return (
    <div className="space-y-6 pb-20">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">Sync Center</h1>
          <p className="text-sm text-surface-500 mt-1">
            Manage offline changes and upload them to the central server.
          </p>
        </div>

        {/* Online / Offline pill */}
        <div className="flex-shrink-0">
          {isOnline ? (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <Wifi className="h-4 w-4" />
              ONLINE
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <WifiOff className="h-4 w-4" />
              OFFLINE — Changes saved locally
            </div>
          )}
        </div>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Pending Items',
            value: pendingItems.length,
            icon: <Clock className="h-5 w-5 text-yellow-500" />,
            accent: 'border-l-yellow-500',
          },
          {
            label: 'Syncing',
            value: syncingItems.length,
            icon: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
            accent: 'border-l-blue-500',
          },
          {
            label: 'Synced',
            value: syncedItems.length,
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            accent: 'border-l-green-500',
          },
          {
            label: 'Data Pending',
            value: formatBytes(totalPendingMb),
            icon: <Upload className="h-5 w-5 text-surface-400" />,
            accent: 'border-l-surface-400',
          },
        ].map(({ label, value, icon, accent }) => (
          <Card key={label} className={cn('border-l-4', accent)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-surface-500">{label}</p>
                {icon}
              </div>
              <p className="text-2xl font-bold text-surface-900 tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Last sync ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-surface-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
        <span>
          Last successful sync:{' '}
          <span className="font-semibold text-surface-700">{lastSyncLabel}</span>
        </span>
      </div>

      {/* ── Queue ────────────────────────────────────────────────────────────── */}
      {allSynced ? (
        <Card className="border-green-200">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-surface-900">All Caught Up</h3>
              <p className="text-sm text-surface-500 mt-1">
                All local changes have been successfully synchronized with the server.
              </p>
            </div>
            <Badge variant="success">No pending uploads</Badge>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3 border-b border-surface-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Upload Queue
                <span className="ml-2 text-xs font-normal text-surface-500">
                  {pendingItems.length + syncingItems.length} item
                  {(pendingItems.length + syncingItems.length) !== 1 ? 's' : ''} waiting
                </span>
              </CardTitle>
              <Button
                size="sm"
                onClick={handleSyncNow}
                disabled={!isOnline || isSyncing || pendingItems.length === 0}
                isLoading={isSyncing}
              >
                {!isSyncing && <RefreshCw className="h-4 w-4 mr-1.5" />}
                Sync Now
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {/* Pending + failed + syncing */}
            {items
              .filter((i) => i.status !== 'synced')
              .map((item) => (
                <SyncItemRow key={item.id} item={item} onRetry={handleRetry} />
              ))}

            {/* Synced (collapsible section) */}
            {syncedItems.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                  Recently Synced
                </p>
                <div className="space-y-2">
                  {syncedItems.map((item) => (
                    <SyncItemRow key={item.id} item={item} onRetry={handleRetry} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Offline notice ────────────────────────────────────────────────────── */}
      {!isOnline && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-semibold">Working offline</p>
            <p className="mt-0.5 leading-relaxed">
              Your inspection data is being stored securely on this device. It will be
              automatically synchronized as soon as network connectivity is restored. Do not
              close the application before syncing completes.
            </p>
          </div>
        </div>
      )}

      {/* ── Prototype notice ─────────────────────────────────────────────────── */}
      <div className="text-xs text-surface-400 text-center leading-relaxed">
        Sync Center is in prototype mode. Full offline database synchronization (IndexedDB + conflict
        resolution) is not yet active. Data is simulated locally for demonstration purposes.
      </div>
    </div>
  );
};
