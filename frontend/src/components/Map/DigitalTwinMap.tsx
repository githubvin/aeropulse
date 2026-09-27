import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CorridorInfo, ForecastSnapshot, AttributionResponse } from '../../types';
import { WindCanvas } from './WindCanvas';

interface DigitalTwinMapProps {
  corridor: CorridorInfo;
  activeSnapshot: ForecastSnapshot | null;
  attributionData: AttributionResponse | null;
  curtailmentRatio: number;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  corridor,
  activeSnapshot,
  attributionData,
  curtailmentRatio
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const attributionGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: corridor.center,
        zoom: corridor.default_zoom,
        zoomControl: false,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Add zoom control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      const attributionGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = layersGroup;
      attributionGroupRef.current = attributionGroup;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update corridor position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(corridor.center, corridor.default_zoom, { duration: 1.2 });
  }, [corridor]);

  // Render Plumes, Border Fence & Facilities
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw Virtual Cross-Border Fence
    if (corridor.cross_border_line && corridor.cross_border_line.length >= 2) {
      const latlngs = corridor.cross_border_line.map(([lon, lat]) => [lat, lon] as [number, number]);
      const borderLine = L.polyline(latlngs, {
        color: '#ec4899',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.95
      }).bindTooltip(
        `<div class="p-1 font-mono text-xs"><b>Virtual Monitoring Fence</b><br/>Trans-Boundary Sensor Gate</div>`,
        { sticky: true }
      );
      group.addLayer(borderLine);
    }

    // 2. Draw Forward Plumes for Active Snapshot
    if (activeSnapshot && activeSnapshot.plume_geojson) {
      L.geoJSON(activeSnapshot.plume_geojson, {
        style: (feature) => {
          const aqi = feature?.properties?.estimated_aqi || 250;
          const scaledAqi = aqi * (1.0 - (1.0 - curtailmentRatio) * 0.7);
          const color = scaledAqi > 350 ? '#7c2d12' : scaledAqi > 250 ? '#ef4444' : '#f59e0b';
          return {
            fillColor: color,
            fillOpacity: 0.42,
            color: color,
            weight: 1.5,
            opacity: 0.75
          };
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            layer.bindPopup(`
              <div class="p-2 font-sans text-xs bg-slate-900 text-slate-100 rounded">
                <div class="font-bold text-sm text-cyan-400 mb-1">${feature.properties.source_name}</div>
                <div class="text-[11px] text-slate-300 font-mono">Category: ${feature.properties.category}</div>
                <div class="text-[11px] font-mono mt-1">
                  Predicted Plume AQI: <b class="text-rose-400">${feature.properties.estimated_aqi}</b>
                </div>
                <div class="text-[10px] text-slate-400 mt-1">Forecast Offset: +${feature.properties.hour_offset}h</div>
              </div>
            `);
          }
        }
      }).addTo(group);
    }
  }, [corridor, activeSnapshot, curtailmentRatio]);

  // Render AeroTrace Attribution Overlays (Back-Trajectory & Culprits)
  useEffect(() => {
    const group = attributionGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (attributionData) {
      const { observation, reverse_trajectory, ranked_culprits } = attributionData;

      // 1. Observation Pin
      const obsIcon = L.divIcon({
        className: 'custom-obs-marker',
        html: `<div class="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-lg shadow-cyan-500/80 animate-ping absolute"></div>
               <div class="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-white relative">📍</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([observation.lat, observation.lon], { icon: obsIcon })
        .bindTooltip(
          `<div class="p-1 font-mono text-xs"><b>Citizen / Monitor Observation Point</b><br/>Detected: ${attributionData.visual_inspection.smoke_type} (${attributionData.visual_inspection.visual_opacity_pct}% Opacity)</div>`,
          { permanent: true, direction: 'top', offset: [0, -12] }
        )
        .addTo(group);

      // 2. Upwind Search Cone Polygon
      if (reverse_trajectory.upwind_cone_polygon) {
        const coneLatLngs = reverse_trajectory.upwind_cone_polygon.map(([lon, lat]) => [lat, lon] as [number, number]);
        L.polygon(coneLatLngs, {
          color: '#f59e0b',
          weight: 2,
          fillColor: '#f59e0b',
          fillOpacity: 0.18,
          dashArray: '6, 6'
        }).bindTooltip('<div class="font-mono text-xs text-amber-300">Upwind Atmospheric Dispersion Cone (±18°)</div>', { sticky: true }).addTo(group);
      }

      // 3. Back-Trajectory Curvilinear Flight Path
      if (reverse_trajectory.trajectory_path) {
        const pathLatLngs = reverse_trajectory.trajectory_path.map(([lon, lat]) => [lat, lon] as [number, number]);
        L.polyline(pathLatLngs, {
          color: '#38bdf8',
          weight: 4,
          opacity: 0.95
        }).addTo(group);
      }

      // 4. Culprit Factory Markers
      ranked_culprits.forEach((culprit) => {
        const [flon, flat] = culprit.coordinates;
        const isPrimary = culprit.rank === 1;

        const culpritIcon = L.divIcon({
          className: 'culprit-marker',
          html: `<div class="px-2 py-1 rounded-md text-[10px] font-bold font-mono shadow-xl border flex items-center space-x-1 ${
            isPrimary
              ? 'bg-rose-600 text-white border-white animate-bounce'
              : 'bg-space-800 text-amber-300 border-amber-500/50'
          }">
            <span>${isPrimary ? '🚨 CULPRIT #' + culprit.rank : '#' + culprit.rank}</span>
            <span>${culprit.match_score_pct}%</span>
          </div>`,
          iconSize: [80, 24],
          iconAnchor: [40, 12]
        });

        L.marker([flat, flon], { icon: culpritIcon })
          .bindPopup(`
            <div class="p-2 font-sans text-xs bg-slate-900 text-slate-100 rounded">
              <div class="font-bold text-sm text-rose-400 mb-1">${culprit.name}</div>
              <div class="text-[11px] font-mono text-cyan-300">Category: ${culprit.category}</div>
              <div class="text-[11px] font-mono mt-1">
                Distance Travelled: <b class="text-white">${culprit.distance_km} km</b>
              </div>
              <div class="text-[11px] font-mono">
                Atmospheric Transit Time: <b class="text-white">${culprit.transit_time_hrs} hours</b>
              </div>
              <div class="text-[10px] text-slate-300 mt-2 p-1.5 bg-slate-800 rounded">
                <b>Gemini Reasoning:</b> ${culprit.reasoning}
              </div>
            </div>
          `)
          .addTo(group);
      });
    }
  }, [attributionData]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-space-950">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* 60 FPS Wind Particle Canvas Streamlines */}
      <WindCanvas
        windSpeedKmh={corridor.wind_profile.speed_kmh}
        windDirectionDeg={corridor.wind_profile.direction_deg}
        opacity={0.65}
      />
    </div>
  );
};
