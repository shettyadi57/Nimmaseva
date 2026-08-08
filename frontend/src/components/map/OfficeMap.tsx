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
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [13.9299, 75.5681];

  const getGoogleMapsUrl = (office: Office) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const dest = `${office.latitude},${office.longitude}`;
    return origin 
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 glass-panel group">
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
                weight: 8,
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

      {/* Floating In-Map Route Information Card Overlay */}
      {selectedRouteOffice && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl max-w-xs w-full space-y-3 animate-fadeIn text-white">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Active Map Route
              </span>
              <h4 className="font-extrabold text-sm text-white mt-1 leading-snug">{selectedRouteOffice.name}</h4>
            </div>
            <button
              onClick={() => onShowRoute && onShowRoute(null as any)}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors shrink-0"
              title="Clear Route"
            >
              ✕
            </button>
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono">
            <span>Distance: <strong className="text-amber-400">{selectedRouteOffice.distance_km || 2.4} km</strong></span>
            <span>ETA: <strong className="text-emerald-400">~{selectedRouteOffice.est_travel_time_mins || 10} mins</strong></span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={getGoogleMapsUrl(selectedRouteOffice)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {onSelectOffice && (
              <button
                onClick={() => onSelectOffice(selectedRouteOffice)}
                className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-xl transition-all"
              >
                Book Pass
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
