import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';
import { ForecastSnapshot } from '../types';

interface TimelineScrubberProps {
  snapshots: ForecastSnapshot[];
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
  inversionRisk: string;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  snapshots,
  activeIndex,
  onSelectIndex,
  inversionRisk
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onSelectIndex((activeIndex + 1) % (snapshots.length || 1));
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeIndex, snapshots.length, onSelectIndex]);

  const activeSnapshot = snapshots[activeIndex] || null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-4xl glass-panel-glow rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            48-Hour Forward Advection-Diffusion Plume Forecast
          </span>
        </div>

        {/* Current Active Step Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-mono">
            <span className="text-slate-400">Timestep:</span>
            <span className="text-cyan-400 font-bold">
              {activeSnapshot ? `+${activeSnapshot.hour_offset}h Offset` : '0h'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-300">
            <span>Inversion:</span>
            <span className="font-bold">{inversionRisk}</span>
          </div>
        </div>
      </div>

      {/* Scrubber Controls & Timeline */}
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 transition-all"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* Reset Button */}
        <button
          onClick={() => {
            setIsPlaying(false);
            onSelectIndex(0);
          }}
          className="p-2 rounded-lg bg-space-800 hover:bg-space-700 text-slate-300 transition-all"
          title="Reset to 0h"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Step Buttons */}
        <div className="flex-1 grid grid-cols-9 gap-1.5 bg-space-950/70 p-1.5 rounded-xl border border-slate-800">
          {snapshots.map((snap, idx) => (
            <button
              key={snap.hour_offset}
              onClick={() => {
                setIsPlaying(false);
                onSelectIndex(idx);
              }}
              className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex flex-col items-center justify-center ${
                idx === activeIndex
                  ? 'bg-gradient-to-b from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-cyan-500/40 scale-105'
                  : 'hover:bg-slate-800/80 text-slate-400'
              }`}
            >
              <span>{snap.hour_offset === 0 ? 'NOW' : `+${snap.hour_offset}h`}</span>
              <span className="text-[9px] opacity-75">{snap.max_aqi} AQI</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
