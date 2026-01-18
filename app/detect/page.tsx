'use client';

import { useState, useRef, useEffect } from 'react';
import { Linkedin, X, Plus, Loader2, RefreshCw, ExternalLink, Users } from 'lucide-react';

const EVENT_PHOTO = '/event-photo.jpeg';

interface Tag {
  id: string;
  x: number;
  y: number;
  name: string;
  linkedinUrl: string;
}

export default function FaceTaggingPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showTags, setShowTags] = useState(false);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await fetch('/api/tags');
        const data = await response.json();
        if (data.tags && Array.isArray(data.tags)) {
          setTags(data.tags);
        }
      } catch (error) {
        console.error('Error loading tags:', error);
        const saved = localStorage.getItem('entrepreneurs-mixer-tags');
        if (saved) {
          try {
            setTags(JSON.parse(saved));
          } catch (e) {
            console.log('No saved tags found');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (tags.length === 0 && !lastSaved) return;

    const saveTimeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags }),
        });
        localStorage.setItem('entrepreneurs-mixer-tags', JSON.stringify(tags));
        setLastSaved(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error saving tags:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [tags, isLoading]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAddingTag) {
      if (!imgContainerRef.current) return;
      const rect = imgContainerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        x,
        y,
        name: '',
        linkedinUrl: '',
      };

      setTags(prev => [...prev, newTag]);
      setSelectedTagId(newTag.id);
      setShowTags(true);
      setIsAddingTag(false);
      return;
    }
    
    setShowTags(!showTags);
    if (showTags) {
      setSelectedTagId(null);
    }
  };

  const handleTagClick = (e: React.MouseEvent, tagId: string) => {
    e.stopPropagation();
    setSelectedTagId(tagId === selectedTagId ? null : tagId);
  };

  const handleUpdateTag = (tagId: string, field: 'name' | 'linkedinUrl', value: string) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId ? { ...tag, [field]: value } : tag
    ));
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    if (selectedTagId === tagId) {
      setSelectedTagId(null);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Error refreshing tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTag = (tagId: string) => {
    if (tagId === selectedTagId) {
      setSelectedTagId(null);
      setShowTags(false);
    } else {
      setSelectedTagId(tagId);
      setShowTags(true);
      if (imgContainerRef.current) {
        imgContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-['SF_Pro_Display',_-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_sans-serif]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-blue-100/50 to-cyan-100/50 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-100/30 to-pink-100/30 blur-3xl" />
      </div>

        {/* Header */}
      <header className="relative z-10 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AICE</span>
            </div>
            <span className="text-gray-400 text-lg font-light">/</span>
            <span className="text-gray-900 font-medium">Event Connect</span>
          </div>
          
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-3">
            Entrepreneurs Mixer
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 font-light mb-4">
            Mumbai · January 2026
          </p>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Can't find yourself in the photo? Tag yourself and add your LinkedIn profile to connect with fellow entrepreneurs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setIsAddingTag(!isAddingTag)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 ${
              isAddingTag
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/25'
            }`}
          >
            <Plus size={18} />
            {isAddingTag ? 'Click on yourself...' : 'Tag Yourself & Add LinkedIn'}
          </button>
          
            <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 rounded-full font-medium text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Image Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
              <div 
                ref={imgContainerRef}
                className="relative"
                onClick={handleImageClick}
                style={{ cursor: isAddingTag ? 'crosshair' : 'pointer' }}
              >
                <img
                  src={EVENT_PHOTO}
                  alt="Entrepreneurs Mixer - Mumbai"
                  className="w-full h-auto block"
                      onLoad={() => setImageLoaded(true)}
                    />
                    
                {/* Tags on Image */}
                {tags.map((tag, idx) => {
                  const isSelected = selectedTagId === tag.id;
                  const shouldShow = isSelected || (showTags && !selectedTagId);
                  
                  if (!shouldShow) return null;
                  
                  return (
                    <div
                      key={tag.id}
                      className="absolute transition-all duration-300"
                          style={{
                        left: `${tag.x}%`,
                        top: `${tag.y}%`,
                        zIndex: isSelected ? 50 : 10,
                      }}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(e, tag.id);
                        }}
                        className={`transform -translate-x-1/2 flex flex-col items-center cursor-pointer transition-all duration-200 ${
                          isSelected ? 'scale-105' : 'hover:scale-105'
                        }`}
                      >
                        <div 
                          className="w-0 h-0"
                              style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderBottom: isSelected ? '8px solid #000' : '8px solid rgba(255,255,255,0.95)',
                          }}
                        />
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shadow-lg ${
                          isSelected
                            ? 'bg-gray-900 text-white'
                            : 'bg-white/95 text-gray-900 backdrop-blur-sm'
                        }`}>
                          {tag.name || `Entrepreneur ${idx + 1}`}
                        </div>
                            </div>
                          </div>
                        );
                      })}

                {isAddingTag && (
                  <div className="absolute inset-0 bg-green-500/5 border-2 border-dashed border-green-500/50 flex items-center justify-center">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-green-600 font-medium text-sm shadow-lg">
                      Click on yourself to tag
                    </div>
                    </div>
                )}
                
                {!isAddingTag && !showTags && tags.length > 0 && !selectedTagId && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-gray-600 text-sm font-medium shadow-lg">
                    Tap to see {tags.length} {tags.length === 1 ? 'person' : 'people'}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-gray-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Event Participants</h2>
                  <p className="text-sm text-gray-500">{tags.length} {tags.length === 1 ? 'person' : 'people'}</p>
                </div>
              </div>
              
              {tags.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">No tags yet</p>
                  <p className="text-gray-400 text-sm">Be the first to tag yourself!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
{[...tags].reverse().map((tag) => {
                    const originalIdx = tags.findIndex(t => t.id === tag.id);
                    return (
                    <div
                      key={tag.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedTagId === tag.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                      onClick={() => handleSelectTag(tag.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                            selectedTagId === tag.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {originalIdx + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {tag.name || 'Unnamed'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTag(tag.id);
                          }}
                          className="text-gray-400 hover:text-red-500 p-1 rounded transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <input
                        type="text"
                        value={tag.name}
                        onChange={(e) => handleUpdateTag(tag.id, 'name', e.target.value)}
                        placeholder="Enter name"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 mb-2 focus:border-gray-400 focus:outline-none focus:ring-0 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className="flex items-center gap-2">
                        <Linkedin size={14} className="text-[#0077B5] flex-shrink-0" />
                        <input
                          type="text"
                          value={tag.linkedinUrl}
                          onChange={(e) => handleUpdateTag(tag.id, 'linkedinUrl', e.target.value)}
                          placeholder="LinkedIn URL"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-all"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {tag.linkedinUrl && (
                          <a
                            href={tag.linkedinUrl.startsWith('http') ? tag.linkedinUrl : `https://${tag.linkedinUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-[#0077B5] hover:bg-[#006097] rounded-lg transition-all flex-shrink-0"
                          >
                            <ExternalLink size={12} className="text-white" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
            
            {/* Stats */}
            {tags.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-semibold text-gray-900">{tags.length}</p>
                    <p className="text-xs text-gray-500">Tagged</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-green-600">{tags.filter(t => t.name).length}</p>
                    <p className="text-xs text-gray-500">Named</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-[#0077B5]">{tags.filter(t => t.linkedinUrl).length}</p>
                    <p className="text-xs text-gray-500">LinkedIn</p>
          </div>
        </div>
          </div>
        )}
      </div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="relative z-10 mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
            Powered by AICE
          </p>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
            Transform Your Business with AI
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-lg mx-auto">
            Automate operations, reduce costs by up to 80%, and scale efficiently with our AI consultation services.
          </p>
          <a 
            href="https://aice.services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20"
          >
            Book a Demo
          </a>
        </div>
      </footer>
    </div>
  );
}
