import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import type {
  InspectionDetail,
  ComplaintDetail,
  TicketRecord,
  EvidenceRecord,
  InspectionStatus,
  ComplaintStatus,
} from '../types';
import { mockDetailedInspections } from '../data/mockInspections';
import { MOCK_COMPLAINTS } from '../data/mockComplaints';

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

// On Vercel the backend is reachable at /api (via the public rewrite in vercel.json).
// For local development outside `vercel dev`, set VITE_API_BASE_URL=http://localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ApiError extends Error {
  statusCode?: number;
  endpoint?: string;

  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(message, undefined);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed') {
    super(message, 422);
    this.name = 'ValidationError';
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Server error occurred') {
    super(message, 500);
    this.name = 'ServerError';
  }
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (!error.response) {
      // Network error
      return new NetworkError(error.message);
    }

    const status = error.response.status;
    const data = error.response.data as any;
    const message = data?.detail || data?.message || this.getDefaultErrorMessage(status);

    switch (status) {
      case 400:
        return new ValidationError(message);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      case 422:
        return new ValidationError(message);
      case 500:
      default:
        return new ServerError(message);
    }
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Bad request';
      case 401: return 'Authentication required';
      case 403: return 'Access denied';
      case 404: return 'Resource not found';
      case 422: return 'Validation failed';
      case 500: return 'Server error';
      default: return 'An error occurred';
    }
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  // Generic HTTP methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// ============================================================================
// MOCK API IMPLEMENTATION
// ============================================================================

class MockApiClient {
  private inspections: InspectionDetail[] = [...mockDetailedInspections];
  private complaints: ComplaintDetail[] = [...MOCK_COMPLAINTS];

  async getInspections(): Promise<InspectionDetail[]> {
    // Simulate network delay
    await this.delay(300);
    return [...this.inspections];
  }

  async getInspection(id: string): Promise<InspectionDetail> {
    await this.delay(200);
    const inspection = this.inspections.find(insp => insp.inspection_id === id);
    if (!inspection) {
      throw new NotFoundError(`Inspection ${id} not found`);
    }
    return { ...inspection };
  }

  async updateInspectionStatus(id: string, status: InspectionStatus, additionalNotes?: string): Promise<void> {
    await this.delay(200);
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
    await this.delay(300);
    return [...this.complaints];
  }

  async getComplaint(id: string): Promise<ComplaintDetail> {
    await this.delay(200);
    const complaint = this.complaints.find(comp => comp.complaint_id === id);
    if (!complaint) {
      throw new NotFoundError(`Complaint ${id} not found`);
    }
    return { ...complaint };
  }

