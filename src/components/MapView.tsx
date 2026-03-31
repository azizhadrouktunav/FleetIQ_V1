import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Vehicle } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapLegend } from './MapLegend';
// Custom marker component to handle map centering
function MapController({
  selectedVehicle,
  mapCenter,
  onMapCenterChange




}: {selectedVehicle: Vehicle | null;mapCenter: [number, number] | null;onMapCenterChange: () => void;}) {
  const map = useMap();
  useEffect(() => {
    if (mapCenter) {
      map.flyTo(mapCenter, 15, {
        animate: true,
        duration: 1.5
      });
      // Clear the mapCenter after flying to it
      onMapCenterChange();
    } else if (selectedVehicle) {
      map.flyTo(selectedVehicle.coordinates, 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedVehicle, mapCenter, map, onMapCenterChange]);
  return null;
}
interface MapViewProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  mapCenter?: [number, number] | null;
  onMapCenterChange?: () => void;
}
export function MapView({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  mapCenter = null,
  onMapCenterChange = () => {}
}: MapViewProps) {
  // Create custom icons based on status
  const createCustomIcon = (status: string, isSelected: boolean) => {
    const color =
    status === 'active' ?
    '#10b981' // emerald-500
    : status === 'idle' ?
    '#f59e0b' // amber-500
    : '#f43f5e'; // rose-500
    const size = isSelected ? 40 : 32;
    // Using a truck icon SVG inside the marker
    const truckSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white">
        <path d="M10 17h4V5H2v12h3"></path>
        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"></path>
        <path d="M14 17h1"></path>
        <circle cx="7.5" cy="17.5" r="2.5"></circle>
        <circle cx="17.5" cy="17.5" r="2.5"></circle>
      </svg>
    `;
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        ">
          ${truckSvg}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  };
  const selectedVehicle =
  vehicles.find((v) => v.id === selectedVehicleId) || null;
  return (
    <div className="w-full h-full relative z-0 bg-slate-100">
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={13}
        style={{
          height: '100%',
          width: '100%',
          background: '#f1f5f9'
        }}
        zoomControl={false}>
        
        {/* Light mode map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        

        <MapController
          selectedVehicle={selectedVehicle}
          mapCenter={mapCenter}
          onMapCenterChange={onMapCenterChange} />
        

        {vehicles.map((vehicle) =>
        <Marker
          key={vehicle.id}
          position={vehicle.coordinates}
          icon={createCustomIcon(
            vehicle.status,
            selectedVehicleId === vehicle.id
          )}
          eventHandlers={{
            click: () => onSelectVehicle(vehicle)
          }}>
          
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-slate-800">{vehicle.name}</h3>
                <p className="text-xs text-slate-500">{vehicle.location}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                  className={`px-2 py-0.5 rounded-full text-[10px] text-white font-medium
                    ${vehicle.status === 'active' ? 'bg-emerald-500' : vehicle.status === 'idle' ? 'bg-amber-500' : 'bg-rose-500'}
                  `}>
                  
                    {vehicle.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-slate-600">
                    {vehicle.speed} km/h
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-6 left-4 z-10">
        <MapLegend />
      </div>

      {/* Bottom Right Info Badges */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-medium text-slate-600">
          Zoom: 12x
        </div>
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-medium text-slate-600">
          Véhicules: {vehicles.length}
        </div>
      </div>
    </div>);

}