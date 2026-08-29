import React from 'react';

const StubPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p>This page is a stub for the {title} feature.</p>
  </div>
);

export const AdminDashboard = () => <StubPage title="Admin Dashboard" />;
export const AdminInspections = () => <StubPage title="Admin Inspections" />;
export const AdminInspectionDetail = () => <StubPage title="Admin Inspection Detail" />;
export const AdminInspectors = () => <StubPage title="Admin Inspectors" />;
export const AdminComplaints = () => <StubPage title="Admin Complaints" />;
export const AdminComplaintDetail = () => <StubPage title="Admin Complaint Detail" />;
export const AdminTickets = () => <StubPage title="Admin Tickets" />;
export const AdminTicketDetail = () => <StubPage title="Admin Ticket Detail" />;
export const AdminTicketSLA = () => <StubPage title="Admin Ticket SLA" />;
export const AdminUsers = () => <StubPage title="Admin Users" />;
export const AdminAudit = () => <StubPage title="Admin Audit" />;
export const AdminAnalytics = () => <StubPage title="Admin Analytics" />;
export const AdminReports = () => <StubPage title="Admin Reports" />;
export const AdminMap = () => <StubPage title="Admin Map" />;
