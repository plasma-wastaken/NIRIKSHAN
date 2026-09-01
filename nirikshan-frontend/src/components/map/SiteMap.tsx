import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapSite, SiteRisk } from '../../data/mockMapSites';

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create colored SVG circle icons per risk level
const createIcon = (risk: SiteRisk, isSelected = false): L.DivIcon => {
  const colors: Record<SiteRisk, string> = {
    CRITICAL: '#dc2626',   // red-600
    HIGH: '#ea580c',       // orange-600
    MEDIUM: '#ca8a04',     // yellow-600
    LOW: '#16a34a',        // green-600
    UNASSESSED: '#6b7280', // gray-500
  };
  const color = colors[risk] ?? '#6b7280';
  const size = isSelected ? 22 : 18;
  const ring = isSelected ? `stroke="${color}" stroke-width="3" stroke-opacity="0.4"` : '';

  return L.divIcon({
    className: '',
    html: `<svg width="${size + 12}" height="${size + 12}" viewBox="0 0 ${size + 12} ${size + 12}" xmlns="http://www.w3.org/2000/svg">
      ${isSelected ? `<circle cx="${(size + 12) / 2}" cy="${(size + 12) / 2}" r="${(size + 12) / 2 - 1}" fill="${color}" fill-opacity="0.15" ${ring}/>` : ''}
      <circle cx="${(size + 12) / 2}" cy="${(size + 12) / 2}" r="${size / 2}" fill="${color}" stroke="white" stroke-width="2" filter="drop-shadow(0 1px 3px rgba(0,0,0,0.4))"/>
    </svg>`,
    iconSize: [size + 12, size + 12],
    iconAnchor: [(size + 12) / 2, (size + 12) / 2],
    popupAnchor: [0, -(size / 2 + 6)],
  });
};

const riskLabel: Record<SiteRisk, string> = {
  CRITICAL: 'Critical Risk',
  HIGH: 'High Risk',
  MEDIUM: 'Medium Risk',
  LOW: 'Low Risk',
  UNASSESSED: 'Unassessed',
};

const riskColor: Record<SiteRisk, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200',
  UNASSESSED: 'bg-gray-100 text-gray-700 border-gray-200',
};

interface SiteMapProps {
  sites: MapSite[];
  height?: string;
  selectedSiteId?: string;
  onSiteClick?: (site: MapSite) => void;
  showLegend?: boolean;
  className?: string;
}

const Legend: React.FC = () => (
  <div className="absolute bottom-6 left-3 z-[1000] bg-white rounded-lg shadow-lg border border-surface-200 p-3 text-xs">
    <p className="font-bold text-surface-700 mb-2 uppercase tracking-wider">Risk Level</p>
    {(Object.entries(riskLabel) as [SiteRisk, string][]).map(([risk, label]) => (
      <div key={risk} className="flex items-center gap-2 mb-1">
        <span className={`inline-flex items-center justify-center w-3 h-3 rounded-full ${
          risk === 'CRITICAL' ? 'bg-red-600' :
          risk === 'HIGH' ? 'bg-orange-600' :
          risk === 'MEDIUM' ? 'bg-yellow-500' :
          risk === 'LOW' ? 'bg-green-600' : 'bg-gray-400'
        }`} />
        <span className="text-surface-600">{label}</span>
      </div>
    ))}
  </div>
);

export const SiteMap: React.FC<SiteMapProps> = ({
  sites,
  height = '400px',
  selectedSiteId,
  onSiteClick,
  showLegend = true,
  className = '',
}) => {
  // Center of Delhi NCR
  const center: [number, number] = [28.6139, 77.2090];

  return (
    <div style={{ height }} className={`relative rounded-xl overflow-hidden border border-surface-200 shadow-sm ${className}`}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />

        {sites.map((site) => (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={createIcon(site.risk_level, selectedSiteId === site.id)}
            eventHandlers={{ click: () => onSiteClick?.(site) }}
          >
            <Popup maxWidth={260} className="leaflet-popup-nirikshan">
              <div className="min-w-[200px] font-sans">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-sm text-gray-900 leading-tight">{site.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{site.site_id} · {site.inspection_id}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${riskColor[site.risk_level]}`}>
                    {riskLabel[site.risk_level]}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-600 border-t border-gray-100 pt-2">
                  <p><span className="font-semibold text-gray-700">Address:</span> {site.address}</p>
                  <p><span className="font-semibold text-gray-700">Category:</span> {site.category}</p>
                  <p><span className="font-semibold text-gray-700">Inspector:</span> {site.inspector}</p>
                  <p><span className="font-semibold text-gray-700">Status:</span>{' '}
                    <span className="font-bold">{site.status.replace('_', ' ')}</span>
                  </p>
                  <p><span className="font-semibold text-gray-700">Last Inspected:</span> {site.last_inspected}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showLegend && <Legend />}
    </div>
  );
};
