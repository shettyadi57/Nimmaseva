import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Office } from '../../types';
import { MapPin, Navigation, Clock, Phone, Layers } from 'lucide-react';

// Custom Leaflet Markers
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
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  offices: Office[];
  userLocation: { lat: number; lng: number } | null;
  onSelectOffice?: (office: Office) => void;
}

const MapViewAdjuster: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

export const OfficeMap: React.FC<MapProps> = ({ offices, userLocation, onSelectOffice }) => {
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [13.9299, 75.5681]; // Shivamogga city coordinates

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewAdjuster center={defaultCenter} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-xs font-semibold p-1">
                <span className="text-red-600 font-bold">📍 Your Current Location</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Office Markers */}
        {offices.map((office) => {
          const icon = office.type === 'GramOne' ? gramOneIcon : sevaSindhuIcon;
          return (
            <Marker
              key={office.id}
              position={[office.latitude, office.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 min-w-[200px] text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] text-white ${office.type === 'GramOne' ? 'bg-emerald-700' : 'bg-amber-600'}`}>
                      {office.type}
                    </span>
                    <span className="font-bold text-slate-900">{office.name}</span>
                  </div>

                  <p className="text-slate-600 mb-2 leading-tight">{office.address}</p>

                  {office.distance_km !== undefined && (
                    <div className="flex items-center gap-3 text-slate-700 font-medium my-1.5 bg-slate-50 p-1.5 rounded">
                      <span>Distance: <b>{office.distance_km} km</b></span>
                      <span>ETA: <b>{office.est_travel_time_mins} mins</b></span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-600 my-1">
                    <span>Current Queue: <b>{office.current_queue_count || 0}</b></span>
                    <span className={`font-semibold ${office.server_status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {office.server_status}
                    </span>
                  </div>

                  {onSelectOffice && (
                    <button
                      onClick={() => onSelectOffice(office)}
                      className="w-full mt-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded text-xs transition-colors"
                    >
                      Book Token at this Center
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
