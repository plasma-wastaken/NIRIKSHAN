export type InspectionStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'APPROVED' | 'RETURNED' | 'FLAGGED';

export interface InspectionRecord {
  inspection_id: string;
  site_id: string;
  inspector_id: string;
  status: InspectionStatus;
  started_at: string | null;
  submitted_at: string | null;
  latitude: number;
  longitude: number;
}

export type EvidenceType = 'PHOTO' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export interface EvidenceRecord {
  evidence_id: string;
  inspection_id: string;
  file_path: string;
  evidence_type: EvidenceType;
  captured_at: string;
  latitude: number;
  longitude: number;
  hash_sha256: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNASSESSED';

export interface RiskScoreRecord {
  risk_score_id: string;
  inspection_id: string;
  score: number;
  risk_level: RiskLevel;
  factors: Record<string, number>;
  confidence: number;
  computed_at: string;
}

export type ComplaintStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ComplaintRecord {
  complaint_id: string;
  citizen_id: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
}

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface TicketRecord {
  ticket_id: string;
  complaint_id: string;
  inspection_id: string | null;
  owner_id: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  sla_deadline: string;
}

export interface AuditRecord {
  audit_id: string;
  entity: string;
  entity_id: string;
  action: string;
  actor_id: string;
  timestamp: string;
  before_state: any;
  after_state: any;
}

// UI-specific types that extend base SRS types for display purposes
export interface InspectionDetail extends InspectionRecord {
  site_name: string;
  address: string;
  risk_level: RiskLevel;
  scheduled_date: string;
  inspector_notes?: string;
  supervisor_notes?: string;
}

export interface ComplaintDetail extends ComplaintRecord {
  created_at: string;
  evidence_files: EvidenceRecord[];
  ticket_id?: string;
  inspection_id?: string;
}
