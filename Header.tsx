import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { SystemConfig } from '../types';

interface HeaderProps {
  config: SystemConfig;
}

const Header: React.FC<HeaderProps> = ({ config }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-8 py-4">
        <div className="flex justify-between items-center h-24 relative">
          
          {/* Left Section: Primary Seal */}
          <div className="flex items-center gap-8 z-10">
            <div className="relative group">
              <div className="h-20 w-20 bg-slate-900 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-slate-50 overflow-hidden ring-1 ring-slate-200 transition-transform group-hover:scale-105 duration-500">
                {config.logoLeft ? (
                  <img src={config.logoLeft} alt="Primary Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-white font-black text-xl italic tracking-tighter">AMS</div>
                )}
              </div>
            </div>
          </div>

          {/* Center Section: Institutional Identity Header */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
            <div className="pointer-events-auto text-center space-y-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight max-w-[900px]">
                {config.collegeName || "Academic Management System"}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-0.5 w-6 bg-indigo-200 rounded-full"></div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">ACADEMIC MANAGEMENT SYSTEM</p>
                <div className="h-0.5 w-6 bg-indigo-200 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right Section: Date & Time Only */}
          <div className="flex items-center gap-6 z-10">
            <div className="flex flex-col items-end justify-center">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="h-3 w-3" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{formatDate(currentTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-600">
                <Clock className="h-4 w-4" />
                <span className="text-xl font-black tabular-nums tracking-tighter">{formatTime(currentTime)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;