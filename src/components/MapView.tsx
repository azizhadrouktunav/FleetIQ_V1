import { Fragment, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Rectangle,
  Polygon,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { Vehicle } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapLegend } from './MapLegend';
import type {
  BasemapType,
  DrawMode,
  GeofenceDraft,
  GeofenceOverlay,
  GeofenceShapeType,
  LatLng,
  LocationOverlay,
  PolygonOverlay,
  RouteOverlay,
} from '../types/map-overlays';
import {
  BASEMAP_TILES,
  rectangleBoundsFromCenter,
} from '../types/map-overlays';
import { fetchDrivingRoute } from '../lib/osrm-routing';

const MIN_RADIUS_KM = 0.05;
const MAX_RADIUS_KM = 50;

const ROUTE_LINE = { color: '#2563eb', weight: 5, opacity: 1 };
const ROUTE_CASING = { color: '#ffffff', weight: 8, opacity: 0.9 };
const ROUTE_DRAFT = {
  color: '#3b82f6',
  weight: 4,
  dashArray: '8 6',
  opacity: 0.85,
};

function clampRadiusKm(km: number): number {
  const clamped = Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, km));
  return Math.round(clamped * 100) / 100;
}

function resizeHandlePosition(
  center: LatLng,
  radiusKm: number,
  shapeType: GeofenceShapeType
): LatLng {
  const [lat, lng] = center;
  if (shapeType === 'circulaire') {
    const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    return [lat, lng + dLng];
  }
  const bounds = rectangleBoundsFromCenter(center, radiusKm);
  return [bounds[1][0], bounds[1][1]];
}

function radiusKmFromPointer(
  map: L.Map,
  center: LatLng,
  pointer: L.LatLng,
  shapeType: GeofenceShapeType
): number {
  if (shapeType === 'circulaire') {
    return clampRadiusKm(map.distance(L.latLng(center), pointer) / 1000);
  }
  const [lat, lng] = center;
  const dLatKm = Math.abs(pointer.lat - lat) * 111;
  const dLngKm =
    Math.abs(pointer.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180);
  return clampRadiusKm(Math.max(dLatKm, dLngKm));
}

