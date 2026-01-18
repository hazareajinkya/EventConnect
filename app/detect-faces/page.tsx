'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Download } from 'lucide-react';

const EVENT_PHOTO = '/event-photo.jpeg';

export default function DetectFacesPage() {
  const [faces, setFaces] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [status, setStatus] = useState<string>('Ready');
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    setStatus(message);
  };

  useEffect(() => {
    addLog('✅ Page loaded successfully');
    setStatus('Ready - Waiting for image to load...');
  }, []);

  const handleDetect = async () => {
    if (!imgRef.current) {
      setError('❌ Image ref is null!');
      addLog('ERROR: Image ref is null');
      return;
    }
    
    if (!imgRef.current.complete || imgRef.current.naturalWidth === 0) {
      setError('❌ Image not fully loaded!');
      addLog('ERROR: Image not complete');
      return;
    }
    
    setIsDetecting(true);
    setError('');
    setFaces([]);
    setLogs([]);
    
    addLog('🚀 Starting face detection...');
    addLog(`📸 Image dimensions: ${imgRef.current.naturalWidth} x ${imgRef.current.naturalHeight}`);
    
    const timeoutId = setTimeout(() => {
      setIsDetecting(false);
      setError('⏱️ Timeout after 60 seconds. Check console for details.');
      addLog('ERROR: Timeout after 60 seconds');
    }, 60000);
    
    try {
      // Step 1: Load face-api.js
      addLog('📦 Step 1: Loading face-api.js library...');
      let faceapi: any;
      
      try {
        faceapi = await import('face-api.js');
        addLog('✅ face-api.js loaded successfully');
      } catch (err: any) {
        throw new Error(`Failed to load face-api.js: ${err.message}`);
      }
      
      // Step 2: Monkey patch
      addLog('🔧 Step 2: Configuring face-api.js...');
      try {
        faceapi.env.monkeyPatch({
          fetch: window.fetch,
          Canvas: window.HTMLCanvasElement,
          Image: window.HTMLImageElement,
          ImageData: window.ImageData,
          Video: window.HTMLVideoElement,
          createCanvasElement: () => document.createElement('canvas'),
          createImageElement: () => document.createElement('img')
        });
        addLog('✅ face-api.js configured');
      } catch (err: any) {
        throw new Error(`Failed to configure face-api.js: ${err.message}`);
      }
      
      // Step 3: Load models (FAST MODE - only TinyFaceDetector)
      addLog('🤖 Step 3: Loading AI model (fast mode)...');
      const MODEL_URL = '/models';
      
      try {
        addLog('  → Loading TinyFaceDetector (fast & efficient)...');
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        addLog('  ✅ Model loaded! Ready to detect.');
      } catch (err: any) {
        throw new Error(`Failed to load model: ${err.message}`);
      }
      
      // Step 4: Detect faces (FAST MODE)
      if (!imgRef.current) {
        throw new Error('Image element lost during detection');
      }
      
      addLog('🔍 Step 4: Detecting faces (fast mode)...');
      
      // Single fast detection
      const tinyOptions = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 416,  // Fast and accurate
        scoreThreshold: 0.3 
      });
      
      let allDetections: any[] = [];
      
      try {
        allDetections = await faceapi.detectAllFaces(imgRef.current, tinyOptions);
        addLog(`  ✅ Found ${allDetections.length} faces`);
      } catch (err: any) {
        addLog(`  ⚠️ First attempt failed, trying lower threshold...`);
        // Retry with lower threshold
        const lowThresholdOptions = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 416,
          scoreThreshold: 0.1 
        });
        allDetections = await faceapi.detectAllFaces(imgRef.current, lowThresholdOptions);
        addLog(`  ✅ Found ${allDetections.length} faces with lower threshold`);
      }
      
      if (allDetections.length === 0) {
        throw new Error('No faces detected. Check the image has clear, visible faces.');
      }
      
      // Step 5: Process results
      addLog('📊 Step 5: Processing detection results...');
      const { naturalWidth, naturalHeight } = imgRef.current;
      const minFaceSize = Math.min(naturalWidth, naturalHeight) * 0.02;
      
      const validDetections = allDetections
        .filter((d: any) => d.box.width > minFaceSize && d.box.height > minFaceSize)
        .map((d: any, idx: number) => ({
          id: `face-${idx + 1}-${Date.now()}`,
          x: d.box.x / naturalWidth,
          y: d.box.y / naturalHeight,
          width: d.box.width / naturalWidth,
          height: d.box.height / naturalHeight,
        }));
      
      addLog(`✅ Processing complete! ${validDetections.length} valid faces found`);
      setFaces(validDetections);
      clearTimeout(timeoutId);
      setIsDetecting(false);
      
      alert(`🎉 Success! Detected ${validDetections.length} faces! Click "Save Results" to download.`);
      
    } catch (err: any) {
      console.error('❌ DETECTION ERROR:', err);
      clearTimeout(timeoutId);
      const errorMsg = err?.message || 'Unknown error occurred';
      setError(`❌ Error: ${errorMsg}`);
      addLog(`ERROR: ${errorMsg}`);
      setIsDetecting(false);
    }
  };

  const handleSave = () => {
    const data = {
      eventPhoto: EVENT_PHOTO,
      faces: faces,
      detectedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pre-detected-faces.json';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ File downloaded! Copy it to /public/pre-detected-faces.json');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[var(--color-cyan)]">
          🔍 Face Detection Tool
        </h1>
        <p className="mb-6 text-white/70">
          Use this tool to detect faces once and save the results. After saving, copy the file to <code className="bg-white/10 px-2 py-1 rounded">/public/pre-detected-faces.json</code>
        </p>
        
        {/* Status Box */}
        <div className={`mb-4 p-4 rounded-xl border-2 ${
          status.includes('✅') ? 'bg-green-500/20 border-green-500/50 text-green-300' :
          status.includes('ERROR') || status.includes('❌') ? 'bg-red-500/20 border-red-500/50 text-red-300' :
          status.includes('⚠️') ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300' :
          'bg-blue-500/20 border-blue-500/50 text-blue-300'
        }`}>
          <p className="font-bold text-lg">{status}</p>
        </div>
        
        {/* Error Box */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl text-red-300">
            <p className="font-bold mb-1">⚠️ Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={handleDetect}
            disabled={isDetecting || !imageLoaded}
            className="bg-[var(--color-cyan)] text-black px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_var(--color-cyan)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDetecting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Detecting...
              </>
            ) : (
              '🔍 Detect Faces'
            )}
          </button>
          
          {faces.length > 0 && (
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_green-500] transition-all flex items-center gap-2"
            >
              <Download size={20} />
              Save Results ({faces.length} faces)
            </button>
          )}
        </div>
        
        {/* Image Loading Status */}
        {!imageLoaded && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-300 text-sm">
            ⏳ Waiting for image to load...
          </div>
        )}
        
        {/* Image */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <img
            ref={imgRef}
            src={EVENT_PHOTO}
            alt="Event Photo"
            className="w-full h-auto rounded-lg"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.complete && img.naturalWidth > 0) {
                console.log('✅ Image loaded:', img.naturalWidth, 'x', img.naturalHeight);
                setImageLoaded(true);
                addLog(`✅ Image loaded: ${img.naturalWidth} x ${img.naturalHeight}px`);
              }
            }}
            onError={() => {
              setError('❌ Failed to load image. Check if event-photo.jpeg exists in /public folder.');
              addLog('ERROR: Image failed to load');
              setImageLoaded(false);
            }}
          />
          
          {faces.length > 0 && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="font-bold text-green-400 mb-2 text-lg">
                ✅ {faces.length} faces detected!
              </p>
              <p className="text-sm text-white/70">
                Click "Save Results" to download the JSON file, then copy it to <code className="bg-black/50 px-2 py-1 rounded">/public/pre-detected-faces.json</code>
              </p>
            </div>
          )}
        </div>

        {/* Detailed Logs */}
        {logs.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="font-bold mb-3">📋 Detailed Logs:</h2>
            <div className="bg-black/50 p-4 rounded-lg max-h-64 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="text-xs font-mono mb-1 text-white/80">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {faces.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 mt-6">
            <h2 className="font-bold mb-2">Preview of detected faces:</h2>
            <pre className="bg-black/50 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify({ totalFaces: faces.length, sample: faces[0], first3: faces.slice(0, 3) }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
