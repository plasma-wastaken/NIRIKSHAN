import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { InspectionProvider } from './context/InspectionContext';
import { TicketProvider } from './context/TicketContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppShell } from './layouts/AppShell';
import { Login } from './pages/Login';
import { Error403 } from './pages/Error403';
import { InspectorRoute, SupervisorRoute, CitizenRoute, AdminRoute } from './components/auth/ProtectedRoute';

// Inspector Pages
import { Dashboard } from './pages/Dashboard';
import { Inspections } from './pages/Inspections';
import { InspectionDetails } from './pages/InspectionDetails';
import { LocationVerification } from './pages/LocationVerification';
import { EvidenceCapture } from './pages/EvidenceCapture';
import { AnalysisResult } from './pages/AnalysisResult';
import { InspectionSubmit } from './pages/InspectionSubmit';
import { Sync } from './pages/Sync';

// Supervisor Pages
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { SupervisorReviews } from './pages/supervisor/SupervisorReviews';
import { SupervisorHighRisk } from './pages/supervisor/SupervisorHighRisk';
import { SupervisorReviewDetail } from './pages/supervisor/SupervisorReviewDetail';
import { SupervisorComplaints } from './pages/supervisor/SupervisorComplaints';
import { SupervisorTickets } from './pages/supervisor/SupervisorTickets';

// Citizen Pages
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { CitizenComplaints } from './pages/citizen/CitizenComplaints';
import { SubmitComplaint } from './pages/citizen/SubmitComplaint';
import { ComplaintDetail } from './pages/citizen/ComplaintDetail';
import { CitizenTickets } from './pages/citizen/CitizenTickets';
import { CitizenReports } from './pages/citizen/CitizenReports';

// Admin Pages
import { 
  AdminDashboard, AdminInspections, AdminInspectionDetail, AdminInspectors, 
  AdminComplaints, AdminComplaintDetail, AdminTickets, AdminTicketDetail, 
  AdminTicketSLA, AdminUsers, AdminAudit, AdminAnalytics, AdminReports, AdminMap 
} from './pages/admin/AdminStubs';

// Profile system
import { SettingsLayout } from './components/profile/SettingsLayout';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SecurityPage } from './pages/profile/SecurityPage';
import { NotificationsPage } from './pages/profile/NotificationsPage';
import { PreferencesPage } from './pages/profile/PreferencesPage';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <InspectionProvider>
            <ComplaintProvider>
              <TicketProvider>
                <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/403" element={<Error403 />} />
              
              {/* Protected Inspector Routes */}
              <Route path="/inspector" element={
                <InspectorRoute>
                  <AppShell />
                </InspectorRoute>
              }>
                <Route index element={<Navigate to="/inspector/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inspections" element={<Inspections />} />
                <Route path="inspections/:inspectionId" element={<InspectionDetails />} />
                <Route path="inspections/:inspectionId/location" element={<LocationVerification />} />
                <Route path="inspections/:inspectionId/evidence" element={<EvidenceCapture />} />
                <Route path="inspections/:inspectionId/analysis" element={<AnalysisResult />} />
                <Route path="inspections/:inspectionId/submit" element={<InspectionSubmit />} />
                <Route path="sync" element={<Sync />} />

                {/* Profile & Settings (Reusable Module) */}
                <Route path="profile" element={<SettingsLayout />}>
                  <Route index element={<ProfilePage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="preferences" element={<PreferencesPage />} />
                </Route>
              </Route>

              {/* Protected Supervisor Routes */}
              <Route path="/supervisor" element={
                <SupervisorRoute>
                  <AppShell />
                </SupervisorRoute>
              }>
                <Route index element={<Navigate to="/supervisor/dashboard" replace />} />
                <Route path="dashboard" element={<SupervisorDashboard />} />
                <Route path="reviews" element={<SupervisorReviews />} />
                <Route path="high-risk" element={<SupervisorHighRisk />} />
                <Route path="inspections/:inspectionId" element={<SupervisorReviewDetail />} />
                <Route path="complaints" element={<SupervisorComplaints />} />
                <Route path="tickets" element={<SupervisorTickets />} />
                
                {/* Profile & Settings (Reusable Module) */}
                <Route path="profile" element={<SettingsLayout />}>
                  <Route index element={<ProfilePage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="preferences" element={<PreferencesPage />} />
                </Route>
              </Route>

              {/* Protected Citizen Routes */}
              <Route path="/citizen" element={
                <CitizenRoute>
                  <AppShell />
                </CitizenRoute>
              }>
                <Route index element={<Navigate to="/citizen/dashboard" replace />} />
                <Route path="dashboard" element={<CitizenDashboard />} />
                
                {/* Complaints */}
                <Route path="complaints" element={<CitizenComplaints />} />
                <Route path="complaints/new" element={<SubmitComplaint />} />
                <Route path="complaints/:complaintId" element={<ComplaintDetail />} />

                {/* Tickets */}
                <Route path="tickets" element={<CitizenTickets />} />

                {/* Reports */}
                <Route path="reports" element={<CitizenReports />} />
                
                {/* Profile & Settings (Reusing the identical module) */}
                <Route path="profile" element={<SettingsLayout />}>
                  <Route index element={<ProfilePage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="preferences" element={<PreferencesPage />} />
                </Route>
              </Route>

              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AppShell />
                </AdminRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="inspections" element={<AdminInspections />} />
                <Route path="inspections/:inspectionId" element={<AdminInspectionDetail />} />
                <Route path="inspectors" element={<AdminInspectors />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="complaints/:complaintId" element={<AdminComplaintDetail />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="tickets/sla" element={<AdminTicketSLA />} />
                <Route path="tickets/:ticketId" element={<AdminTicketDetail />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="map" element={<AdminMap />} />

                {/* Profile & Settings (Reusing the identical module) */}
                <Route path="profile" element={<SettingsLayout />}>
                  <Route index element={<ProfilePage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="preferences" element={<PreferencesPage />} />
                </Route>
              </Route>

              </Routes>
            </TicketProvider>
          </ComplaintProvider>
        </InspectionProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
