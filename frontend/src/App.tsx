import React, { useState, useEffect } from 'react';
import { 
  CorridorInfo, 
  CorridorForecastResponse, 
  FluxResponse, 
  AttributionResponse, 
  CAPAlertResponse 
} from './types';
import { Header } from './components/Header';
import { DigitalTwinMap } from './components/Map/DigitalTwinMap';
import { TimelineScrubber } from './components/TimelineScrubber';
import { TelemetryHUD } from './components/TelemetryHUD';
import { AttributionModal } from './components/AttributionModal';
import { FederatedMeshModal } from './components/FederatedMeshModal';
import { PolicySandboxModal } from './components/PolicySandboxModal';
import { AlertFeedModal } from './components/AlertFeedModal';
import { CitizenModal } from './components/CitizenModal';

export const App: React.FC = () => {
  const [corridors, setCorridors] = useState<CorridorInfo[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<CorridorInfo | null>(null);
  const [forecastData, setForecastData] = useState<CorridorForecastResponse | null>(null);
  const [activeSnapshotIdx, setActiveSnapshotIdx] = useState<number>(0);
  const [fluxData, setFluxData] = useState<FluxResponse | null>(null);
  const [attributionData, setAttributionData] = useState<AttributionResponse | null>(null);
  const [alerts, setAlerts] = useState<CAPAlertResponse[]>([]);
  const [curtailmentRatio, setCurtailmentRatio] = useState<number>(1.0);

  // Modal Visibility State
  const [attributionOpen, setAttributionOpen] = useState<boolean>(false);
  const [federatedOpen, setFederatedOpen] = useState<boolean>(false);
  const [policyOpen, setPolicyOpen] = useState<boolean>(false);
  const [alertsOpen, setAlertsOpen] = useState<boolean>(false);
  const [citizenOpen, setCitizenOpen] = useState<boolean>(false);

  // 1. Fetch Corridors & Initial Data
  useEffect(() => {
    const initData = async () => {
      try {
        const cRes = await fetch('/api/v1/corridors');
        if (cRes.ok) {
          const cData: CorridorInfo[] = await cRes.json();
          setCorridors(cData);
          if (cData.length > 0) {
            setSelectedCorridor(cData[0]);
          }
        }

        const aRes = await fetch('/api/v1/alerts/active');
        if (aRes.ok) {
          const aData: CAPAlertResponse[] = await aRes.json();
          setAlerts(aData);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    initData();
  }, []);

  // 2. Fetch Forecast & Flux whenever selected corridor changes
  useEffect(() => {
    if (!selectedCorridor) return;

    const loadCorridorData = async () => {
      try {
        const [fRes, fluxRes] = await Promise.all([
          fetch(`/api/v1/simulation/forecast/${selectedCorridor.id}`),
          fetch(`/api/v1/simulation/flux/${selectedCorridor.id}?curtailment=${curtailmentRatio}`)
        ]);

        if (fRes.ok) {
          const fData: CorridorForecastResponse = await fRes.json();
          setForecastData(fData);
          setActiveSnapshotIdx(0);
        }

        if (fluxRes.ok) {
          const fluxDataRes: FluxResponse = await fluxRes.json();
          setFluxData(fluxDataRes);
        }
      } catch (err) {
        console.error('Failed to load corridor simulation:', err);
      }
    };

    loadCorridorData();
  }, [selectedCorridor, curtailmentRatio]);

  // Handle Corridor Selection
  const handleSelectCorridor = (c: CorridorInfo) => {
    setSelectedCorridor(c);
    setAttributionData(null); // Reset attribution when switching corridors
  };

  // Handle Dispatching a new CAP Alert
  const handleDispatchAlert = async (headline: string, facilityId?: string) => {
    if (!selectedCorridor) return;
    try {
      const res = await fetch('/api/v1/alerts/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor_id: selectedCorridor.id,
          event_type: 'Trans-Boundary Hazardous Smog Influx',
          severity: 'Severe',
          urgency: 'Immediate',
          headline: headline,
          primary_source_id: facilityId || 'FAC-IN-001',
          recipient_jurisdictions: ['Cross-Border Coordinating Council']
        })
      });

      if (res.ok) {
        const newAlert: CAPAlertResponse = await res.json();
        setAlerts((prev) => [newAlert, ...prev]);
        setAlertsOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeSnapshot = forecastData?.forecast_snapshots[activeSnapshotIdx] || null;
  const currentAqi = activeSnapshot ? activeSnapshot.max_aqi : 342;

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-space-950 text-slate-100 font-sans">
      {/* Top Header Banner & Corridor Switcher */}
      <Header
        corridors={corridors}
        selectedCorridor={selectedCorridor}
        onSelectCorridor={handleSelectCorridor}
        onOpenAttribution={() => setAttributionOpen(true)}
        onOpenFederated={() => setFederatedOpen(true)}
        onOpenPolicy={() => setPolicyOpen(true)}
        onOpenAlerts={() => setAlertsOpen(true)}
        onOpenCitizen={() => setCitizenOpen(true)}
        activeAlertCount={alerts.length}
      />

      {/* Main Geospatial Digital Twin Viewport */}
      {selectedCorridor && (
        <main className="relative flex-1 w-full min-h-0 overflow-hidden">
          <DigitalTwinMap
            corridor={selectedCorridor}
            activeSnapshot={activeSnapshot}
            attributionData={attributionData}
            curtailmentRatio={curtailmentRatio}
          />

          {/* Floating Telemetry HUD */}
          <TelemetryHUD
            corridor={selectedCorridor}
            fluxData={fluxData}
            currentAqi={currentAqi}
          />

          {/* Bottom 48-Hour Predictive Plume Scrubber */}
          {forecastData && (
            <TimelineScrubber
              snapshots={forecastData.forecast_snapshots}
              activeIndex={activeSnapshotIdx}
              onSelectIndex={setActiveSnapshotIdx}
              inversionRisk={forecastData.meteorological_conditions.inversion_risk}
            />
          )}
        </main>
      )}

      {/* Modals */}
      {selectedCorridor && (
        <>
          <AttributionModal
            isOpen={attributionOpen}
            onClose={() => setAttributionOpen(false)}
            corridor={selectedCorridor}
            onAttributionComplete={(data) => {
              setAttributionData(data);
              setAttributionOpen(false); // Close modal and focus on map
            }}
            onTriggerCAPAlert={(facName) => {
              setAttributionOpen(false);
              handleDispatchAlert(`Targeted Emergency Notice: High-Emission Output from ${facName}`, facName);
            }}
          />

          <FederatedMeshModal
            isOpen={federatedOpen}
            onClose={() => setFederatedOpen(false)}
          />

          <PolicySandboxModal
            isOpen={policyOpen}
            onClose={() => setPolicyOpen(false)}
            corridor={selectedCorridor}
            onApplyCurtailmentRatio={(ratio) => setCurtailmentRatio(ratio)}
          />

          <AlertFeedModal
            isOpen={alertsOpen}
            onClose={() => setAlertsOpen(false)}
            alerts={alerts}
            corridor={selectedCorridor}
            onDispatchAlert={(headline) => handleDispatchAlert(headline)}
          />

          <CitizenModal
            isOpen={citizenOpen}
            onClose={() => setCitizenOpen(false)}
            corridor={selectedCorridor}
          />
        </>
      )}
    </div>
  );
};
