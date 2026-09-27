import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Upload, 
  Cpu, 
  Factory, 
  Compass, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Send,
  Sparkles
} from 'lucide-react';
import { AttributionResponse, CorridorInfo } from '../types';

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  corridor: CorridorInfo;
  onAttributionComplete: (data: AttributionResponse) => void;
  onTriggerCAPAlert: (facilityName: string) => void;
}

export const AttributionModal: React.FC<AttributionModalProps> = ({
  isOpen,
  onClose,
  corridor,
  onAttributionComplete,
  onTriggerCAPAlert
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('preset-coal');
  const [searchRadius, setSearchRadius] = useState<number>(50.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AttributionResponse | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'preset-coal',
      name: 'High-Temperature Industrial Coal Stack Plume',
      type: 'Industrial Coal/Soot',
      lat: corridor.center[0] - 0.25,
      lon: corridor.center[1] + 0.15,
      imageNote: 'High optical contrast black/dark-gray vertical plume rise.'
    },
    {
      id: 'preset-biomass',
      name: 'Agricultural Stubble / Biomass Burning Arc',
      type: 'Agricultural Stubble/Biomass',
      lat: corridor.center[0] + 0.40,
      lon: corridor.center[1] - 0.35,
      imageNote: 'Orange/gray low-lying smoke cloud stretching across farm clusters.'
    },
    {
      id: 'preset-chemical',
      name: 'Petrochemical / Refinery Smelter Flare',
      type: 'Chemical/Sulfur Plume',
      lat: corridor.center[0] + 0.10,
      lon: corridor.center[1] + 0.30,
      imageNote: 'Yellowish-white acid aerosol mist and continuous flared gas plume.'
    }
  ];

  const handleRunAeroTrace = async () => {
    setLoading(true);
    setResult(null);

    const preset = presets.find((p) => p.id === selectedPreset) || presets[0];

    try {
      const formData = new FormData();
      formData.append('lat', preset.lat.toString());
      formData.append('lon', preset.lon.toString());
      formData.append('corridor_id', corridor.id);
      formData.append('search_radius_km', searchRadius.toString());
      formData.append('observed_aqi', '348.0');

      const response = await fetch('/api/v1/attribution/trace', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Attribution API call failed');
      }

      const data: AttributionResponse = await response.json();
      setResult(data);
      onAttributionComplete(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-space-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-space-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Search className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide flex items-center space-x-2">
                <span>AeroTrace: Multimodal Reverse Plume Attribution</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Google Gemini 2.0 AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspects photo smoke signature, runs reverse wind trajectory physics, and pinpoints upwind culprit factories.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Input Source & Presets */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-2">
              1. Select Smoke Observation Source (Photo / Sensor Spike)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {presets.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                    selectedPreset === p.id
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/20'
                      : 'bg-space-800/60 border-slate-700/80 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold font-mono mb-1">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.imageNote}</div>
                  <div className="mt-2 text-[10px] font-mono text-cyan-400 font-semibold">
                    Signature: {p.type}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Atmospheric Upwind Search Radius Slider */}
          <div className="bg-space-800/40 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300 font-bold uppercase tracking-wider">
                2. Upwind Search Radius Cone:
              </span>
              <span className="text-cyan-400 font-bold text-sm">{searchRadius} km</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-space-950 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>15 km (Local Municipal)</span>
              <span>50 km (Regional Corridor)</span>
              <span>100 km (Trans-Boundary Boundary)</span>
            </div>
          </div>

          {/* Execution Button */}
          <button
            onClick={handleRunAeroTrace}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Running Gemini 2.0 Inspection & Lagrangian Back-Trajectory...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Execute AeroTrace Reverse Attribution</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {/* Gemini Visual Inspection Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30">
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300 mb-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold uppercase">Google Gemini 2.0 Flash Visual Inspection</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Classified Smoke Signature:</span>
                      <span className="text-white font-bold">{result.visual_inspection.smoke_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Plume Color Profile:</span>
                      <span className="text-slate-200 font-bold">{result.visual_inspection.plume_color_signature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Optical Opacity Gauge:</span>
                      <span className="text-amber-400 font-bold">{result.visual_inspection.visual_opacity_pct}%</span>
                    </div>
                  </div>
                </div>

                {/* Physics Back-Trajectory Metrics */}
                <div className="glass-panel p-4 rounded-2xl border border-sky-500/30">
                  <div className="flex items-center space-x-2 text-xs font-mono text-sky-300 mb-2">
                    <Compass className="w-4 h-4 text-sky-400" />
                    <span className="font-bold uppercase">Atmospheric Back-Trajectory Physics</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Plausible Travel Distance:</span>
                      <span className="text-cyan-400 font-bold">
                        {result.reverse_trajectory.curvilinear_distance_km} km upwind
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estimated Transit Time:</span>
                      <span className="text-white font-bold">
                        {result.reverse_trajectory.transit_time_hours} hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mean Wind Vector:</span>
                      <span className="text-slate-200 font-bold">
                        {result.reverse_trajectory.mean_wind_speed_kmh} km/h @ {result.reverse_trajectory.mean_wind_direction_deg}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Culprit Ranking Cards */}
              <div>
                <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Identified Culprit Sources in Upwind Cone ({result.ranked_culprits.length} Facilities Evaluated)
                </div>
                <div className="space-y-3">
                  {result.ranked_culprits.map((c) => {
                    const isTop = c.rank === 1;
                    return (
                      <div
                        key={c.facility_id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isTop
                            ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/30'
                            : 'bg-space-800/40 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  isTop ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {isTop ? '🚨 PRIMARY CULPRIT' : `#${c.rank} SECONDARY`}
                              </span>
                              <h3 className="text-sm font-bold text-slate-100">{c.name}</h3>
                            </div>
                            <div className="text-xs text-slate-400 font-mono mt-1">
                              {c.category} • Fuel: <span className="text-slate-200">{c.fuel_type}</span>
                            </div>
                          </div>

                          <div className="text-right font-mono">
                            <div className="text-lg font-bold text-rose-400">{c.match_score_pct}%</div>
                            <div className="text-[10px] text-slate-400">Match Confidence</div>
                          </div>
                        </div>

                        {/* Plausible Travel Distance and Transit Time Badges */}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
                          <span className="px-2.5 py-1 rounded-lg bg-space-900 border border-slate-700 text-cyan-300">
                            📏 Distance from Source: <b>{c.distance_km} km</b>
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-space-900 border border-slate-700 text-slate-300">
                            ⏳ Atmospheric Transit Time: <b>{c.transit_time_hrs} hrs</b>
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-space-900 border border-slate-700 text-amber-300">
                            📍 Coordinates: [{c.coordinates[0].toFixed(2)}, {c.coordinates[1].toFixed(2)}]
                          </span>
                        </div>

                        {/* Gemini Explainable Reasoning */}
                        <div className="mt-2.5 p-2.5 rounded-xl bg-space-950/80 border border-slate-800/80 text-xs text-slate-300">
                          <b className="text-cyan-400 font-mono">Gemini AI Reasoning: </b>
                          {c.reasoning}
                        </div>

                        {isTop && (
                          <div className="mt-3 flex justify-end">
                            <button
                              onClick={() => onTriggerCAPAlert(c.name)}
                              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold font-mono shadow-md shadow-rose-600/30 transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Dispatch Bilateral CAP Notice</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
