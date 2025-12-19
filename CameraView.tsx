import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, AlertTriangle, ArrowLeft, Zap, Images, CheckCircle, X, Trash2, Maximize2, Crop } from 'lucide-react';
import { analyzeImageWithPi } from '../services/piService';
import { AnalysisResult } from '../types';

interface CameraViewProps {
  onBack: () => void;
  onAnalysisComplete: (results: AnalysisResult[]) => void;
}

interface CapturedImage {
  id: string;
  url: string;
  selected: boolean;
}

// Simple crop modal component
interface CropModalProps {
  image: CapturedImage;
  onConfirm: (id: string, newUrl: string) => void;
  onCancel: () => void;
}

const CropModal: React.FC<CropModalProps> = ({ image, onConfirm, onCancel }) => {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleConfirm = () => {
    if (!imgRef.current) return;
    const naturalWidth = imgRef.current.naturalWidth;
    const clientWidth = imgRef.current.width;
    const scale = naturalWidth / clientWidth;

    const x = Math.min(startPos.x, currentPos.x) * scale;
    const y = Math.min(startPos.y, currentPos.y) * scale;
    const w = Math.abs(currentPos.x - startPos.x) * scale;
    const h = Math.abs(currentPos.y - startPos.y) * scale;

    // Minimum crop size check
    if (w < 50 || h < 50) {
      alert("Selection too small. Please select a larger area.");
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgRef.current, x, y, w, h, 0, 0, w, h);
      onConfirm(image.id, canvas.toDataURL('image/jpeg'));
    }
  };

  const selectionStyle = {
    left: Math.min(startPos.x, currentPos.x),
    top: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y),
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-4 flex justify-between items-center text-white">
        <h3 className="font-bold text-lg">Crop Image</h3>
        <p className="text-sm text-slate-300">Drag to select area</p>
      </div>
      
      <div 
        ref={containerRef}
        className="relative bg-black border border-slate-700 cursor-crosshair select-none touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          ref={imgRef}
          src={image.url} 
          alt="To crop" 
          className="max-h-[70vh] max-w-full object-contain pointer-events-none"
        />
        {/* Selection Box */}
        <div 
          className="absolute border-2 border-emerald-500 bg-emerald-500/20"
          style={{ ...selectionStyle, pointerEvents: 'none' }}
        />
      </div>

      <div className="mt-6 flex gap-4 w-full max-w-lg">
        <button 
          onClick={onCancel}
          className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700"
        >
          Cancel
        </button>
        <button 
          onClick={handleConfirm}
          className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
};


