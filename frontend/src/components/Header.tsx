import React, { useState, useEffect } from 'react';
import { CorridorInfo } from '../types';
import { 
  Wind, 
  Search, 
  Share2, 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  Camera,
  Activity,
  ChevronDown,
  Globe
} from 'lucide-react';

interface HeaderProps {
  corridors: CorridorInfo[];
  selectedCorridor: CorridorInfo | null;
  onSelectCorridor: (c: CorridorInfo) => void;
  onOpenAttribution: () => void;
  onOpenFederated: () => void;
  onOpenPolicy: () => void;
  onOpenAlerts: () => void;
  onOpenCitizen: () => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  corridors,
  selectedCorridor,
  onSelectCorridor,
  onOpenAttribution,
  onOpenFederated,
  onOpenPolicy,
  onOpenAlerts,
  onOpenCitizen,
  activeAlertCount
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-[1000] shrink-0 h-16 w-full bg-space-900/95 border-b border-slate-800/80 backdrop-blur-md px-4 flex items-center justify-between">
      {/* Brand & Project Logo */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/30 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
          <Wind className="w-5 h-5 text-cyan-400" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-wider text-slate-100 font-mono">
              AERO<span className="text-cyan-400">PULSE</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 rounded-full uppercase">
              BRICS 2026
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono tracking-tight">
            Trans-Boundary Climate Action & Source Attribution
          </p>
        </div>
      </div>

      {/* Global Corridor Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-space-800/90 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-space-800 text-sm font-medium transition-all shadow-sm"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Active BRICS Corridor</div>
            <div className="text-xs font-semibold text-slate-200">
              {selectedCorridor?.name || 'Select Corridor'}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-12 left-0 w-80 bg-space-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-[9999]">
            <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 border-b border-slate-800">
              SWITCH TRANS-BOUNDARY CORRIDOR
            </div>
            <div className="space-y-1 mt-1">
              {corridors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCorridor(c);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex flex-col ${
                    selectedCorridor?.id === c.id
                      ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-200'
                      : 'hover:bg-space-800/80 text-slate-300'
                  }`}
                >
                  <span className="font-semibold text-xs">{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {c.brics_nations.join(' • ')} ({c.facilities_count} registered facilities)
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons & Status Indicators */}
      <div className="flex items-center space-x-2.5">
        {/* AeroTrace Feature (User's suggested innovation) */}
        <button
          onClick={onOpenAttribution}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-cyan-600/30 transition-all border border-cyan-400/40"
        >
          <Search className="w-3.5 h-3.5 animate-pulse" />
          <span>Inspect Source (AeroTrace)</span>
        </button>

        {/* Federated Learning Status */}
        <button
          onClick={onOpenFederated}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-space-800/90 border border-purple-500/30 hover:border-purple-500/60 hover:bg-space-800 text-purple-300 text-xs font-mono transition-all"
        >
          <Share2 className="w-3.5 h-3.5 text-purple-400" />
          <span>BRICS FedMesh (5/5)</span>
        </button>

        {/* What-If Policy Sandbox */}
        <button
          onClick={onOpenPolicy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-space-800/90 border border-slate-700 hover:border-cyan-500/50 hover:bg-space-800 text-slate-200 text-xs font-mono transition-all"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Policy Sandbox</span>
        </button>

        {/* Bilateral OASIS CAP Alerts */}
        <button
          onClick={onOpenAlerts}
          className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-space-800/90 border border-rose-500/40 hover:border-rose-500/80 hover:bg-space-800 text-rose-300 text-xs font-mono transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>CAP Alerts</span>
          {activeAlertCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] font-bold rounded-full">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* Citizen Air Guardian */}
        <button
          onClick={onOpenCitizen}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-space-800/80 border border-slate-700 hover:border-emerald-500/50 hover:bg-space-800 text-emerald-300 text-xs font-mono transition-all"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span>Citizen Report</span>
        </button>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-space-950/80 border border-slate-800 text-[11px] font-mono text-cyan-400">
          <Activity className="w-3 h-3 text-cyan-500 animate-pulse" />
          <span>{utcTime}</span>
        </div>
      </div>
    </header>
  );
};
