import React, { useState } from 'react';
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
        {/* Map Visualization (Mock) */}
        <div className="h-64 bg-surface-200 relative w-full flex items-center justify-center border-b border-surface-200">
          <div className="absolute inset-0 opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          </div>
          
          <div className="relative w-full h-full">
            {/* Inspection Radius Mock */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border-2 border-primary-400 bg-primary-100/30"></div>
            
            {/* Assigned Site Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10">
              <div className="h-8 w-8 rounded-full bg-surface-900 flex items-center justify-center shadow-lg ring-2 ring-white">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="mt-1 text-[10px] font-bold text-surface-900 bg-white/90 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm whitespace-nowrap">
                Assigned Site
              </span>
            </div>

            {/* Inspector Marker (only show after/during check for dramatic effect, or show it slightly off center) */}
            {status !== 'IDLE' && (
              <div 
                className="absolute top-[48%] left-[53%] flex flex-col items-center transition-all duration-1000 ease-in-out z-20"
                style={{
                  top: status === 'WARNING' ? '20%' : '48%',
                  left: status === 'WARNING' ? '20%' : '53%'
                }}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white ${status === 'WARNING' ? 'bg-red-500' : 'bg-primary-500'}`}>
                  <Navigation className="h-4 w-4 text-white" />
                </div>
                <span className="mt-1 text-[10px] font-bold text-surface-900 bg-white/90 px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm whitespace-nowrap">
                  You
                </span>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-surface-700 shadow-sm border border-surface-200">
            Awaiting Geospatial Integration
          </div>
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