const CameraView: React.FC<CameraViewProps> = ({ onBack, onAnalysisComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'camera' | 'review'>('camera');
  const [cropTarget, setCropTarget] = useState<CapturedImage | null>(null);

  // Initialize Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Unable to access camera. Please check permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (viewMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [viewMode]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImages(prev => [
          ...prev, 
          { id: Date.now().toString() + Math.random().toString(), url: dataUrl, selected: true }
        ]);
      }
    }
  }, []);

  const toggleImageSelection = (id: string) => {
    setCapturedImages(prev => prev.map(img => 
      img.id === id ? { ...img, selected: !img.selected } : img
    ));
  };

  const deleteImage = (id: string, e?: React.MouseEvent) => {
     if (e) e.stopPropagation();
     if(window.confirm("Delete this image?")) {
        setCapturedImages(prev => prev.filter(img => img.id !== id));
     }
  };
  
  const deleteSelectedImages = () => {
    if(window.confirm("Delete all selected images?")) {
      setCapturedImages(prev => prev.filter(img => !img.selected));
    }
  };

  const selectAll = (select: boolean) => {
    setCapturedImages(prev => prev.map(img => ({ ...img, selected: select })));
  };

  const handleBatchAnalyze = async (analyzeAll: boolean) => {
    const imagesToProcess = analyzeAll 
      ? capturedImages 
      : capturedImages.filter(img => img.selected);

    if (imagesToProcess.length === 0) return;

    setIsAnalyzing(true);
    try {
      const promises = imagesToProcess.map(img => analyzeImageWithPi(img.url));
      const results = await Promise.all(promises);
      onAnalysisComplete(results);
    } catch (err) {
      setError("Connection to Raspberry Pi failed during batch analysis.");
      setIsAnalyzing(false);
    }
  };

  const openCropModal = (img: CapturedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    setCropTarget(img);
  };

  const handleCropConfirm = (id: string, newUrl: string) => {
    setCapturedImages(prev => prev.map(img => 
      img.id === id ? { ...img, url: newUrl } : img
    ));
    setCropTarget(null);
  };

  // --- RENDER CAMERA MODE ---
  if (viewMode === 'camera') {
    return (
      <div className="max-w-2xl mx-auto p-4 animate-in fade-in duration-300 flex flex-col h-[calc(100vh-5rem)]">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center">
              <button onClick={onBack} className="p-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <ArrowLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-slate-800">Acquire Samples</h2>
           </div>
           {capturedImages.length > 0 && (
             <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
               {capturedImages.length} Captured
             </div>
           )}
        </div>

        <div className="flex-1 bg-black rounded-2xl overflow-hidden shadow-lg relative flex flex-col justify-center">
          <canvas ref={canvasRef} className="hidden" />

          {error ? (
            <div className="text-center p-6 text-white">
              <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-2" />
              <p>{error}</p>
              <button onClick={startCamera} className="mt-4 text-emerald-400 hover:text-emerald-300 underline">
                Retry Camera
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-between items-center px-4 pb-4">
           {/* Review Button */}
           <div className="w-20 flex justify-start">
             {capturedImages.length > 0 && (
               <button 
                 onClick={() => setViewMode('review')}
                 className="flex flex-col items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors"
               >
                 <div className="relative">
                    <img src={capturedImages[capturedImages.length-1].url} className="w-12 h-12 rounded-lg border-2 border-white shadow-md object-cover" alt="last" />
                    <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {capturedImages.length}
                    </span>
                 </div>
                 <span className="text-xs font-medium">Review</span>
               </button>
             )}
           </div>

           {/* Capture Button */}
           <button
             onClick={capturePhoto}
             className="h-18 w-18 p-1 bg-white border-4 border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:border-emerald-500 active:scale-95 transition-all"
             aria-label="Take Photo"
           >
             <div className="h-16 w-16 bg-emerald-500 rounded-full border-4 border-white"></div>
           </button>

           <div className="w-20 flex justify-end">
              {capturedImages.length > 0 && (
                <button 
                  onClick={() => setViewMode('review')}
                  className="p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle size={24} />
                </button>
              )}
           </div>
        </div>
      </div>
    );
  }

  // --- RENDER REVIEW MODE ---
  const selectedCount = capturedImages.filter(i => i.selected).length;

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-300 min-h-screen flex flex-col">
       {cropTarget && (
         <CropModal 
           image={cropTarget} 
           onConfirm={handleCropConfirm} 
           onCancel={() => setCropTarget(null)} 
         />
       )}

       <div className="flex items-center justify-between mb-6">
          <button onClick={() => setViewMode('camera')} className="flex items-center text-slate-500 hover:text-slate-800">
             <ArrowLeft size={20} className="mr-1" />
             Back to Camera
          </button>
          <h2 className="text-xl font-bold text-slate-800">Review Samples</h2>
          <div className="w-20"></div> 
       </div>

       {isAnalyzing && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
            <RefreshCw className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Analyzing Samples...</h3>
            <p className="text-slate-300">Communicating with Pi Cluster</p>
          </div>
       )}

       <div className="flex-1 overflow-y-auto mb-20">
          <div className="flex justify-between items-center mb-4 bg-slate-100 p-3 rounded-lg flex-wrap gap-2">
             <div className="flex gap-4">
                <button onClick={() => selectAll(true)} className="text-sm font-medium text-emerald-700 hover:underline">Select All</button>
                <button onClick={() => selectAll(false)} className="text-sm font-medium text-slate-500 hover:underline">Deselect All</button>
             </div>
             
             <div className="flex items-center gap-3">
               <span className="text-sm text-slate-600 font-medium">{selectedCount} Selected</span>
               {selectedCount > 0 && (
                 <button 
                   onClick={deleteSelectedImages} 
                   className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200"
                 >
                   <Trash2 size={12} />
                   Delete Selected
                 </button>
               )}
             </div>
          </div>

          {capturedImages.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
               <Images size={48} className="mx-auto mb-2 opacity-50" />
               <p>No images captured yet.</p>
               <button onClick={() => setViewMode('camera')} className="mt-4 text-emerald-600 font-medium">Open Camera</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {capturedImages.map((img) => (
                 <div 
                   key={img.id} 
                   className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${img.selected ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'}`}
                   onClick={() => toggleImageSelection(img.id)}
                 >
                    <img src={img.url} className="w-full h-full object-cover" alt="sample" />
                    
                    {/* Selection Indicator */}
                    <div className={`absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center transition-colors z-10 ${img.selected ? 'bg-emerald-500 text-white' : 'bg-black/30 text-white border border-white'}`}>
                       {img.selected && <CheckCircle size={14} />}
                    </div>

                    {/* Actions Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex justify-between items-end">
                       <button 
                         onClick={(e) => openCropModal(img, e)}
                         className="text-white hover:text-emerald-400 p-1.5 bg-black/40 rounded-full"
                         title="Crop Image"
                       >
                         <Crop size={16} />
                       </button>
                       <button 
                         onClick={(e) => deleteImage(img.id, e)}
                         className="text-white hover:text-red-400 p-1.5 bg-black/40 rounded-full"
                         title="Delete Image"
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
       </div>

       {/* Footer Actions */}
       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="max-w-4xl mx-auto flex gap-4">
             <button
               onClick={() => handleBatchAnalyze(false)}
               disabled={selectedCount === 0 || isAnalyzing}
               className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-bold shadow-sm hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               <Zap size={18} />
               Analyze Selected ({selectedCount})
             </button>

             <button
               onClick={() => handleBatchAnalyze(true)}
               disabled={capturedImages.length === 0 || isAnalyzing}
               className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               <Maximize2 size={18} />
               Analyze All ({capturedImages.length})
             </button>
          </div>
       </div>
    </div>
  );
};

export default CameraView;