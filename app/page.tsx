import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md w-full glass p-10 rounded-3xl border border-white/10 flex flex-col gap-8 items-center relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-cyan)] to-transparent opacity-50" />
        
        <h1 className="text-4xl font-bold tracking-tighter text-white">
          Event<span className="text-[var(--color-cyan)]">Connect</span>
          </h1>
        
        <p className="text-white/60 text-lg">
          AI-Powered Networking Visualization Tool.
          <br />
          Upload photos, auto-detect faces, and create shareable connection hubs.
        </p>

        <Link 
          href="/admin" 
          className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
        >
          Launch Admin
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <div className="mt-8 pt-8 border-t border-white/10 w-full">
          <p className="text-xs text-white/20 uppercase tracking-widest">
            AICE Services Internal Tool
          </p>
        </div>
        </div>
    </div>
  );
}
