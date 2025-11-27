
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Lock } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startCamera = useCallback(async () => {
    stopStream();
    setError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Il tuo browser non supporta l'accesso alla fotocamera o la connessione non è sicura (HTTPS richiesto).");
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.warn("Primary camera config failed, trying fallback...", err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("PERMESSO NEGATO. Clicca sull'icona del lucchetto 🔒 nella barra degli indirizzi del browser e consenti l'accesso alla fotocamera.");
        return;
      }

      // Fallback: try asking for any video source if specific facingMode fails (common on desktops)
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr: any) {
        console.error("Camera access error:", fallbackErr);
        if (fallbackErr.name === 'NotAllowedError' || fallbackErr.name === 'PermissionDeniedError') {
             setError("PERMESSO NEGATO. Per favore sblocca la fotocamera dalle impostazioni del browser (icona lucchetto).");
        } else {
             setError('Impossibile accedere alla fotocamera. Verifica che nessun altra app la stia usando.');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      // Create a temporary canvas
      const canvas = document.createElement('canvas');
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        stopStream();
        onCapture(imageSrc);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {error ? (
        <div className="bg-white p-6 rounded-sm shadow-xl max-w-sm text-center mx-4 border-t-8 border-red-600">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Accesso Negato</h3>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">{error}</p>
          <div className="flex gap-3 justify-center">
             <button onClick={onCancel} className="px-4 py-2 border border-slate-300 text-slate-700 font-bold uppercase text-xs rounded-sm hover:bg-slate-50">Chiudi</button>
             <button onClick={() => startCamera()} className="px-4 py-2 bg-[#FFE900] text-slate-900 font-bold uppercase text-xs rounded-sm hover:bg-[#E6D200]">Riprova</button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full flex flex-col bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                if(videoRef.current) videoRef.current.play().catch(e => console.error("Play error:", e));
              }}
            />
            
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent z-10">
              <button onClick={onCancel} className="text-white p-3 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <button onClick={toggleCamera} className="text-white p-3 rounded-full hover:bg-white/10 transition-colors">
                <RefreshCw className="w-6 h-6" />
              </button>
            </div>

            {/* Professional Guide Frame */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className="w-full max-w-md aspect-[1.75/1] border-2 border-white/50 rounded-sm relative">
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#FFE900] -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#FFE900] -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#FFE900] -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#FFE900] -mb-1 -mr-1"></div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 text-xs font-bold uppercase tracking-widest bg-black/50 px-3 py-1 rounded">
                  Inquadra Biglietto
                </div>
              </div>
            </div>

            {/* Shutter Button Area */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent pb-12 z-10">
               <button 
                onClick={handleCapture}
                className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:border-[#FFE900]"
               >
                 <div className="w-16 h-16 bg-white rounded-full border-2 border-black/10" />
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;
