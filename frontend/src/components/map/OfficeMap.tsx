import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Office } from '../../types';
import { MapPin, Navigation, Clock, Phone, Layers, ExternalLink, Compass } from 'lucide-react';

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const gramOneIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const sevaSindhuIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  offices: Office[];
  userLocation: { lat: number; lng: number } | null;
  selectedRouteOffice?: Office | null;
  onSelectOffice?: (office: Office) => void;
  onShowRoute?: (office: Office) => void;
}

const MapViewAdjuster: React.FC<{ 
  userLoc: { lat: number; lng: number } | null; 
  routeOffice?: Office | null;
}> = ({ userLoc, routeOffice }) => {
  const map = useMap();

  useEffect(() => {
    if (routeOffice && userLoc) {
      const bounds = L.latLngBounds(
        [userLoc.lat, userLoc.lng],
        [routeOffice.latitude, routeOffice.longitude]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (userLoc) {
      map.setView([userLoc.lat, userLoc.lng], 13);
    }
  }, [userLoc, routeOffice, map]);

  return null;
};

export const OfficeMap: React.FC<MapProps> = ({ 
  offices, 
  userLocation, 
  selectedRouteOffice, 
  onSelectOffice,
  onShowRoute
}) => {
  const [travelMode, setTravelMode] = React.useState<'driving' | 'two-wheeler' | 'walking'>('driving');

  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [13.9299, 75.5681];

  const getGoogleMapsUrl = (office: Office, mode: string = travelMode) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const dest = `${office.latitude},${office.longitude}`;
    const gMode = mode === 'two-wheeler' ? 'two-wheeler' : mode === 'walking' ? 'walking' : 'driving';
    return origin 
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${gMode}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=${gMode}`;
  };

  const getEstTime = (office: Office) => {
    const baseMins = office.est_travel_time_mins || 10;
    if (travelMode === 'two-wheeler') return Math.max(4, Math.round(baseMins * 0.8));
    if (travelMode === 'walking') return Math.round((office.distance_km || 2.4) * 12);
    return baseMins;
  };

  return (
    <div className="relative w-full h-[560px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 glass-panel group">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewAdjuster userLoc={userLocation} routeOffice={selectedRouteOffice} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-xs font-semibold p-1">
                <span className="text-red-600 font-bold">📍 Your Detected Location</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Active Route Lines on Map (Glowing Emerald dual stroke) */}
        {userLocation && selectedRouteOffice && (
          <>
            <Polyline
              positions={[
                [userLocation.lat, userLocation.lng],
                [selectedRouteOffice.latitude, selectedRouteOffice.longitude]
              ]}
              pathOptions={{
                color: '#059669',
                weight: 9,
                opacity: 0.5,
              }}
            />
            <Polyline
              positions={[
                [userLocation.lat, userLocation.lng],
                [selectedRouteOffice.latitude, selectedRouteOffice.longitude]
              ]}
              pathOptions={{
                color: '#10b981',
                weight: 4,
                opacity: 1.0,
                dashArray: '8, 8'
              }}
            />
          </>
        )}

        {offices.map((office) => {
          const icon = office.type === 'GramOne' ? gramOneIcon : sevaSindhuIcon;
          const isSelected = selectedRouteOffice?.id === office.id;

          return (
            <Marker
              key={office.id}
              position={[office.latitude, office.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 min-w-[240px] text-xs font-sans space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] text-slate-950 ${office.type === 'GramOne' ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                      {office.type}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm leading-tight">{office.name}</span>
                  </div>

                  <p className="text-slate-600 leading-snug">{office.address}</p>

                  {office.distance_km !== undefined && (
                    <div className="flex items-center justify-between text-slate-700 font-medium bg-slate-100 p-2 rounded-xl border border-slate-200">
                      <span>Distance: <b className="text-emerald-700">{office.distance_km} km</b></span>
                      <span>ETA: <b className="text-amber-700">{office.est_travel_time_mins} mins</b></span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>Waiting: <b className="text-slate-900">{office.current_queue_count || 0} citizens</b></span>
                    <span className={`font-bold px-2 py-0.5 rounded ${office.server_status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {office.server_status}
                    </span>
                  </div>

                  <div className="pt-1 space-y-1.5">
                    <button
                      onClick={() => onShowRoute ? onShowRoute(office) : window.open(getGoogleMapsUrl(office), '_blank')}
                      className={`w-full py-2 font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isSelected ? 'Viewing Active Route ✓' : '🗺️ Show Best Route'}</span>
                    </button>

                    {onSelectOffice && (
                      <button
                        onClick={() => onSelectOffice(office)}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Book Token Pass</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Luxury Floating In-Map Live Navigation HUD Overlay */}
      {selectedRouteOffice && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4 animate-fadeIn text-white">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
                  Live Route HUD
                </span>
              </div>
              <h4 className="font-extrabold text-base text-white leading-snug">{selectedRouteOffice.name}</h4>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate">{selectedRouteOffice.address}</span>
              </p>
            </div>

            <button
              onClick={() => onShowRoute && onShowRoute(null as any)}
              className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0"
              title="Clear Active Route"
            >
              ✕
            </button>
          </div>

          {/* Travel Mode Pills Switcher */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setTravelMode('driving')}
              className={`py-1.5 px-2 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                travelMode === 'driving'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs">🚗 Car</span>
              <span className={`text-[10px] font-mono ${travelMode === 'driving' ? 'text-slate-950 font-bold' : 'text-emerald-400'}`}>
                ~{selectedRouteOffice.est_travel_time_mins || 10}m
              </span>
            </button>

            <button
              onClick={() => setTravelMode('two-wheeler')}
              className={`py-1.5 px-2 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                travelMode === 'two-wheeler'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs">🛵 Bike</span>
              <span className={`text-[10px] font-mono ${travelMode === 'two-wheeler' ? 'text-slate-950 font-bold' : 'text-emerald-400'}`}>
                ~{Math.max(4, Math.round((selectedRouteOffice.est_travel_time_mins || 10) * 0.8))}m
              </span>
            </button>

            <button
              onClick={() => setTravelMode('walking')}
              className={`py-1.5 px-2 rounded-xl text-center transition-all flex flex-col items-center gap-0.5 ${
                travelMode === 'walking'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs">🚶 Walk</span>
              <span className={`text-[10px] font-mono ${travelMode === 'walking' ? 'text-slate-950 font-bold' : 'text-amber-400'}`}>
                ~{Math.round((selectedRouteOffice.distance_km || 2.4) * 12)}m
              </span>
            </button>
          </div>

          {/* Intel Metrics Strip */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Distance &amp; ETA</span>
              <span className="font-extrabold text-amber-300">{selectedRouteOffice.distance_km || 2.4} km • ~{getEstTime(selectedRouteOffice)} mins</span>
            </div>
            <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Queue Count</span>
              <span className="font-extrabold text-emerald-400">{selectedRouteOffice.current_queue_count || 0} waiting</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <a
              href={getGoogleMapsUrl(selectedRouteOffice, travelMode)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all active:scale-95"
            >
              <Navigation className="w-4 h-4 fill-slate-950" />
              <span>🚀 Launch Turn-by-Turn in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {onSelectOffice && (
              <button
                onClick={() => onSelectOffice(selectedRouteOffice)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <span>Book Token Pass at this Center</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