  async createComplaint(complaint: Omit<ComplaintDetail, 'complaint_id' | 'created_at'>): Promise<ComplaintDetail> {
    await this.delay(400);
    const newComplaint: ComplaintDetail = {
      ...complaint,
      complaint_id: `CMP-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.complaints = [newComplaint, ...this.complaints];
    return newComplaint;
  }

  async updateComplaintStatus(id: string, status: ComplaintStatus): Promise<void> {
    await this.delay(200);
    this.complaints = this.complaints.map(comp => 
      comp.complaint_id === id ? { ...comp, status } : comp
    );
  }

  async linkComplaintToTicket(id: string, ticket_id: string): Promise<void> {
    await this.delay(200);
    this.complaints = this.complaints.map(comp => 
      comp.complaint_id === id ? { ...comp, ticket_id } : comp
    );
  }

  async linkComplaintToInspection(id: string, inspection_id: string): Promise<void> {
    await this.delay(200);
    this.complaints = this.complaints.map(comp => 
      comp.complaint_id === id ? { ...comp, inspection_id } : comp
    );
  }

  async uploadEvidence(file: File, inspectionId: string): Promise<EvidenceRecord> {
    await this.delay(1000);
    return {
      evidence_id: `EV-${Date.now()}`,
      inspection_id: inspectionId,
      file_path: URL.createObjectURL(file),
      evidence_type: 'PHOTO',
      captured_at: new Date().toISOString(),
      latitude: 28.6139 + (Math.random() * 0.001),
      longitude: 77.2090 + (Math.random() * 0.001),
      hash_sha256: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SERVICE FUNCTIONS (AUTH)
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK_API) {
    // Mock login - in real implementation, this would call the backend
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      access_token: 'mock-jwt-token',
      token_type: 'bearer',
      user: {
        user_id: 'USR-INS-001',
        name: 'Jane Doe',
        email: 'jane.doe@nirikshan.gov.in',
        role: 'INSPECTOR'
      }
    };
  }

  const client = new ApiClient();
  return client.post<LoginResponse>('/auth/login', credentials);
}

// ============================================================================
// SERVICE FUNCTIONS (INSPECTIONS)
// ============================================================================

export async function getInspections(): Promise<InspectionDetail[]> {
  if (USE_MOCK_API) {
    const mockClient = new MockApiClient();
    return mockClient.getInspections();
  }

  const client = new ApiClient();
  return client.get<InspectionDetail[]>('/inspections');
}

export async function getInspection(id: string): Promise<InspectionDetail> {
  if (USE_MOCK_API) {
    const mockClient = new MockApiClient();
    return mockClient.getInspection(id);
  }

  const client = new ApiClient();
  return client.get<InspectionDetail>(`/inspections/${id}`);
}

export async function submitInspection(id: string, data: any): Promise<void> {
  if (USE_MOCK_API) {
    const mockClient = new MockApiClient();
    return mockClient.updateInspectionStatus(id, 'SUBMITTED', data.inspector_notes);
  }

  const client = new ApiClient();
  return client.post(`/inspections/${id}/submit`, data);
}

// ============================================================================
// SERVICE FUNCTIONS (COMPLAINTS)
// ============================================================================

export async function getComplaints(): Promise<ComplaintDetail[]> {
  if (USE_MOCK_API) {
    const mockClient = new MockApiClient();
    return mockClient.getComplaints();
  }

  const client = new ApiClient();
  return client.get<ComplaintDetail[]>('/complaints');
}

export async function getComplaint(id: string): Promise<ComplaintDetail> {
  if (USE_MOCK_API) {
    const mockClient = new MockApiClient();
    return mockClient.getComplaint(id);
  }

  const client = new ApiClient();
  return client.get<ComplaintDetail>(`/complaints/${id}`);
}

export async function createComplaint(data: Omit<ComplaintDetail, 'complaint_id' | 'created_at'>): Promise<ComplaintDetail> {
  if (USE_MOCK_API) {
    const mockClient = new MockApiClient();
    return mockClient.createComplaint(data);
  }

  const client = new ApiClient();
  return client.post<ComplaintDetail>('/complaints', data);
}

// ============================================================================
// SERVICE FUNCTIONS (TICKETS)
// ============================================================================

export async function getTickets(): Promise<TicketRecord[]> {
  if (USE_MOCK_API) {
    // Mock tickets data
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        ticket_id: 'TKT-1001',
        complaint_id: 'CMP-1001',
        inspection_id: 'INS-1001',
        owner_id: 'USR-SUP-001',
        priority: 'HIGH',
        status: 'OPEN',
        created_at: '2026-08-20T10:30:00Z',
        sla_deadline: '2026-09-01T00:00:00Z'
      }
    ];
  }

  const client = new ApiClient();
  return client.get<TicketRecord[]>('/tickets');
}

export async function getTicket(id: string): Promise<TicketRecord> {
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      ticket_id: id,
      complaint_id: 'CMP-1001',
      inspection_id: 'INS-1001',
      owner_id: 'USR-SUP-001',
      priority: 'HIGH',
      status: 'OPEN',
      created_at: '2026-08-20T10:30:00Z',
      sla_deadline: '2026-09-01T00:00:00Z'
    };
  }

  const client = new ApiClient();
  return client.get<TicketRecord>(`/tickets/${id}`);
}

export async function createTicket(data: Omit<TicketRecord, 'ticket_id'>): Promise<TicketRecord> {
  if (USE_MOCK_API) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      ...data,
      ticket_id: `TKT-${Date.now()}`
    };
  }

  const client = new ApiClient();
  return client.post<TicketRecord>('/tickets', data);
}

// ============================================================================
// SERVICE FUNCTIONS (EVIDENCE)
// ============================================================================

export async function uploadEvidence(file: File, inspectionId: string): Promise<EvidenceRecord> {
  if (USE_MOCK_API) {
    const mockClient = new MockApiClient();
    return mockClient.uploadEvidence(file, inspectionId);
  }

  const client = new ApiClient();
  return client.uploadFile<EvidenceRecord>('/evidence/upload', file, { inspection_id: inspectionId });
}

// ============================================================================
// AUTH TOKEN MANAGEMENT
// ============================================================================

const apiClient = new ApiClient();

export function setAuthToken(token: string | null) {
  apiClient.setToken(token);
}

export function getAuthToken(): string | null {
  return apiClient.getToken();
}

export function clearAuthToken() {
  apiClient.clearToken();
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ApiClient, MockApiClient, apiClient as api };
export const useMockApi = USE_MOCK_API;
