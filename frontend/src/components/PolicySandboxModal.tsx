import React, { useState, useEffect } from 'react';
import { X, Sliders, TrendingDown, HeartPulse, ShieldCheck, ArrowRight } from 'lucide-react';
import { PolicySimulationResponse, CorridorInfo } from '../types';

interface PolicySandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  corridor: CorridorInfo;
  onApplyCurtailmentRatio: (ratio: number) => void;
}

export const PolicySandboxModal: React.FC<PolicySandboxModalProps> = ({
  isOpen,
  onClose,
  corridor,
  onApplyCurtailmentRatio
}) => {
  const [agri, setAgri] = useState<number>(40);
  const [ind, setInd] = useState<number>(30);
  const [traffic, setTraffic] = useState<number>(20);
  const [simResult, setSimResult] = useState<PolicySimulationResponse | null>(null);

  const runSimulation = async () => {
    try {
      const res = await fetch('/api/v1/policy/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor_id: corridor.id,
          agricultural_curtailment_pct: agri,
          industrial_curtailment_pct: ind,
          traffic_restriction_pct: traffic
        })
      });

      if (res.ok) {
        const data: PolicySimulationResponse = await res.json();
        setSimResult(data);
        onApplyCurtailmentRatio(1.0 - (data.net_reduction_pct / 100.0));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runSimulation();
    }
  }, [isOpen, agri, ind, traffic]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-space-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        <div className="px-6 py-4 border-b border-slate-800 bg-space-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                Trans-Boundary 'What-If' Policy Intervention Sandbox
              </h2>
              <p className="text-xs text-slate-400">
                Simulate the downstream cross-border air quality improvements of proactive emission cuts.
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

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Sliders Grid */}
          <div className="space-y-4 bg-space-800/40 p-4 rounded-2xl border border-slate-800">
            {/* Agri Stubble Burning */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold">🌾 Agricultural Biomass / Stubble Burning Curtailment</span>
                <span className="text-amber-400 font-bold">{agri}% Reduction</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={agri}
                onChange={(e) => setAgri(Number(e.target.value))}
                className="w-full accent-amber-500 bg-space-950 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Industrial Stacks */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold">🏭 Heavy Industrial Stack & Boiler Firing Curtailment</span>
                <span className="text-cyan-400 font-bold">{ind}% Reduction</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ind}
                onChange={(e) => setInd(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-space-950 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Traffic Corridor Restrictions */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-slate-300 font-bold">🚚 Heavy Diesel Freight Corridor Diversion</span>
                <span className="text-purple-400 font-bold">{traffic}% Reduction</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={traffic}
                onChange={(e) => setTraffic(Number(e.target.value))}
                className="w-full accent-purple-500 bg-space-950 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          {/* Impact Projections */}
          {simResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Projected Downwind PM2.5</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 my-1">
                  {simResult.projected_peak_pm25} <span className="text-xs text-slate-400">µg/m³</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-300 font-semibold flex items-center justify-center space-x-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>-{simResult.net_reduction_pct}% Net Reduction</span>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-pink-500/40 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Border Mass Flux Removed</div>
                <div className="text-2xl font-bold font-mono text-pink-400 my-1">
                  {simResult.cross_border_flux_reduced_kg_hr} <span className="text-xs text-slate-400">kg/h</span>
                </div>
                <div className="text-[11px] font-mono text-pink-300">Prevented Boundary Transport</div>
              </div>

              <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated Health Impact</div>
                <div className="text-2xl font-bold font-mono text-cyan-300 my-1">
                  {simResult.estimated_hospital_admissions_prevented}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 flex items-center justify-center space-x-1">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>Hospital ER Visits Avoided</span>
                </div>
              </div>
            </div>
          )}

          {/* Summary Text */}
          {simResult && (
            <div className="p-4 rounded-2xl bg-space-950/80 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
              <b className="text-cyan-400">Simulated Action Plan: </b>
              {simResult.curtailment_plan_summary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
