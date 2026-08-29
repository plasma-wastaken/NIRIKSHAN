import type {
  InspectionDetail,
  ComplaintDetail,
  InspectionStatus,
  ComplaintStatus,
} from '../types';
import { mockDetailedInspections } from '../data/mockInspections';
import { MOCK_COMPLAINTS } from '../data/mockComplaints';

class ApiService {
  private inspections: InspectionDetail[] = [...mockDetailedInspections];
  private complaints: ComplaintDetail[] = [...MOCK_COMPLAINTS];

  async getInspections(): Promise<InspectionDetail[]> {
    return [...this.inspections];
  }

  async updateInspectionStatus(id: string, status: InspectionStatus, additionalNotes?: string): Promise<void> {
    this.inspections = this.inspections.map(insp => {
      if (insp.inspection_id === id) {
        return {
          ...insp,
          status,
          ...(status === 'SUBMITTED' && additionalNotes ? { inspector_notes: additionalNotes } : {}),
          ...(status !== 'SUBMITTED' && additionalNotes ? { supervisor_notes: additionalNotes } : {})
        };
      }
      return insp;
    });
  }

  async getComplaints(): Promise<ComplaintDetail[]> {
    return [...this.complaints];
  }

  async addComplaint(complaint: ComplaintDetail): Promise<void> {
    this.complaints = [complaint, ...this.complaints];
  }

  async updateComplaintStatus(id: string, status: ComplaintStatus): Promise<void> {
    this.complaints = this.complaints.map(comp => 
      comp.complaint_id === id ? { ...comp, status } : comp
    );
  }

  async linkComplaintToTicket(id: string, ticket_id: string): Promise<void> {
    this.complaints = this.complaints.map(comp => 
      comp.complaint_id === id ? { ...comp, ticket_id } : comp
    );
  }

  async linkComplaintToInspection(id: string, inspection_id: string): Promise<void> {
    this.complaints = this.complaints.map(comp => 
      comp.complaint_id === id ? { ...comp, inspection_id } : comp
    );
  }
}

export const apiService = new ApiService();
