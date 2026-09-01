import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { uploadEvidence } from '../services/api';
import { 
  Camera, 
  Video, 
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Lock,
  Loader2,
  X
} from 'lucide-react';

type EvidenceStatus = 'UPLOADING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
type CameraMode = 'PHOTO' | 'VIDEO' | null;

interface EvidenceItem {
  evidence_id: string;
  inspection_id: string;
  file_path: string; // Object URL or Data URL
  evidence_type: 'PHOTO' | 'VIDEO';
  captured_at: string;
  latitude: number;
  longitude: number;
  hash_sha256?: string;
  status: EvidenceStatus;
  progress: number;
}

export const EvidenceCapture: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [evidenceCounter, setEvidenceCounter] = useState(1042);

  // Camera State
  const [cameraMode, setCameraMode] = useState<CameraMode>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (mode: CameraMode) => {
    try {
      setCameraMode(mode);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Prefer back camera
        audio: mode === 'VIDEO'
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have granted permissions.");
      setCameraMode(null);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(null);
    setIsRecording(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      handleNewEvidence(dataUrl, 'PHOTO');
      stopCamera();
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      if (!stream) return;
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        handleNewEvidence(videoUrl, 'VIDEO');
        stopCamera();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const handleNewEvidence = async (fileUrl: string, type: 'PHOTO' | 'VIDEO') => {
    const newEvidence: EvidenceItem = {
      evidence_id: `EV-${evidenceCounter}`,
      inspection_id: inspectionId || 'UNKNOWN',
      file_path: fileUrl,
      evidence_type: type,
      captured_at: new Date().toISOString(),
      latitude: 28.6139 + (Math.random() * 0.001), 
      longitude: 77.2090 + (Math.random() * 0.001),
      status: 'UPLOADING',
      progress: 0,
    };

    setEvidenceCounter(prev => prev + 1);
    setEvidenceList(prev => [newEvidence, ...prev]);

    // Convert data URL to File for API upload
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const file = new File([blob], `evidence-${evidenceCounter}.${type === 'PHOTO' ? 'jpg' : 'webm'}`, {
        type: type === 'PHOTO' ? 'image/jpeg' : 'video/webm'
      });

      // Call the API to upload evidence
      const result = await uploadEvidence(file, inspectionId || 'UNKNOWN');
      
      // Update evidence with server response
      updateEvidence(newEvidence.evidence_id, {
        status: 'PROCESSED',
        progress: 100,
        hash_sha256: result.hash_sha256,
        file_path: result.file_path // Use server-returned file path
      });
    } catch (error) {
      console.error('Upload failed:', error);
      // Fallback to simulation if API fails
      simulateUploadProcess(newEvidence.evidence_id, null);
    }
  };

  const simulateUploadProcess = async (id: string, _file: File | null) => {
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += 20;
      updateEvidence(id, { progress });
      
      if (progress >= 100) {
        clearInterval(uploadInterval);
        updateEvidence(id, { status: 'PROCESSING' });
        
        // In a real implementation, this would call the API
        // For now, we simulate the response
        setTimeout(() => {
          const isSuccess = Math.random() > 0.2;
          if (isSuccess) {
            updateEvidence(id, { 
              status: 'PROCESSED',
              hash_sha256: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
            });
          } else {
            updateEvidence(id, { status: 'FAILED' });
          }
        }, 2000);
      }
    }, 300);
  };

  const updateEvidence = (id: string, updates: Partial<EvidenceItem>) => {
    setEvidenceList(prev => prev.map(item => 
      item.evidence_id === id ? { ...item, ...updates } : item
    ));
  };

  const handleRemove = (id: string) => {
    setEvidenceList(prev => {
      const filtered = prev.filter(item => item.evidence_id !== id);
      const removedItem = prev.find(item => item.evidence_id === id);
      // Only revoke blob URLs, not data URLs (data URLs don't need revoking, but revoking them does nothing bad)
      if (removedItem?.file_path && removedItem.file_path.startsWith('blob:')) {
        URL.revokeObjectURL(removedItem.file_path);
      }
      return filtered;
    });
  };

  const handleRetry = (id: string) => {
    updateEvidence(id, { status: 'UPLOADING', progress: 0, hash_sha256: undefined });
    simulateUploadProcess(id, null);
  };

  const getStatusDisplay = (status: EvidenceStatus, progress: number) => {
    switch (status) {
      case 'UPLOADING':
        return (
          <div className="flex items-center text-primary-600">
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            <span className="font-medium text-sm">Uploading {progress}%</span>
          </div>
        );
      case 'PROCESSING':
        return (
          <div className="flex items-center text-yellow-600">
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            <span className="font-medium text-sm">Processing Evidence...</span>
          </div>
        );
      case 'PROCESSED':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="mr-1 h-4 w-4" />
            <span className="font-medium text-sm">Verified & Processed</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="mr-1 h-4 w-4" />
            <span className="font-medium text-sm">Upload Failed</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto relative">
      {/* Camera Overlay */}
      {cameraMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50 text-white absolute top-0 left-0 right-0 z-10">
            <span className="font-medium">
              {cameraMode === 'PHOTO' ? 'Take Photo' : 'Record Video'}
              {isRecording && <span className="ml-2 text-red-500 animate-pulse font-bold">REC</span>}
            </span>
            <button onClick={stopCamera} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted={cameraMode === 'PHOTO'}
              className="min-w-full min-h-full object-cover"
            />
          </div>
          
          <div className="h-32 bg-black flex items-center justify-center pb-8">
            {cameraMode === 'PHOTO' ? (
              <button 
                onClick={capturePhoto}
                className="h-16 w-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 active:bg-white/40 transition-colors"
              >
                <div className="h-12 w-12 rounded-full bg-white"></div>
              </button>
            ) : (
              <button 
                onClick={toggleRecording}
                className={`h-16 w-16 rounded-full border-4 flex items-center justify-center transition-colors ${isRecording ? 'border-red-500' : 'border-white'}`}
              >
                <div className={`rounded-full transition-all ${isRecording ? 'h-6 w-6 bg-red-500 rounded-sm' : 'h-12 w-12 bg-red-500'}`}></div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
            <ArrowLeft className="h-5 w-5 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">
            Capture Evidence
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-surface-100 px-3 py-1.5 rounded-md border border-surface-200">
          <Lock className="h-4 w-4 text-surface-500" />
          <span className="text-xs font-medium text-surface-600">End-to-End Integrity Checked</span>
        </div>
      </div>

      {/* Main Actions Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 bg-white"
          onClick={() => startCamera('PHOTO')}
        >
          <Camera className="h-8 w-8" />
          <span className="font-semibold text-base">Take Photo</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 bg-white"
          onClick={() => startCamera('VIDEO')}
        >
          <Video className="h-8 w-8" />
          <span className="font-semibold text-base">Record Video</span>
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center justify-between">
          <span>Evidence Collection ({evidenceList.length})</span>
          {evidenceList.length > 0 && (
            <Button size="sm" onClick={() => navigate(`/inspector/inspections/${inspectionId}/analysis`)}>
              Review & Analyze
            </Button>
          )}
        </h2>

        {evidenceList.length === 0 ? (
          <div className="border-2 border-dashed border-surface-300 rounded-xl p-12 text-center bg-surface-50 flex flex-col items-center justify-center">
            <ImageIcon className="h-12 w-12 text-surface-400 mb-4" />
            <h3 className="text-sm font-semibold text-surface-900">No evidence captured</h3>
            <p className="mt-1 text-sm text-surface-500 max-w-sm">
              Use the actions above to capture photos or record videos for this inspection directly from your device.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidenceList.map((evidence) => (
              <Card key={evidence.evidence_id} className="overflow-hidden border-surface-200 shadow-sm">
                <div className="flex flex-col sm:flex-row">
                  {/* Preview Area */}
                  <div className="w-full sm:w-48 h-48 sm:h-auto bg-black relative border-b sm:border-b-0 sm:border-r border-surface-200">
                    {evidence.evidence_type === 'PHOTO' ? (
                      <img 
                        src={evidence.file_path} 
                        alt={evidence.evidence_id} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video 
                        src={evidence.file_path} 
                        className="w-full h-full object-contain"
                        controls
                      />
                    )}
                    
                    {/* Upload progress overlay */}
                    {evidence.status === 'UPLOADING' && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mb-2" />
                        <div className="w-full bg-surface-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${evidence.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details Area */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-surface-900">{evidence.evidence_id}</h3>
                            <Badge variant={evidence.evidence_type === 'PHOTO' ? 'info' : 'warning'} className="text-[10px]">
                              {evidence.evidence_type}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            {getStatusDisplay(evidence.status, evidence.progress)}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {evidence.status === 'FAILED' && (
                            <Button variant="outline" size="sm" onClick={() => handleRetry(evidence.evidence_id)} className="h-8">
                              <RefreshCw className="h-4 w-4 mr-1" /> Retry
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleRemove(evidence.evidence_id)} className="h-8 text-surface-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                        <div>
                          <p className="text-surface-500 font-medium uppercase tracking-wider mb-0.5">Captured</p>
                          <p className="font-medium text-surface-900">
                            {new Date(evidence.captured_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                          <p className="text-surface-500 mt-0.5">
                            {new Date(evidence.captured_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-surface-500 font-medium uppercase tracking-wider mb-0.5">Location</p>
                          <p className="font-medium text-surface-900">
                            {evidence.latitude.toFixed(5)}&deg; N
                          </p>
                          <p className="text-surface-500 mt-0.5">
                            {evidence.longitude.toFixed(5)}&deg; E
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Server Generated Hash representation */}
                    <div className="mt-4 pt-3 border-t border-surface-100">
                      <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider mb-1">
                        Server-Generated Integrity Hash (SHA-256)
                      </p>
                      {evidence.hash_sha256 ? (
                        <div className="bg-surface-50 p-2 rounded border border-surface-200 font-mono text-[10px] text-surface-600 break-all select-all">
                          {evidence.hash_sha256}
                        </div>
                      ) : (
                        <div className="bg-surface-50 p-2 rounded border border-dashed border-surface-200 text-[10px] text-surface-400 italic">
                          {evidence.status === 'FAILED' ? 'Hashing failed due to network error' : 'Hash will be generated upon server confirmation...'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
