export interface DashboardInspection {
  inspection_id: string;
  site_id: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';
  location: string;
  latitude: number;
  longitude: number;
  started_at: string | null;
  scheduled_for: string; // Additional field for UI
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNASSESSED';
}

export const mockDashboardInspections: DashboardInspection[] = [
  {
    inspection_id: 'INS-2026-0841',
    site_id: 'SITE-802',
    status: 'ASSIGNED',
    location: 'Sector 12, Industrial Area Phase II',
    latitude: 28.7041,
    longitude: 77.1025,
    scheduled_for: '2026-08-27T10:00:00Z',
    started_at: null,
    risk_level: 'UNASSESSED',
  },
  {
    inspection_id: 'INS-2026-0839',
    site_id: 'SITE-415',
    status: 'IN_PROGRESS',
    location: 'Riverside Construction Block B',
    latitude: 28.6139,
    longitude: 77.2090,
    scheduled_for: '2026-08-27T13:30:00Z',
    started_at: '2026-08-27T13:35:00Z',
    risk_level: 'UNASSESSED',
  },
  {
    inspection_id: 'INS-2026-0830',
    site_id: 'SITE-911',
    status: 'SUBMITTED',
    location: 'Central Market Commercial Complex',
    latitude: 28.6505,
    longitude: 77.2303,
    scheduled_for: '2026-08-26T15:00:00Z',
    started_at: '2026-08-26T15:10:00Z',
    risk_level: 'HIGH', // Flagged by ML after submission
  },
  {
    inspection_id: 'INS-2026-0825',
    site_id: 'SITE-204',
    status: 'COMPLETED',
    location: 'Govt School Expansion Project',
    latitude: 28.5355,
    longitude: 77.2410,
    scheduled_for: '2026-08-26T09:00:00Z',
    started_at: '2026-08-26T09:05:00Z',
    risk_level: 'LOW',
  }
];

export const mockKpiData = {
  assigned: 14,
  pending: 5,
  completed: 8,
  highRisk: 2
};
