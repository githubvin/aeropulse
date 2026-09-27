import React from 'react';
import { Wind, Activity, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { FluxResponse, CorridorInfo } from '../types';

interface TelemetryHUDProps {
  corridor: CorridorInfo;
  fluxData: FluxResponse | null;
  currentAqi: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  corridor,
  fluxData,
  currentAqi
}) => {
  const getAqiColor = (aqi: number) => {
    if (aqi > 300) return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    if (aqi > 200) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  };

  const getAqiLabel = (aqi: number) => {
    if (aqi > 350) return 'Hazardous / Emergency';
    if (aqi > 250) return 'Very Severe';
    if (aqi > 150) return 'Unhealthy';
    return 'Moderate';
  };

  return (
    <div className="absolute top-20 right-6 z-20 w-80 space-y-3 pointer-events-auto">
      {/* Primary AQI & Hazard Card */}
      <div className="glass-panel rounded-2xl p-4 shadow-xl border border-slate-700/60">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="uppercase tracking-wider">Sector Air Quality Index</span>
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        <div className="flex items-baseline space-x-3">
          <div className="text-4xl font-extrabold font-mono text-slate-100 tracking-tight">
            {currentAqi}
          </div>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border ${getAqiColor(currentAqi)}`}>
            {getAqiLabel(currentAqi)}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
          <span>Particulate PM2.5:</span>
          <span className="font-bold text-rose-300">{(currentAqi * 0.72).toFixed(1)} µg/m³</span>
        </div>
      </div>

      {/* Cross-Border Mass Flux Card */}
      <div className="glass-panel rounded-2xl p-4 shadow-xl border border-pink-500/30">
        <div className="flex items-center justify-between text-xs font-mono text-pink-300 mb-2">
          <span className="uppercase tracking-wider font-semibold">Virtual Border Flux Gate</span>
          <ArrowRight className="w-3.5 h-3.5 text-pink-400" />
        </div>

        <div className="text-[11px] text-slate-400 font-mono mb-2 truncate">
          {fluxData?.boundary_name || 'Trans-Boundary Line Gate'}
        </div>

        <div className="grid grid-cols-2 gap-2 text-center bg-space-950/60 p-2.5 rounded-xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Mass Flux Rate</div>
            <div className="text-lg font-bold font-mono text-pink-400">
              {fluxData?.transport_rate_kg_hr || 1420} <span className="text-xs font-normal text-slate-400">kg/h</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">24h Net Transfer</div>
            <div className="text-lg font-bold font-mono text-slate-100">
              {fluxData?.net_accumulation_tons_24h || 34.1} <span className="text-xs font-normal text-slate-400">Tons</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span>Flow Trajectory:</span>
          <span className="px-2 py-0.5 bg-pink-950/50 text-pink-300 border border-pink-500/30 rounded font-bold">
            {fluxData?.direction_arrow || 'NW ➔ SE'}
          </span>
        </div>
      </div>

      {/* Atmospheric Vectors Card */}
      <div className="glass-panel rounded-2xl p-3.5 shadow-xl border border-slate-700/60 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="uppercase text-[10px] tracking-wider">Meteorological Flow</span>
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Surface Wind:</span>
          <span className="font-bold text-cyan-400">
            {corridor.wind_profile.speed_kmh} km/h ({corridor.wind_profile.compass})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Bearing Angle:</span>
          <span className="font-bold text-slate-200">{corridor.wind_profile.direction_deg}° from North</span>
        </div>
      </div>
    </div>
  );
};
