import React, { useState, useEffect } from 'react';
import { X, Share2, ShieldCheck, Lock, RefreshCw, Database } from 'lucide-react';
import { FederatedMeshResponse } from '../types';

interface FederatedMeshModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FederatedMeshModal: React.FC<FederatedMeshModalProps> = ({
  isOpen,
  onClose
}) => {
  const [meshData, setMeshData] = useState<FederatedMeshResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/federated/status');
      if (res.ok) {
        const data = await res.json();
        setMeshData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleTriggerRound = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/federated/trigger-round', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMeshData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-space-900 border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        <div className="px-6 py-4 border-b border-slate-800 bg-space-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                BRICS Sovereign Federated Intelligence Mesh
              </h2>
              <p className="text-xs text-slate-400">
                Collaborative model training without exporting domestic sensor telemetry or border surveillance.
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
          {/* Global Aggregator Banner */}
          <div className="glass-panel p-4 rounded-2xl border border-purple-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-purple-300 uppercase">
                Global Consensus Model: AeroNet-v2.4
              </div>
              <div className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>Training Round {meshData?.round_number || 14} of {meshData?.total_rounds || 20}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30">
                  FedAvg Protocol
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Global Convergence Loss: <b className="text-emerald-400">{meshData?.global_convergence_loss || 0.0842}</b> • Privacy Budget ε: <b className="text-cyan-400">{meshData?.privacy_budget_epsilon || 1.25}</b>
              </div>
            </div>

            <button
              onClick={handleTriggerRound}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Aggregating...' : 'Trigger Round'}</span>
            </button>
          </div>

          {/* 5 Sovereign Nodes List */}
          <div>
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Connected Sovereign Environmental Nodes (5/5 Synchronized)
            </div>
            <div className="space-y-2.5">
              {meshData?.nodes.map((node) => (
                <div
                  key={node.node_id}
                  className="p-3.5 rounded-2xl bg-space-800/40 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{node.flag}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs font-mono text-slate-200">{node.country}</span>
                        <span className="text-[10px] font-mono text-purple-400">[{node.node_id}]</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                          {node.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{node.agency}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-300 font-semibold">{node.local_samples_count.toLocaleString()} samples</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={node.sha256_hash}>
                      SHA: {node.sha256_hash.slice(0, 10)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800 flex items-center space-x-3 text-xs text-slate-300">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <b>Sovereign Isolation Shield:</b> Zero raw citizen images, ground sensor time-series, or border telemetry ever leave national firewalls. Only differential-privacy-protected gradient tensors are aggregated.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
