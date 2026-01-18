'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Scanner } from '@/app/components/canvas/Scanner';
import { FaceOverlay } from '@/app/components/canvas/FaceOverlay';
import { Drawer } from 'vaul';
import { Linkedin, X, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EventPage() {
  const { imageUrl, activeFaceId, faces, setActiveFace, setFaces, setImageUrl, updateFace } = useStore();
  const activeFace = faces.find(f => f.id === activeFaceId);
  const [showScanner, setShowScanner] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editLinkedIn, setEditLinkedIn] = useState('');

  // Fetch data from API on load
  useEffect(() => {
    fetch('/api/event')
      .then(res => res.json())
      .then(data => {
        if (data.imageUrl) setImageUrl(data.imageUrl);
        if (data.faces) setFaces(data.faces);
      })
      .catch(err => console.error('Failed to load event data', err));
  }, []);

  // Update edit form when active face changes
  useEffect(() => {
    if (activeFace) {
      setEditName(activeFace.personName || '');
      setEditTitle(activeFace.personTitle || '');
      setEditLinkedIn(activeFace.linkedinUrl || '');
      setIsEditing(false);
    }
  }, [activeFaceId]);

  const handleSaveEdit = async () => {
    if (!activeFace) return;
    
    // Update local state immediately
    updateFace(activeFace.id, {
      personName: editName,
      personTitle: editTitle,
      linkedinUrl: editLinkedIn,
    });

    // Save to server
    try {
      const updatedFaces = faces.map(f => f.id === activeFace.id 
        ? { ...f, personName: editName, personTitle: editTitle, linkedinUrl: editLinkedIn }
        : f
      );
      
      const res = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          faces: updatedFaces,
        }),
      });
      
      if (res.ok) {
        setIsEditing(false);
        // Refresh from server to ensure sync
        const data = await res.json();
        if (data.data?.faces) {
          setFaces(data.data.faces);
        }
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Failed to save', err);
      alert('Failed to save. Please try again.');
    }
  };

  const handleLinkedInClick = (url: string | undefined) => {
    if (!url) return;
    
    // Format URL properly
    let linkedInUrl = url.trim();
    if (!linkedInUrl.startsWith('http')) {
      linkedInUrl = `https://${linkedInUrl}`;
    }
    
    // Open in LinkedIn app if on mobile, or new tab
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  // Stop scanner after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowScanner(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        No event data loaded. Please go to Admin first.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center">
      
      {/* Branding Header */}
      <div className="absolute top-6 z-30 text-center w-full pointer-events-none mix-blend-difference">
        <h1 className="text-[var(--color-cyan)] font-bold tracking-widest text-xs uppercase opacity-80">
          AICE INTELLIGENCE VISION
        </h1>
      </div>

      {/* Main Image Stage */}
      <div className="relative max-w-full w-full md:max-w-4xl aspect-auto">
        <img 
          src={imageUrl} 
          alt="Event" 
          className="w-full h-auto object-contain"
        />
        
        {/* Overlays */}
        <FaceOverlay />
        
        {/* Scanner Effect */}
        <AnimatePresence>
          {showScanner && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 pointer-events-none"
            >
              <Scanner />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Sheet Drawer */}
      <Drawer.Root 
        open={!!activeFaceId} 
        onOpenChange={(open) => !open && setActiveFace(null)}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col outline-none">
            
            {/* Glass Card */}
            <div className="glass-sheet p-6 rounded-t-[2rem] flex flex-col gap-6 pb-12 mx-auto max-w-md w-full relative">
              
              {/* Handle */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full self-center mb-2" />
              
              {activeFace && (
                <div className="flex flex-col gap-6">
                  {/* Header with Edit Button */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col flex-1">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Your Name"
                            className="text-3xl font-bold bg-black/50 border border-white/20 rounded-lg p-2 mb-2 focus:border-[var(--color-cyan)] focus:outline-none"
                          />
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Your Title / Role"
                            className="text-lg bg-black/50 border border-white/20 rounded-lg p-2 focus:border-[var(--color-cyan)] focus:outline-none"
                          />
                        </>
                      ) : (
                        <>
                          <h2 className="text-3xl font-bold text-white tracking-tight">
                            {activeFace.personName || 'Click to Add Your Info'}
                          </h2>
                          <p className="text-[var(--color-comet)] text-lg font-medium">
                            {activeFace.personTitle || 'Event Attendee'}
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={20} className="text-white/60" />
                    </button>
                  </div>

                  {/* LinkedIn Input/Button */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editLinkedIn}
                        onChange={(e) => setEditLinkedIn(e.target.value)}
                        placeholder="linkedin.com/in/yourprofile or full URL"
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-3 focus:border-[var(--color-cyan)] focus:outline-none text-white"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center justify-center gap-2 w-full bg-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/80 text-black py-3 rounded-xl font-bold transition-all"
                      >
                        <Save size={18} />
                        Save Profile
                      </button>
                    </div>
                  ) : (
                    <>
                      {activeFace.linkedinUrl ? (
                        <button
                          onClick={() => handleLinkedInClick(activeFace.linkedinUrl)}
                          className="flex items-center justify-center gap-3 w-full bg-[#0077b5] hover:bg-[#006097] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-900/50 transition-all active:scale-95"
                        >
                          <Linkedin size={24} />
                          Open LinkedIn Profile
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-white/60 text-sm text-center">
                            LinkedIn profile not added yet. Click Edit to add yours!
                          </p>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 py-3 rounded-xl font-semibold transition-all"
                          >
                            <Edit2 size={18} />
                            Add My LinkedIn
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="text-center mt-2 pt-4 border-t border-white/10">
                    <p className="text-xs text-white/30 uppercase tracking-widest">
                      Powered by AICE Services
                    </p>
                    <p className="text-xs text-white/20 mt-1">
                      Fast Execution • AI-Powered • Growth Focused
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
