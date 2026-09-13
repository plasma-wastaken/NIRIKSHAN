import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, UploadCloud, CheckCircle, ArrowLeft, Loader2, Camera } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { Select } from '../../components/ui/Select';
import { useComplaints } from '../../context/ComplaintContext';

const CATEGORIES = [
  { label: 'Select a category...', value: '' },
  { label: 'Road / Infrastructure', value: 'Road / Infrastructure' },
  { label: 'Public Safety', value: 'Public Safety' },
  { label: 'Sanitation / Waste', value: 'Sanitation' },
  { label: 'Building / Facility', value: 'Building / Facility' },
  { label: 'Other', value: 'Other' },
];

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { addComplaint } = useComplaints();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);

  // Manual location state
  const [manualLoc, setManualLoc] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  // Evidence files state
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEvidenceFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const handleGetLocation = () => {
    setLoadingLoc(true);
    setTimeout(async () => {
      setLoc({ lat: 28.6139, lng: 77.2090 });
      setLoadingLoc(false);
    }, 1000);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(async () => {
      const newId = await addComplaint({
        category,
        description: desc,
        latitude: loc?.lat || 0,
        longitude: loc?.lng || 0,
        evidence_files: [] // Mock empty for prototype
      });
      setSuccessId(newId);
      setSubmitting(false);
      setStep(3);
    }, 1500);
  };

  if (step === 3 && successId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-surface-900">Complaint Submitted Successfully</h1>
        <p className="text-surface-600">Your complaint has been recorded and will be reviewed shortly.</p>
        
        <Card className="max-w-md mx-auto text-left">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between border-b border-surface-100 pb-3">
              <span className="text-surface-500 font-medium">Complaint ID:</span>
              <span className="font-mono font-bold text-primary-700">{successId}</span>
            </div>
            <div className="flex justify-between border-b border-surface-100 pb-3">
              <span className="text-surface-500 font-medium">Status:</span>
              <span className="font-bold text-surface-900">Submitted / Under Review</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-500 font-medium">Date:</span>
              <span className="font-bold text-surface-900">{new Date().toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={() => navigate(`/citizen/complaints/${successId}`)} size="lg">Track Complaint</Button>
          <Button onClick={() => navigate('/citizen/dashboard')} variant="outline" size="lg">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-surface-500 hover:text-surface-900 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-surface-900">
          {step === 1 ? 'New Complaint' : 'Review & Submit'}
        </h1>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-5">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={CATEGORIES}
                required
              />
              
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-700">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full min-h-[120px] rounded-md border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  placeholder="Describe the issue clearly..."
                  required
                />
                <p className="text-right text-xs text-surface-400 mt-1">{desc.length}/500 chars</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-surface-900">Location</h3>
                {loc && (
                  <button onClick={() => setLoc(null)} className="text-xs text-primary-600 hover:underline">
                    Change
                  </button>
                )}
              </div>
              
              {loc ? (
                <div className="bg-green-50 text-green-800 border border-green-200 rounded-lg p-3 text-sm flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-bold">Location Acquired</p>
                    <p className="font-mono text-xs mt-0.5">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</p>
                  </div>
                </div>
              ) : !manualLoc ? (
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={handleGetLocation} disabled={loadingLoc}>
                    {loadingLoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    {loadingLoc ? 'Detecting Location...' : 'Use Current Location'}
                  </Button>
                  <div className="relative text-center">
                    <span className="bg-white px-2 text-xs text-surface-400 relative z-10">OR</span>
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-200"></div></div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setManualLoc(true)}>
                    Enter Location Manually
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 bg-surface-50 p-3 rounded-lg border border-surface-200">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-surface-600 mb-1 block">Latitude</label>
                      <input 
                        type="number" step="any" 
                        className="w-full p-2 text-sm border border-surface-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" 
                        value={manualLat} 
                        onChange={e => setManualLat(e.target.value)} 
                        placeholder="e.g. 28.6139"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-surface-600 mb-1 block">Longitude</label>
                      <input 
                        type="number" step="any" 
                        className="w-full p-2 text-sm border border-surface-300 rounded focus:ring-1 focus:ring-primary-500 outline-none" 
                        value={manualLng} 
                        onChange={e => setManualLng(e.target.value)} 
                        placeholder="e.g. 77.2090"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button 
                      variant="primary" 
                      className="flex-1" 
                      onClick={() => {
                        const lat = parseFloat(manualLat);
                        const lng = parseFloat(manualLng);
                        if (!isNaN(lat) && !isNaN(lng)) setLoc({lat, lng});
                      }}
                      disabled={!manualLat || !manualLng}
                    >
                      Set
                    </Button>
                    <Button variant="outline" onClick={() => setManualLoc(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-surface-900">Evidence (Optional)</h3>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*,video/*" 
                onChange={handleFileChange} 
              />
              <input 
                type="file" 
                ref={cameraInputRef} 
                className="hidden" 
                accept="image/*,video/*" 
                capture="environment" 
                onChange={handleFileChange} 
              />
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-auto py-5 flex flex-col items-center gap-2 bg-surface-50 border-dashed border-2 hover:bg-surface-100 transition-colors" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-7 w-7 text-primary-600" />
                  <div className="text-center">
                    <span className="text-sm font-medium block text-surface-900">Upload Files</span>
                    <span className="text-[10px] text-surface-500">All image formats</span>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1 h-auto py-5 flex flex-col items-center gap-2 bg-surface-50 border-dashed border-2 hover:bg-surface-100 transition-colors" 
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-7 w-7 text-primary-600" />
                  <div className="text-center">
                    <span className="text-sm font-medium block text-surface-900">Live Camera</span>
                    <span className="text-[10px] text-surface-500">Take photo/video</span>
                  </div>
                </Button>
              </div>

              {evidenceFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs font-semibold text-surface-700">Attached Files ({evidenceFiles.length})</p>
                  <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                    {evidenceFiles.map((f, i) => (
                      <div key={i} className="text-xs p-2.5 bg-surface-50 rounded-md border border-surface-200 flex justify-between items-center">
                        <span className="truncate flex-1 font-medium text-surface-700">{f.name}</span>
                        <span className="text-surface-400 mx-2">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button 
                          onClick={() => setEvidenceFiles(prev => prev.filter((_, idx) => idx !== i))} 
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={() => setStep(2)}
              disabled={!category || !desc || !loc}
            >
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-base text-surface-900">{category}</p>
              </div>
              <div className="border-t border-surface-100 pt-4">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-surface-900 leading-relaxed whitespace-pre-wrap">{desc}</p>
              </div>
              <div className="border-t border-surface-100 pt-4">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-surface-900">{loc?.lat}, {loc?.lng}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Offline notice mock */}
          {!navigator.onLine && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm font-medium">
              OFFLINE: Your complaint will be saved locally and submitted when connectivity is restored.
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="w-1/3" size="lg" onClick={() => setStep(1)} disabled={submitting}>
              Edit
            </Button>
            <Button className="w-2/3" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
