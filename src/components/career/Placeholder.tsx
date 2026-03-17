'use client';
import { Construction } from 'lucide-react';
export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-40 rounded-[4rem] bg-slate-50/50 border border-dashed border-slate-200/60 relative overflow-hidden group">
      {/* Background Accent for Placeholder */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6">
        <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl shadow-slate-900/5 flex items-center justify-center text-slate-300 mb-10 border border-slate-100 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
          <Construction size={48} strokeWidth={1.5} />
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-primary/10">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Module in Development
        </div>
        
        <h3 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">
          {name}
        </h3>
        
        <p className="text-slate-400 font-bold leading-relaxed mb-10 opacity-80 italic">
          "We are currently architecting an interactive, high-fidelity visualization module for your data. This feature will be live in the next release."
        </p>

        <div className="flex items-center gap-3 w-full">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Coming Soon</span>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
        </div>
      </div>
    </div>
  );
}
