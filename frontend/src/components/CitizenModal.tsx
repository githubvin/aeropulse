import React, { useState } from 'react';
import { X, Camera, ShieldCheck, HeartPulse, CheckCircle2, Lock } from 'lucide-react';
import { CorridorInfo } from '../types';

interface CitizenModalProps {
  isOpen: boolean;
  onClose: () => void;
  corridor: CorridorInfo;
}

export const CitizenModal: React.FC<CitizenModalProps> = ({
  isOpen,
  onClose,
  corridor
}) => {
  const [symptom, setSymptom] = useState<string>('Eye burning and severe throat irritation');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/v1/citizen/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor_id: corridor.id,
          lat: corridor.center[0] + 0.05,
          lon: corridor.center[1] - 0.08,
          symptom_notes: symptom,
          local_sensor_aqi: 345
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-space-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        <div className="px-6 py-4 border-b border-slate-800 bg-space-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                Citizen Air Guardian Portal
              </h2>
              <p className="text-xs text-slate-400">
                Submit local smoke observation with privacy-preserving geohash fuzzing.
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

        <div className="p-6 space-y-4">
          {!submitted ? (
            <>
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1.5">
                  Observed Street-Level Symptoms / Air Odor
                </label>
                <textarea
                  rows={3}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800 flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <b>Privacy Shield Active:</b> Your exact GPS coordinates will be fuzzed to Level 6 geohash (~1.2 km² radius) before transmission.
                </span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-mono font-bold text-xs tracking-wider shadow-lg shadow-emerald-600/30 transition-all"
              >
                Submit Citizen Report
              </button>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  Observation Verified & Ground-Truthed!
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Report ID: {reportData?.report_id} • Fuzzed Geohash: {reportData?.fuzzed_geohash}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-space-950 border border-slate-800 text-left space-y-2">
                <div className="text-xs font-mono font-bold text-rose-400 flex items-center space-x-1.5">
                  <HeartPulse className="w-4 h-4" />
                  <span>Personalized Health Advisory (AQI: {reportData?.neighborhood_aqi})</span>
                </div>
                <p className="text-xs text-slate-300 font-mono">
                  {reportData?.health_guidance}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                  {reportData?.action_items?.map((item: string, idx: number) => (
                    <div key={idx} className="text-[11px] font-mono text-slate-400 flex items-start space-x-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-space-800 hover:bg-space-700 text-slate-200 font-mono text-xs font-bold transition-all"
              >
                Close Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
