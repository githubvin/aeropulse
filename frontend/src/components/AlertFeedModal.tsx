import React, { useState } from 'react';
import { X, AlertTriangle, Send, ShieldAlert, Code2, Globe } from 'lucide-react';
import { CAPAlertResponse, CorridorInfo } from '../types';

interface AlertFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CAPAlertResponse[];
  corridor: CorridorInfo;
  onDispatchAlert: (headline: string, facilityId?: string) => void;
}

export const AlertFeedModal: React.FC<AlertFeedModalProps> = ({
  isOpen,
  onClose,
  alerts,
  corridor,
  onDispatchAlert
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'dispatch' | 'xml'>('feed');
  const [selectedXml, setSelectedXml] = useState<string>('');
  const [customHeadline, setCustomHeadline] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-space-900 border border-rose-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans">
        <div className="px-6 py-4 border-b border-slate-800 bg-space-800/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                OASIS CAP v1.2 Bilateral Emergency Alert Dispatcher
              </h2>
              <p className="text-xs text-slate-400">
                Coordinated emergency protocol simultaneous dispatch to Upwind Regulators & Downwind Health Agencies.
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-space-950/60 px-6 pt-2 space-x-4">
          <button
            onClick={() => setActiveTab('feed')}
            className={`pb-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
              activeTab === 'feed'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Incident Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`pb-2.5 text-xs font-mono font-bold transition-all border-b-2 ${
              activeTab === 'dispatch'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Dispatch Bilateral Notice
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.cap_alert_id}
                  className="p-4 rounded-2xl bg-space-800/50 border border-rose-500/30 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-600 text-white">
                          SEVERITY: SEVERE
                        </span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">
                          {alert.cap_alert_id.split(':').pop()}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-100 mt-1">
                        Trans-Boundary Smog Advection Warning
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedXml(alert.cap_xml);
                        setActiveTab('xml');
                      }}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-mono transition-all"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>View CAP XML</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-space-950/60 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-400">Upwind Action Endpoint:</span>
                      <div className="text-cyan-300 truncate">{alert.upwind_action_endpoint}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Downwind Public Health:</span>
                      <div className="text-rose-300 truncate">{alert.downwind_health_endpoint}</div>
                    </div>
                  </div>

                  {/* Multilingual Advisory Preview */}
                  <div className="p-2.5 rounded-xl bg-space-950/80 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 uppercase">
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>Multilingual Citizen Broadcasts</span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      🇮🇳 <span className="text-slate-200">{alert.multilingual_advisories.hi}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      🇧🇷 <span className="text-slate-200">{alert.multilingual_advisories.pt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-slate-300 uppercase block mb-1.5">
                  Emergency Notice Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Critical 48h Industrial Smoke Influx Alert for Downwind Metros"
                  value={customHeadline}
                  onChange={(e) => setCustomHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-space-950 border border-slate-700 text-sm text-slate-100 font-mono focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-space-800/40 border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
                <div className="font-bold text-rose-400">Automated Bilateral Channels:</div>
                <div>1. Upwind State Pollution Control Board ➔ Immediate Stack Firing Curtailment Notice.</div>
                <div>2. Downwind Disaster Management Authority ➔ Hospital Alert, Mist Cannons & School Guidance.</div>
              </div>

              <button
                onClick={() => {
                  onDispatchAlert(customHeadline || 'Bilateral Cross-Border Emergency Alert');
                  setActiveTab('feed');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono font-bold text-xs tracking-wider shadow-xl shadow-rose-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Transmit OASIS CAP v1.2 Protocol</span>
              </button>
            </div>
          )}

          {activeTab === 'xml' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                <span>OASIS CAP v1.2 Standard XML Payload</span>
                <button
                  onClick={() => setActiveTab('feed')}
                  className="text-cyan-400 hover:underline"
                >
                  Back to Feed
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-space-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-[50vh]">
                {selectedXml}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
