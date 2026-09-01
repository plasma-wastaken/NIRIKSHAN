import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  MapPin, 
  Clock, 
  User, 
  ArrowLeft, 
  FileCheck2,
  Navigation,
  Camera,
  Brain,
  Send,
} from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useInspections } from '../context/InspectionContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for site marker
const siteIcon = L.divIcon({
  className: 'custom-site-icon',
  html: `<div style="background-color: #1e293b; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export const InspectionDetails: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { inspections } = useInspections();

  const inspection = inspections.find((i) => i.inspection_id === inspectionId);

  if (!inspection) {
    return (
      <EmptyState 
        title="Inspection not found" 
        description="The requested inspection could not be found."
        actionLabel="Back to List"
        onAction={() => navigate('/inspector/inspections')}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':   return <Badge variant="info">Assigned</Badge>;
      case 'IN_PROGRESS': return <Badge variant="warning">In Progress</Badge>;
      case 'SUBMITTED':  return <Badge variant="default">Submitted</Badge>;
      case 'COMPLETED':  return <Badge variant="success">Completed</Badge>;
      default:           return <Badge>{status}</Badge>;
    }
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'Not recorded';
    return new Date(isoString).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isSubmittedOrCompleted =
    inspection.status === 'SUBMITTED' || inspection.status === 'COMPLETED';

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/inspector/inspections')} className="px-2">
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold text-surface-900 truncate">
          Details: {inspection.inspection_id}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Site Information ─────────────────────────────────────────── */}
        <Card className="border-surface-200 shadow-sm">
          <CardHeader className="bg-surface-50 border-b border-surface-200 pb-4">
            <CardTitle className="text-sm uppercase tracking-wider text-surface-500">Site Information</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-xs text-surface-500 font-medium">SITE NAME</p>
              <p className="text-base font-semibold text-surface-900">{inspection.site_name}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-surface-100 p-2 rounded-md mt-1">
                <MapPin className="h-4 w-4 text-surface-500" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">ADDRESS</p>
                <p className="text-sm text-surface-900">{inspection.address}</p>
                <p className="text-xs text-surface-500 mt-1">Site ID: {inspection.site_id}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-surface-100 p-2 rounded-md mt-1">
                <User className="h-4 w-4 text-surface-500" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">ASSIGNED INSPECTOR</p>
                <p className="text-sm text-surface-900">{inspection.inspector_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Inspection Status ─────────────────────────────────────────── */}
        <Card className="border-surface-200 shadow-sm">
          <CardHeader className="bg-surface-50 border-b border-surface-200 pb-4">
            <CardTitle className="text-sm uppercase tracking-wider text-surface-500">Inspection Status</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-surface-500 font-medium">CURRENT STATUS</p>
                <div className="mt-1">{getStatusBadge(inspection.status)}</div>
              </div>
              <div className="text-right">
                <p className="text-xs text-surface-500 font-medium">INSPECTION ID</p>
                <p className="text-sm font-semibold text-surface-900 font-mono">{inspection.inspection_id}</p>
              </div>
            </div>
            <div className="space-y-3 pt-3 border-t border-surface-100">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-surface-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-surface-500 font-medium">SCHEDULED FOR</p>
                  <p className="text-sm text-surface-900">{formatDateTime(inspection.scheduled_date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-primary-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-surface-500 font-medium">STARTED AT</p>
                  <p className="text-sm text-surface-900">{formatDateTime(inspection.started_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-surface-500 font-medium">SUBMITTED AT</p>
                  <p className="text-sm text-surface-900">{formatDateTime(inspection.submitted_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Map + Workflow Actions (full-width) ────────────────────────── */}
        <Card className="border-surface-200 shadow-sm md:col-span-2">
          <CardHeader className="bg-surface-50 border-b border-surface-200 pb-4">
            <CardTitle className="text-sm uppercase tracking-wider text-surface-500">Geospatial Target</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-48 relative w-full">
              <MapContainer
                center={[inspection.latitude, inspection.longitude]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <Marker position={[inspection.latitude, inspection.longitude]} icon={siteIcon}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{inspection.site_name}</p>
                      <p className="text-xs text-gray-600">{inspection.address}</p>
                      <p className="text-xs text-gray-500 mt-1">{inspection.latitude.toFixed(5)}, {inspection.longitude.toFixed(5)}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>

          <CardFooter className="p-5 flex flex-col gap-3 border-t border-surface-200">
            {isSubmittedOrCompleted ? (
              /* Already submitted — show analysis view */
              <Button
                size="lg"
                className="w-full text-base h-12"
                onClick={() =>
                  navigate(`/inspector/inspections/${inspection.inspection_id}/analysis`)
                }
              >
                <Brain className="mr-2 h-5 w-5" />
                View AI Analysis &amp; Risk Result
              </Button>
            ) : (
              <>
                <p className="text-center text-sm text-surface-500 w-full">
                  Complete each step below to submit this inspection.
                </p>

                {/* Step 1 */}
                <Button
                  size="lg"
                  className="w-full text-base h-12"
                  onClick={() =>
                    navigate(`/inspector/inspections/${inspection.inspection_id}/location`)
                  }
                >
                  <Navigation className="mr-2 h-5 w-5" />
                  1. Verify Location
                </Button>

                {/* Step 2 */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base h-12"
                  onClick={() =>
                    navigate(`/inspector/inspections/${inspection.inspection_id}/evidence`)
                  }
                >
                  <Camera className="mr-2 h-5 w-5" />
                  2. Capture Evidence
                </Button>

                {/* Step 3 */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base h-12"
                  onClick={() =>
                    navigate(`/inspector/inspections/${inspection.inspection_id}/analysis`)
                  }
                >
                  <Brain className="mr-2 h-5 w-5" />
                  3. AI Analysis &amp; Risk Score
                </Button>

                {/* Step 4 */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-base h-12 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() =>
                    navigate(`/inspector/inspections/${inspection.inspection_id}/submit`)
                  }
                >
                  <Send className="mr-2 h-5 w-5" />
                  4. Submit Inspection
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
