'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { loadModels, detectFaces } from '@/lib/face-detection';
import { FaceOverlay } from '@/app/components/canvas/FaceOverlay';
import { Loader2, Upload, Sparkles, Save } from 'lucide-react';

export default function AdminPage() {
  const { imageUrl, setImageUrl, setFaces, faces, activeFaceId, updateFace } = useStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setFaces([]); // Reset faces
    }
  };

  const handleDetect = async () => {
    if (!imgRef.current) return;
    setIsDetecting(true);
    try {
      const detected = await detectFaces(imgRef.current);
      if (detected.length === 0) {
        alert("No faces detected! Try a clearer photo or manual tagging.");
      }
      setFaces(detected);
    } catch (err) {
      console.error(err);
      alert("Error detecting faces. Check console.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = async () => {
    try {
      // We force the image URL to be relative for public access
      const payload = {
        imageUrl: '/event-photo.jpeg', 
        faces
      };
      
      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        alert('Saved successfully! You can now check the link.');
      } else {
        alert('Failed to save.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving.');
    }
  };

  const activeFace = faces.find((f) => f.id === activeFaceId);

  return (
    <div className="min-h-screen bg-[var(--background)] text-white p-4 md:p-8 flex flex-col md:flex-row gap-8">
      
      {/* Editor Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center border border-white/10 rounded-2xl bg-white/5 relative overflow-hidden min-h-[500px]">
        {!imageUrl ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer flex flex-col items-center gap-4 text-white/50 hover:text-[var(--color-cyan)] transition-colors text-center"
          >
            <Upload size={48} />
            <p>Upload Photo for Tagging<br/><span className="text-xs text-white/30">(Event photo should be in public/event-photo.jpeg)</span></p>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Image Container */}
            <div className="relative inline-block max-w-full max-h-[80vh]">
              <img 
                ref={imgRef} 
                src={imageUrl} 
                alt="Group" 
                className="max-w-full max-h-[80vh] object-contain block"
              />
              <FaceOverlay />
            </div>
            
            {/* Actions Toolbar */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleDetect}
                disabled={isDetecting}
                className="flex items-center gap-2 bg-[var(--color-cyan)] text-black px-4 py-2 rounded-full font-bold hover:shadow-[0_0_20px_var(--color-cyan)] transition-shadow"
              >
                {isDetecting ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {isDetecting ? 'Scanning...' : 'AI Detect'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar / Properties Panel */}
      <div className="w-full md:w-80 glass p-6 rounded-2xl flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b border-white/10 pb-4">Tagging Station</h2>
        
        {activeFace ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-[var(--color-cyan)] font-mono text-sm">EDITING FACE ID: {activeFace.id.slice(0,4)}</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-white/60">Name</label>
              <input 
                type="text" 
                value={activeFace.personName || ''}
                onChange={(e) => updateFace(activeFace.id, { personName: e.target.value })}
                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 focus:border-[var(--color-cyan)] focus:outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">Title / Role</label>
              <input 
                type="text" 
                value={activeFace.personTitle || ''}
                onChange={(e) => updateFace(activeFace.id, { personTitle: e.target.value })}
                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 focus:border-[var(--color-cyan)] focus:outline-none transition-colors"
                placeholder="CEO @ Company"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60">LinkedIn URL</label>
              <input 
                type="text" 
                value={activeFace.linkedinUrl || ''}
                onChange={(e) => updateFace(activeFace.id, { linkedinUrl: e.target.value })}
                className="w-full bg-black/50 border border-white/20 rounded-lg p-3 focus:border-[var(--color-cyan)] focus:outline-none transition-colors"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/30 text-center italic">
            Select a face on the image <br/> to edit details
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3">
            <button 
              onClick={handleSave}
              className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} />
              Save & Publish
            </button>
            <Link href="/event/1" target="_blank" className="w-full py-4 bg-[var(--color-comet)]/20 hover:bg-[var(--color-comet)]/30 text-[var(--color-cyan)] rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-[var(--color-cyan)]/30">
              <Sparkles size={18} />
              Open Public Link
            </Link>
        </div>
      </div>
    </div>
  );
}
