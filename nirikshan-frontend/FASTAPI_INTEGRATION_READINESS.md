# NIRIKSHAN Frontend - FastAPI Integration Readiness

## Overview
The NIRIKSHAN frontend has been successfully prepared for integration with a FastAPI backend. All components have been refactored to support both mock mode (for development) and real API mode (for production).

## Completed Tasks

### 1. API Architecture
- **Centralized API Client**: Created `src/services/api.ts` with a comprehensive API client using axios
- **Environment Configuration**: Implemented environment variable support for API base URL and mock mode toggle
- **Base URL Configuration**: API base URL configurable via `VITE_API_BASE_URL` environment variable

### 2. API Service Functions
Created dedicated service functions for all major workflows:
- **Auth**: `login()` with JWT token support
- **Inspections**: `getInspections()`, `getInspection()`, `submitInspection()`
- **Complaints**: `getComplaints()`, `getComplaint()`, `createComplaint()`
- **Tickets**: `getTickets()`, `getTicket()`, `createTicket()`
- **Evidence**: `uploadEvidence()` with multipart/form-data support

### 3. TypeScript Types
- Updated types to match exact SRS field names (snake_case)
- Added missing fields to `EvidenceRecord` (inspection_id, latitude, longitude)
- Added missing fields to `TicketRecord` (complaint_id, inspection_id, status, created_at)
- Separated UI-specific types from base SRS types

### 4. Mock/API Switch
- Implemented `VITE_USE_MOCK_API` environment variable
- Created `MockApiClient` class for mock data operations
- All service functions automatically switch between mock and real API based on configuration
- Mock mode simulates network delays and realistic responses

### 5. Error Handling
- Created comprehensive error class hierarchy:
  - `ApiError` (base class)
  - `NetworkError`
  - `AuthenticationError`
  - `AuthorizationError`
  - `NotFoundError`
  - `ValidationError`
  - `ServerError`
- Centralized error handling in axios interceptors
- Proper error mapping to UI states

### 6. Authentication Preparation
- Updated `AuthContext` to support JWT authentication
- Added token storage in localStorage
- Implemented `loginWithCredentials()` for real authentication
- Added `setAuthToken()`, `getAuthToken()`, `clearAuthToken()` functions
- Prepared for `POST /auth/login` endpoint

### 7. Role Handling
- Frontend supports roles: CITIZEN, INSPECTOR, SUPERVISOR, ADMIN
- Compatible with SRS roles: CITIZEN, INSPECTOR, SUPERVISOR, DEPT_ADMIN, GOVT_ADMIN
- ADMIN abstraction can map to backend administrative roles
- Role-based navigation preserved

### 8. Route Protection
- Created `ProtectedRoute` component for role-based access control
- Implemented specific route guards:
  - `InspectorRoute`
  - `SupervisorRoute`
  - `CitizenRoute`
  - `AdminRoute`
  - `AuthenticatedRoute`
- Added `/403` error page for unauthorized access
- Integrated route protection in App.tsx

### 9. Loading/Error States
- Updated `InspectionContext` with loading and error states
- Updated `ComplaintContext` with loading and error states
- Updated `AuthContext` with loading state
- All API operations provide loading/error feedback
- Error messages properly propagated to UI

### 10. File Upload Preparation
- Updated `EvidenceCapture` component to use `uploadEvidence()` API function
- Prepared for FastAPI multipart/form-data upload
- Maintains existing UI while adding API integration
- Graceful fallback to mock if API fails

### 11. Environment Configuration
- Created `.env.example` with configuration template
- Created `.env` with default mock mode configuration
- Added environment variables to `.gitignore`
- Documented configuration options

### 12. Component Refactoring
- Removed direct API calls from React components
- All data operations now go through service layer
- Updated contexts to use new API service functions
- Maintained existing UI functionality

### 13. TypeScript Error Resolution
- Fixed all TypeScript compilation errors
- Added null checks for user authentication state
- Resolved import/export issues
- Ensured type safety throughout

## Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=true
```

### Mock Mode (Current Default)
- `VITE_USE_MOCK_API=true` - Uses mock data locally
- No backend required
- Simulates realistic API delays
- Perfect for development and testing

### API Mode (Production)
- `VITE_USE_MOCK_API=false` - Uses real FastAPI backend
- Requires running FastAPI server
- Real authentication with JWT
- Actual data persistence

## API Endpoints Expected

The frontend is ready to connect to these FastAPI endpoints:

### Authentication
- `POST /auth/login` - User authentication

### Inspections
- `GET /inspections` - List all inspections
- `GET /inspections/{id}` - Get specific inspection
- `POST /inspections/{id}/submit` - Submit inspection

### Complaints
- `GET /complaints` - List all complaints
- `GET /complaints/{id}` - Get specific complaint
- `POST /complaints` - Create new complaint

### Tickets
- `GET /tickets` - List all tickets
- `GET /tickets/{id}` - Get specific ticket
- `POST /tickets` - Create new ticket

### Evidence
- `POST /evidence/upload` - Upload evidence file (multipart/form-data)

## Data Contracts

### Inspection Record
```typescript
{
  inspection_id: string;
  site_id: string;
  inspector_id: string;
  status: InspectionStatus;
  started_at: string | null;
  submitted_at: string | null;
  latitude: number;
  longitude: number;
}
```

### Evidence Record
```typescript
{
  evidence_id: string;
  inspection_id: string;
  file_path: string;
  evidence_type: EvidenceType;
  captured_at: string;
  latitude: number;
  longitude: number;
  hash_sha256: string;
}
```

### Complaint Record
```typescript
{
  complaint_id: string;
  citizen_id: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
}
```

### Ticket Record
```typescript
{
  ticket_id: string;
  complaint_id: string;
  inspection_id: string | null;
  owner_id: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  sla_deadline: string;
}
```

## Build and Run

### Development (Mock Mode)
```bash
npm run dev
```

### Development (API Mode)
```bash
# Set VITE_USE_MOCK_API=false in .env
npm run dev
```

### Production Build
```bash
npm run build
```

## Testing Results

✅ Build successful with no TypeScript errors
✅ No console errors in development mode
✅ Mock mode fully functional
✅ All existing routes working
✅ API mode can be enabled via environment configuration
✅ API base URL not hardcoded
✅ API calls centralized in service layer
✅ Types use exact SRS field names
✅ Role-based routes working
✅ 401/403 handling implemented
✅ Network errors show usable UI
✅ Mobile layout intact

## Next Steps for Backend Integration

1. **Implement FastAPI Endpoints**: Create the API endpoints listed above
2. **Database Integration**: Connect FastAPI to PostgreSQL with PostGIS
3. **Authentication**: Implement JWT authentication in FastAPI
4. **ML Integration**: Add ML processing for evidence analysis
5. **Testing**: Test API mode with real backend
6. **Deployment**: Configure production environment variables

## Notes

- The frontend maintains full backward compatibility with mock mode
- No UI changes were made during this integration preparation
- All existing functionality remains intact
- The codebase is ready for seamless backend integration
- Mock mode can be used for frontend development without backend dependency
- API mode provides full functionality when backend is available