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
    <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 glass-panel group">
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

        {/* Active Route Line */}
        {userLocation && selectedRouteOffice && (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lng],
              [selectedRouteOffice.latitude, selectedRouteOffice.longitude]
            ]}
            pathOptions={{
              color: '#3b82f6',
              weight: 5,
              opacity: 0.8,
              dashArray: '8, 8'
            }}
          />
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
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5 text-white" />
                      <span>{isSelected ? 'Viewing Active Route' : '🗺️ Show Best Route (Google Maps)'}</span>
                    </button>

                    {onSelectOffice && (
                      <button
                        onClick={() => onSelectOffice(office)}
                        className="w-full py-1.5 bg-slate-900 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Book Token at this Center</span>
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
    </div>
  );
};