function MapController({
  selectedVehicle,
  mapCenter,
  onMapCenterChange,
  flyToTarget,
  onFlyToDone,
}: {
  selectedVehicle: Vehicle | null;
  mapCenter: [number, number] | null;
  onMapCenterChange: () => void;
  flyToTarget: LatLng | null;
  onFlyToDone: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (flyToTarget) {
      map.flyTo(flyToTarget, 15, { animate: true, duration: 1.2 });
      onFlyToDone();
      return;
    }
    if (mapCenter) {
      map.flyTo(mapCenter, 15, { animate: true, duration: 1.5 });
      onMapCenterChange();
    } else if (selectedVehicle) {
      map.flyTo(selectedVehicle.coordinates, 15, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [
    selectedVehicle,
    mapCenter,
    map,
    onMapCenterChange,
    flyToTarget,
    onFlyToDone,
  ]);
  return null;
}

function MapClickHandler({
  enabled,
  onMapClick,
  skipClickRef,
}: {
  enabled: boolean;
  onMapClick: (latlng: LatLng) => void;
  skipClickRef: MutableRefObject<boolean>;
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      if (skipClickRef.current) {
        skipClickRef.current = false;
        return;
      }
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function PendingRoutePreview({ waypoints }: { waypoints: LatLng[] }) {
  const [geometry, setGeometry] = useState<LatLng[]>(waypoints);

  useEffect(() => {
    if (waypoints.length < 2) {
      setGeometry(waypoints);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetchDrivingRoute(waypoints).then((route) => {
        if (!cancelled) setGeometry(route);
      });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [waypoints]);

  if (geometry.length < 2) return null;

  return (
    <Polyline positions={geometry} pathOptions={ROUTE_DRAFT} />
  );
}

function DrawCursor({
  drawMode,
  isResizing,
  isMoving,
}: {
  drawMode: DrawMode;
  isResizing: boolean;
  isMoving: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (isResizing || isMoving) {
      container.style.cursor = 'grabbing';
    } else {
      container.style.cursor = drawMode ? 'crosshair' : '';
    }
    return () => {
      container.style.cursor = '';
    };
  }, [map, drawMode, isResizing, isMoving]);
  return null;
}

function GeofencePlaceHandler({
  enabled,
  shapeType,
  onPlaceStart,
  onPlaceProgress,
  onPlaceEnd,
  skipClickRef,
  onResizingChange,
}: {
  enabled: boolean;
  shapeType: GeofenceShapeType;
  onPlaceStart: (center: LatLng, radiusKm: number) => void;
  onPlaceProgress: (center: LatLng, radiusKm: number) => void;
  onPlaceEnd: () => void;
  skipClickRef: MutableRefObject<boolean>;
  onResizingChange: (v: boolean) => void;
}) {
  const map = useMap();
  const placingRef = useRef(false);
  const centerRef = useRef<LatLng | null>(null);

  const stopPlace = () => {
    if (!placingRef.current) return;
    placingRef.current = false;
    centerRef.current = null;
    onResizingChange(false);
    skipClickRef.current = true;
    map.dragging.enable();
    onPlaceEnd();
  };

  useMapEvents({
    mousedown(e) {
      if (!enabled || placingRef.current) return;
      if ((e.originalEvent as MouseEvent).button !== 0) return;
      L.DomEvent.preventDefault(e.originalEvent);
      L.DomEvent.stopPropagation(e.originalEvent);
      const center: LatLng = [e.latlng.lat, e.latlng.lng];
      placingRef.current = true;
      centerRef.current = center;
      onResizingChange(true);
      map.dragging.disable();
      onPlaceStart(center, MIN_RADIUS_KM);
    },
    mousemove(e) {
      if (!placingRef.current || !centerRef.current) return;
      onPlaceProgress(
        centerRef.current,
        radiusKmFromPointer(map, centerRef.current, e.latlng, shapeType)
      );
    },
    mouseup: stopPlace,
  });

  useEffect(() => {
    window.addEventListener('mouseup', stopPlace);
    return () => window.removeEventListener('mouseup', stopPlace);
  });

  return null;
}

function GeofenceDraftEditor({
  draft,
  onCenterChange,
  onRadiusChange,
  skipClickRef,
  onResizingChange,
  onMovingChange,
}: {
  draft: GeofenceDraft;
  onCenterChange: (center: LatLng) => void;
  onRadiusChange: (km: number) => void;
  skipClickRef: MutableRefObject<boolean>;
  onResizingChange: (v: boolean) => void;
  onMovingChange: (v: boolean) => void;
}) {
  const map = useMap();
  const [liveCenter, setLiveCenter] = useState<LatLng>(draft.center);
  const [liveRadiusKm, setLiveRadiusKm] = useState(draft.radiusKm);
  const modeRef = useRef<'idle' | 'move' | 'resize'>('idle');
  const centerRef = useRef<LatLng>(draft.center);

  useEffect(() => {
    if (modeRef.current !== 'idle') return;
    setLiveCenter(draft.center);
    setLiveRadiusKm(draft.radiusKm);
  }, [draft.center, draft.radiusKm, draft.shapeType]);

  useEffect(() => {
    centerRef.current = liveCenter;
  }, [liveCenter]);

  const stopInteraction = () => {
    if (modeRef.current === 'idle') return;
    modeRef.current = 'idle';
    onMovingChange(false);
    onResizingChange(false);
    skipClickRef.current = true;
    map.dragging.enable();
  };

  const startMove = (e: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(e.originalEvent);
    L.DomEvent.preventDefault(e.originalEvent);
    modeRef.current = 'move';
    onMovingChange(true);
    onResizingChange(false);
    map.dragging.disable();
  };

  const startResize = (e: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(e.originalEvent);
    L.DomEvent.preventDefault(e.originalEvent);
    modeRef.current = 'resize';
    onResizingChange(true);
    onMovingChange(false);
    map.dragging.disable();
    const km = radiusKmFromPointer(
      map,
      centerRef.current,
      e.latlng,
      draft.shapeType
    );
    setLiveRadiusKm(km);
    onRadiusChange(km);
  };

  useMapEvents({
    mousemove(e) {
      if (modeRef.current === 'move') {
        const next: LatLng = [e.latlng.lat, e.latlng.lng];
        centerRef.current = next;
        setLiveCenter(next);
        onCenterChange(next);
        return;
      }
      if (modeRef.current === 'resize') {
        const km = radiusKmFromPointer(
          map,
          centerRef.current,
          e.latlng,
          draft.shapeType
        );
        setLiveRadiusKm(km);
        onRadiusChange(km);
      }
    },
    mouseup: stopInteraction,
  });

  useEffect(() => {
    window.addEventListener('mouseup', stopInteraction);
    return () => window.removeEventListener('mouseup', stopInteraction);
  });

  const handlePos = resizeHandlePosition(
    liveCenter,
    liveRadiusKm,
    draft.shapeType
  );

  return (
    <>
      <GeofenceShape
        center={liveCenter}
        radiusKm={liveRadiusKm}
        shapeType={draft.shapeType}
        preview
        interactive
        onMouseDown={startResize}
      />
      <Marker
        position={liveCenter}
        draggable={false}
        zIndexOffset={600}
        icon={L.divIcon({
          className: 'gf-draft-center',
          html: `<div style="
            width:14px;height:14px;background:#3b82f6;border:2px solid white;
            border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4);
            cursor:grab;
          " title="Glisser pour déplacer"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })}
        eventHandlers={{
          mousedown: startMove,
        }}
      />
      <Marker
        position={handlePos}
        draggable={false}
        zIndexOffset={500}
        icon={L.divIcon({
          className: 'gf-resize-handle',
          html: `<div style="
            width:16px;height:16px;border-radius:50%;
            background:#3b82f6;border:3px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,.35);
            cursor:nesw-resize;
          " title="Glisser pour ajuster le rayon"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })}
        eventHandlers={{
          mousedown: startResize,
        }}
      />
    </>
  );
}

function createVehicleIcon(status: string, isSelected: boolean) {
  const color =
    status === 'active'
      ? '#10b981'
      : status === 'idle'
        ? '#f59e0b'
        : '#f43f5e';
  const size = isSelected ? 40 : 32;
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
    popupAnchor: [0, -size / 2],
  });
}

function createLocationIcon() {
  return L.divIcon({
    className: 'location-marker',
    html: `<div style="
      width:24px;height:24px;border-radius:50% 50% 50% 0;
      background:#3b82f6;border:2px solid white;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

function clusterIconSize(count: number): number {
  if (count < 10) return 36;
  if (count < 50) return 42;
  return 48;
}

function createVehicleClusterIcon(count: number) {
  const size = clusterIconSize(count);
  return L.divIcon({
    className: 'vehicle-cluster-icon',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:#10b981;border:3px solid white;
      box-shadow:0 3px 10px rgba(0,0,0,.35);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      color:white;font-weight:700;font-size:${size < 42 ? 11 : 13}px;line-height:1.1;
      font-family:system-ui,sans-serif;
    ">
      <span style="font-size:9px;opacity:.9;letter-spacing:.02em">V</span>
      <span>${count}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createLocationClusterIcon(count: number) {
  const size = clusterIconSize(count);
  return L.divIcon({
    className: 'location-cluster-icon',
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:30% 30% 30% 0;
      transform:rotate(-45deg);
      background:#2563eb;border:3px solid white;
      box-shadow:0 3px 10px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="
        transform:rotate(45deg);
        color:white;font-weight:700;font-size:${size < 42 ? 11 : 13}px;line-height:1.1;
        text-align:center;font-family:system-ui,sans-serif;
      ">
        <div style="font-size:9px;opacity:.9">E</div>
        <div>${count}</div>
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function GeofenceShape({
  center,
  radiusKm,
  shapeType,
  preview,
  interactive = true,
  onMouseDown,
}: {
  center: LatLng;
  radiusKm: number;
  shapeType: 'circulaire' | 'rectangulaire';
  preview?: boolean;
  interactive?: boolean;
  onMouseDown?: (e: L.LeafletMouseEvent) => void;
}) {
  const pathOpts = {
    color: preview ? '#3b82f6' : '#6366f1',
    fillColor: preview ? '#3b82f6' : '#6366f1',
    fillOpacity: preview ? 0.15 : 0.2,
    weight: 2,
    dashArray: preview ? '6 4' : undefined,
    interactive,
  };
  const eventHandlers = onMouseDown
    ? {
        mousedown: onMouseDown,
        mouseover: (e: L.LeafletMouseEvent) => {
          const el = (e.target as L.Path).getElement();
          if (el) (el as SVGElement).style.cursor = 'nesw-resize';
        },
      }
    : undefined;
  if (shapeType === 'circulaire') {
    return (
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={pathOpts}
        eventHandlers={eventHandlers}
      />
    );
  }
  const bounds = rectangleBoundsFromCenter(center, radiusKm);
  return (
    <Rectangle
      bounds={bounds}
      pathOptions={pathOpts}
      eventHandlers={eventHandlers}
    />
  );
}

interface MapViewProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  mapCenter?: [number, number] | null;
  onMapCenterChange?: () => void;
  basemap?: BasemapType;
  drawMode?: DrawMode;
  onMapClick?: (latlng: LatLng) => void;
  geofences?: GeofenceOverlay[];
  locations?: LocationOverlay[];
  routes?: RouteOverlay[];
  polygons?: PolygonOverlay[];
  geofenceDraft?: GeofenceDraft | null;
  onGeofenceRadiusChange?: (km: number) => void;
  onGeofenceCenterChange?: (center: LatLng) => void;
  onGeofencePlaceStart?: (center: LatLng, radiusKm?: number) => void;
  onGeofencePlaceProgress?: (center: LatLng, radiusKm: number) => void;
  onGeofencePlaceEnd?: () => void;
  pendingPoints?: LatLng[];
  clusterVehicles?: boolean;
  clusterLocations?: boolean;
  flyToTarget?: LatLng | null;
  onFlyToDone?: () => void;
}

export function MapView({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  mapCenter = null,
  onMapCenterChange = () => {},
  basemap = 'osm',
  drawMode = null,
  onMapClick = () => {},
  geofences = [],
  locations = [],
  routes = [],
  polygons = [],
  geofenceDraft = null,
  onGeofenceRadiusChange = () => {},
  onGeofenceCenterChange = () => {},
  onGeofencePlaceStart = () => {},
  onGeofencePlaceProgress = () => {},
  onGeofencePlaceEnd = () => {},
  pendingPoints = [],
  clusterVehicles = true,
  clusterLocations = false,
  flyToTarget = null,
  onFlyToDone = () => {},
}: MapViewProps) {
  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || null;
  const tile = BASEMAP_TILES[basemap];
  const visibleLocations = locations.filter((l) => l.visible);
  const skipClickRef = useRef(false);
  const [isResizingGeofence, setIsResizingGeofence] = useState(false);
  const [isMovingGeofence, setIsMovingGeofence] = useState(false);
  const isGeofenceInteracting = isResizingGeofence || isMovingGeofence;

  return (
    <div className="w-full h-full relative z-0 bg-slate-100">
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={13}
        style={{ height: '100%', width: '100%', background: '#f1f5f9' }}
        zoomControl={false}
      >
        <TileLayer
          key={basemap}
          attribution={tile.attribution}
          url={tile.url}
        />

        <MapController
          selectedVehicle={selectedVehicle}
          mapCenter={mapCenter}
          onMapCenterChange={onMapCenterChange}
          flyToTarget={flyToTarget}
          onFlyToDone={onFlyToDone}
        />
        <MapClickHandler
          enabled={
            !!drawMode &&
            drawMode !== 'geofence' &&
            !isGeofenceInteracting
          }
          onMapClick={onMapClick}
          skipClickRef={skipClickRef}
        />
        <GeofencePlaceHandler
          enabled={drawMode === 'geofence' && !geofenceDraft}
          shapeType={geofenceDraft?.shapeType ?? 'circulaire'}
          onPlaceStart={onGeofencePlaceStart}
          onPlaceProgress={onGeofencePlaceProgress}
          onPlaceEnd={onGeofencePlaceEnd}
          skipClickRef={skipClickRef}
          onResizingChange={setIsResizingGeofence}
        />
        <DrawCursor
          drawMode={drawMode}
          isResizing={isResizingGeofence}
          isMoving={isMovingGeofence}
        />

        {clusterVehicles && !drawMode ? (
          <VehicleClusterLayer
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={onSelectVehicle}
            drawMode={drawMode}
          />
        ) : (
          vehicles.map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={vehicle.coordinates}
              interactive={!drawMode}
              icon={createVehicleIcon(
                vehicle.status,
                selectedVehicleId === vehicle.id
              )}
              eventHandlers={{
                click: () => {
                  if (drawMode) return;
                  onSelectVehicle(vehicle);
                },
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-slate-800">{vehicle.name}</h3>
                  <p className="text-xs text-slate-500">{vehicle.location}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] text-white font-medium
                    ${
                      vehicle.status === 'active'
                        ? 'bg-emerald-500'
                        : vehicle.status === 'idle'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }
                  `}
                    >
                      {vehicle.status.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-slate-600">
                      {vehicle.speed} km/h
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        )}

        {clusterLocations && !drawMode ? (
          <LocationClusterLayer locations={visibleLocations} />
        ) : (
          visibleLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.position}
              interactive={!drawMode}
              icon={createLocationIcon()}
            >
              <Popup>
                <div className="text-sm font-medium">{loc.name}</div>
              </Popup>
            </Marker>
          ))
        )}

        {/* Geofences */}
        {geofences
          .filter((g) => g.visible)
          .map((g) => (
            <GeofenceShape
              key={g.id}
              center={g.center}
              radiusKm={g.radiusKm}
              shapeType={g.shapeType}
              interactive={!drawMode}
            />
          ))}

        {/* Draft geofence preview */}
        {geofenceDraft && (
          <GeofenceDraftEditor
            draft={geofenceDraft}
            onCenterChange={onGeofenceCenterChange}
            onRadiusChange={onGeofenceRadiusChange}
            skipClickRef={skipClickRef}
            onResizingChange={setIsResizingGeofence}
            onMovingChange={setIsMovingGeofence}
          />
        )}

        {/* Routes */}
        {routes
          .filter((r) => r.visible)
          .map((r) => (
            <Fragment key={r.id}>
              <Polyline
                positions={r.points}
                pathOptions={{ ...ROUTE_CASING, interactive: false }}
              />
              <Polyline
                positions={r.points}
                pathOptions={{ ...ROUTE_LINE, interactive: !drawMode }}
              >
                <Popup>{r.name}</Popup>
              </Polyline>
            </Fragment>
          ))}

        {/* Polygons */}
        {polygons
          .filter((p) => p.visible)
          .map((p) => (
            <Polygon
              key={p.id}
              positions={p.points}
              pathOptions={{
                interactive: !drawMode,
              }}
            >
              <Popup>{p.name}</Popup>
            </Polygon>
          ))}

        {/* Pending draw points */}
        {pendingPoints.map((pt, i) => {
          const pendingColor =
            drawMode === 'route' ? ROUTE_DRAFT.color : '#f59e0b';
          return (
            <Marker
              key={`pending-${i}`}
              position={pt}
              icon={L.divIcon({
                className: 'pending-pt',
                html: `<div style="width:10px;height:10px;background:${pendingColor};border:2px solid white;border-radius:50%"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5],
              })}
              interactive={false}
            />
          );
        })}
        {pendingPoints.length >= 2 && drawMode === 'route' && (
          <PendingRoutePreview waypoints={pendingPoints} />
        )}
        {pendingPoints.length >= 2 && drawMode === 'polygon' && (
          <Polygon
            positions={pendingPoints}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '6 4',
            }}
          />
        )}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 items-start">
        <MapLegend />
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-medium text-slate-600">
          Véhicules: {vehicles.length}
        </div>
      </div>
    </div>
  );
}

function VehicleClusterLayer({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  drawMode,
}: {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (v: Vehicle) => void;
  drawMode: DrawMode;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane('vehicleClusters')) {
      map.createPane('vehicleClusters');
      map.getPane('vehicleClusters')!.style.zIndex = '450';
    }

    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      clusterPane: 'vehicleClusters',
      iconCreateFunction: (cluster) =>
        createVehicleClusterIcon(cluster.getChildCount()),
    });

    vehicles.forEach((vehicle) => {
      const marker = L.marker(vehicle.coordinates, {
        icon: createVehicleIcon(
          vehicle.status,
          selectedVehicleId === vehicle.id
        ),
        pane: 'vehicleClusters',
      });
      marker.bindPopup(`
        <div class="p-1">
          <h3 class="font-bold text-slate-800">${vehicle.name}</h3>
          <p class="text-xs text-slate-500">${vehicle.location}</p>
          <div class="mt-2 text-xs">${vehicle.speed} km/h</div>
        </div>
      `);
      marker.on('click', () => {
        if (!drawMode) onSelectVehicle(vehicle);
      });
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map, vehicles, selectedVehicleId, onSelectVehicle, drawMode]);

  return null;
}

function LocationClusterLayer({
  locations,
}: {
  locations: LocationOverlay[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane('locationClusters')) {
      map.createPane('locationClusters');
      map.getPane('locationClusters')!.style.zIndex = '460';
    }

    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      clusterPane: 'locationClusters',
      iconCreateFunction: (cluster) =>
        createLocationClusterIcon(cluster.getChildCount()),
    });

    locations.forEach((loc) => {
      const marker = L.marker(loc.position, {
        icon: createLocationIcon(),
        pane: 'locationClusters',
      });
      marker.bindPopup(`<div class="text-sm font-medium">${loc.name}</div>`);
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map, locations]);

  return null;
}
