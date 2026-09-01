import type { ComplaintDetail } from '../types';

export const MOCK_COMPLAINTS: ComplaintDetail[] = [
  {
    complaint_id: 'CMP-1001',
    citizen_id: 'USR-CIT-001',
    category: 'Road / Infrastructure',
    description: 'Deep pothole on main road causing accidents during rain.',
    latitude: 28.6139,
    longitude: 77.2090,
    status: 'IN_PROGRESS',
    created_at: '2026-08-20T10:30:00Z',
    evidence_files: [
      { 
        evidence_id: 'EV-1001', 
        inspection_id: 'INS-1001',
        file_path: '#', 
        evidence_type: 'PHOTO', 
        captured_at: '2026-08-20T10:25:00Z', 
        latitude: 28.6139,
        longitude: 77.2090,
        hash_sha256: 'abc123hash'
      }
    ],
    ticket_id: 'TKT-1001',
    inspection_id: 'INS-1001',
  },
  {
    complaint_id: 'CMP-1002',
    citizen_id: 'USR-CIT-001',
    category: 'Sanitation',
    description: 'Garbage not collected for 3 days in residential area.',
    latitude: 28.6200,
    longitude: 77.2100,
    status: 'UNDER_REVIEW',
    created_at: '2026-08-25T14:15:00Z',
    evidence_files: [
      { 
        evidence_id: 'EV-1002', 
        inspection_id: 'INS-1002',
        file_path: '#', 
        evidence_type: 'PHOTO', 
        captured_at: '2026-08-25T14:10:00Z', 
        latitude: 28.6200,
        longitude: 77.2100,
        hash_sha256: 'def456hash'
      }
    ],
  },
  {
    complaint_id: 'CMP-1003',
    citizen_id: 'USR-CIT-001',
    category: 'Public Safety',
    description: 'Street lights not working on 4th Avenue.',
    latitude: 28.6300,
    longitude: 77.2200,
    status: 'RESOLVED',
    created_at: '2026-08-10T09:00:00Z',
    evidence_files: [],
    ticket_id: 'TKT-0950',
  },
];
