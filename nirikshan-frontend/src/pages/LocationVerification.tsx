import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  MapPin, 
  ArrowLeft, 
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Camera
} from 'lucide-react';
import { useInspections } from '../context/InspectionContext';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

// Custom icon for inspector marker
const inspectorIcon = L.divIcon({
  className: 'custom-inspector-icon',
  html: `<div style="background-color: #3b82f6; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Component to handle map bounds and centering
const MapController: React.FC<{ center: [number, number]; inspectorPos?: [number, number] }> = ({ center, inspectorPos }) => {
  const map = useMap();
  
  useEffect(() => {
    if (inspectorPos) {
      const bounds = L.latLngBounds([center, inspectorPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, 16);
    }
  }, [center, inspectorPos, map]);
  
  return null;
};

type VerificationStatus = 'IDLE' | 'CHECKING' | 'SUCCESS' | 'WARNING';

export const LocationVerification: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { inspections } = useInspections();
  
  const [status, setStatus] = useState<VerificationStatus>('IDLE');

  // Find the exact inspection or fallback
  const inspection = inspections.find(i => i.inspection_id === inspectionId) || inspections[0];

  // Mock API response payload
  const mockBackendResponse = {
    inspectorLocation: {
      latitude: inspection.latitude + 0.00012, // slightly offset
      longitude: inspection.longitude - 0.00005,
    },
    distanceMeters: 14.2,
    // Toggle this to false to see the WARNING state
    isWithinGeofence: true 
  };

  const handleVerify = () => {
    setStatus('CHECKING');
    
    // Simulate FastAPI call checking ST_DWithin
    setTimeout(() => {
      setStatus(mockBackendResponse.isWithinGeofence ? 'SUCCESS' : 'WARNING');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <h1 className="text-xl font-bold text-surface-900 truncate">
          Location Verification
        </h1>
      </div>

      <Card className="border-surface-200 overflow-hidden shadow-sm">
        {/* Leaflet Map */}
        <div className="h-64 relative w-full border-b border-surface-200">
          <MapContainer
            center={[inspection.latitude, inspection.longitude]}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapController 
              center={[inspection.latitude, inspection.longitude]}
              inspectorPos={status !== 'IDLE' ? [
                status === 'WARNING' ? inspection.latitude + 0.01 : mockBackendResponse.inspectorLocation.latitude,
                status === 'WARNING' ? inspection.longitude - 0.01 : mockBackendResponse.inspectorLocation.longitude
              ] : undefined}
            />
            
            {/* Geofence radius circle */}
            <Circle
              center={[inspection.latitude, inspection.longitude]}
              radius={50}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
            
            {/* Assigned Site Marker */}
            <Marker position={[inspection.latitude, inspection.longitude]} icon={siteIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{inspection.site_name}</p>
                  <p className="text-xs text-gray-600">Assigned Inspection Site</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Inspector Location Marker (shown after verification) */}
            {status !== 'IDLE' && (
              <Marker 
                position={[
                  status === 'WARNING' ? inspection.latitude + 0.01 : mockBackendResponse.inspectorLocation.latitude,
                  status === 'WARNING' ? inspection.longitude - 0.01 : mockBackendResponse.inspectorLocation.longitude
                ]}
                icon={status === 'WARNING' ? 
                  L.divIcon({
                    className: 'custom-inspector-icon-warning',
                    html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -16]
                  }) : inspectorIcon
                }
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">Your Location</p>
                    <p className="text-xs text-gray-600">
                      {status === 'WARNING' ? 'Outside geofence' : 'Within geofence'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <CardContent className="p-0">
          <div className="divide-y divide-surface-100">
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Assigned Target</p>
                <p className="text-sm font-medium text-surface-900">{inspection.site_name}</p>
                <p className="text-xs text-surface-500 mt-1">{inspection.latitude}, {inspection.longitude}</p>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Your Location</p>
                {status !== 'IDLE' ? (
                  <>
                    <p className="text-sm font-medium text-surface-900">Current GPS Fix</p>
                    <p className="text-xs text-surface-500 mt-1">
                      {status === 'WARNING' ? (inspection.latitude + 0.05).toFixed(5) : mockBackendResponse.inspectorLocation.latitude.toFixed(5)}, 
                      {status === 'WARNING' ? (inspection.longitude - 0.05).toFixed(5) : mockBackendResponse.inspectorLocation.longitude.toFixed(5)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-surface-400 italic mt-2">Waiting for verification...</p>
                )}
              </div>
            </div>

            {status !== 'IDLE' && (
              <div className="p-5 bg-surface-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Distance to Target</p>
                  <p className="text-lg font-semibold text-surface-900">
                    {status === 'CHECKING' ? '--' : status === 'WARNING' ? '> 5,000 meters' : `${mockBackendResponse.distanceMeters} meters`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Geofence Status</p>
                  <p className="text-sm font-medium text-surface-900">
                    {status === 'CHECKING' ? 'Computing via PostGIS...' : status === 'WARNING' ? 'Outside Area' : 'Inside Area'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Status Messages */}
            {status === 'SUCCESS' && (
              <div className="p-5 bg-green-50 border-l-4 border-green-500 flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-green-900">Location Verified</h4>
                  <p className="text-sm text-green-700 mt-1">Inspector is within the assigned inspection area.</p>
                </div>
              </div>
            )}
            
            {status === 'WARNING' && (
              <div className="p-5 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="text-base font-semibold text-red-900">Location Mismatch</h4>
                  <p className="text-sm text-red-700 mt-1">Inspector appears outside the assigned inspection area. You must be on-site to continue.</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 flex flex-col gap-3 border-t border-surface-200">
          {status === 'IDLE' || status === 'WARNING' || status === 'CHECKING' ? (
            <Button 
              size="lg" 
              className="w-full text-lg h-14"
              onClick={handleVerify}
              isLoading={status === 'CHECKING'}
            >
              <Navigation className="mr-2 h-6 w-6" />
              {status === 'CHECKING' ? 'Checking Location...' : 'Verify Location'}
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="w-full text-lg h-14 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => navigate(`/inspector/inspections/${inspectionId}/evidence`)}
            >
              <Camera className="mr-2 h-6 w-6" />
              Continue to Evidence
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
