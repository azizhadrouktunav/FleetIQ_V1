import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type {
  BasemapType,
  DrawMode,
  GeofenceDraft,
  GeofenceOverlay,
  LatLng,
  LocationOverlay,
  MapOverlay,
  PolygonOverlay,
  RouteOverlay,
} from '../types/map-overlays';
import { createId } from '../types/map-overlays';

const MIN_GEOFENCE_RADIUS_KM = 0.05;

export interface MapControlsState {
  basemap: BasemapType;
  setBasemap: (b: BasemapType) => void;
  clusterVehicles: boolean;
  setClusterVehicles: (v: boolean) => void;
  clusterLocations: boolean;
  setClusterLocations: (v: boolean) => void;
  drawMode: DrawMode;
  setDrawMode: (m: DrawMode) => void;
  pendingPoints: LatLng[];
  setPendingPoints: (p: LatLng[]) => void;
  geofenceDraft: GeofenceDraft | null;
  setGeofenceDraft: Dispatch<SetStateAction<GeofenceDraft | null>>;
  geofenceModalOpen: boolean;
  setGeofenceModalOpen: (o: boolean) => void;
  nameModal: { kind: 'location' | 'route' | 'polygon'; points: LatLng[] } | null;
  setNameModal: (
    m: { kind: 'location' | 'route' | 'polygon'; points: LatLng[] } | null
  ) => void;
  manageDialog: 'location' | 'route' | 'polygon' | 'geofence' | null;
  setManageDialog: (m: 'location' | 'route' | 'polygon' | 'geofence' | null) => void;
  geofences: GeofenceOverlay[];
  locations: LocationOverlay[];
  routes: RouteOverlay[];
  polygons: PolygonOverlay[];
  allOverlays: MapOverlay[];
  addGeofence: (draft: GeofenceDraft) => void;
  addLocation: (name: string, position: LatLng) => void;
  addRoute: (name: string, points: LatLng[]) => void;
  addPolygon: (name: string, points: LatLng[]) => void;
  removeOverlays: (ids: string[]) => void;
  removeAllOverlays: () => void;
  setOverlayVisible: (id: string, visible: boolean) => void;
  flyToTarget: LatLng | null;
  setFlyToTarget: (t: LatLng | null) => void;
  startDraw: (mode: Exclude<DrawMode, null>) => void;
  cancelDrawing: () => void;
  finishMultiPointDraw: () => void;
  handleMapClick: (latlng: LatLng) => void;
  beginGeofenceAt: (center: LatLng, radiusKm?: number) => void;
  finishGeofencePlace: () => void;
}

const defaultGeofenceDraft = (
  center: LatLng,
  vehicleId = '',
  radiusKm = MIN_GEOFENCE_RADIUS_KM
): GeofenceDraft => ({
  vehicleId,
  name: '',
  shapeType: 'circulaire',
  alertType: 'hors_zone',
  radiusKm,
  center,
});

export function useMapOverlays(): MapControlsState {
  const [basemap, setBasemap] = useState<BasemapType>('osm');
  const [clusterVehicles, setClusterVehicles] = useState(true);
  const [clusterLocations, setClusterLocations] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [pendingPoints, setPendingPoints] = useState<LatLng[]>([]);
  const [geofenceDraft, setGeofenceDraft] = useState<GeofenceDraft | null>(null);
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);
  const [nameModal, setNameModal] = useState<{
    kind: 'location' | 'route' | 'polygon';
    points: LatLng[];
  } | null>(null);
  const [manageDialog, setManageDialog] = useState<
    'location' | 'route' | 'polygon' | 'geofence' | null
  >(null);
  const [geofences, setGeofences] = useState<GeofenceOverlay[]>([]);
  const [locations, setLocations] = useState<LocationOverlay[]>([]);
  const [routes, setRoutes] = useState<RouteOverlay[]>([]);
  const [polygons, setPolygons] = useState<PolygonOverlay[]>([]);
  const [flyToTarget, setFlyToTarget] = useState<LatLng | null>(null);

  const allOverlays = useMemo<MapOverlay[]>(
    () => [...geofences, ...locations, ...routes, ...polygons],
    [geofences, locations, routes, polygons]
  );

  const cancelDrawing = useCallback(() => {
    setDrawMode(null);
    setPendingPoints([]);
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
  }, []);

  const startDraw = useCallback((mode: Exclude<DrawMode, null>) => {
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
    setPendingPoints([]);
    setDrawMode(mode);
  }, []);

  const addGeofence = useCallback((draft: GeofenceDraft) => {
    setGeofences((prev) => [
      ...prev,
      {
        id: createId('gf'),
        kind: 'geofence',
        name: draft.name || 'Géopérage',
        vehicleId: draft.vehicleId,
        shapeType: draft.shapeType,
        alertType: draft.alertType,
        radiusKm: draft.radiusKm,
        center: draft.center,
        visible: true,
      },
    ]);
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
    setDrawMode(null);
    setPendingPoints([]);
  }, []);

  const addLocation = useCallback((name: string, position: LatLng) => {
    setLocations((prev) => [
      ...prev,
      {
        id: createId('loc'),
        kind: 'location',
        name: name || 'Emplacement',
        position,
        visible: true,
      },
    ]);
    setNameModal(null);
    setDrawMode(null);
    setPendingPoints([]);
  }, []);

  const addRoute = useCallback((name: string, points: LatLng[]) => {
    setRoutes((prev) => [
      ...prev,
      {
        id: createId('route'),
        kind: 'route',
        name: name || 'Itinéraire',
        points,
        visible: true,
      },
    ]);
    setNameModal(null);
    setDrawMode(null);
    setPendingPoints([]);
  }, []);

  const addPolygon = useCallback((name: string, points: LatLng[]) => {
    setPolygons((prev) => [
      ...prev,
      {
        id: createId('poly'),
        kind: 'polygon',
        name: name || 'Polygone',
        points,
        visible: true,
      },
    ]);
    setNameModal(null);
    setDrawMode(null);
    setPendingPoints([]);
  }, []);

  const removeOverlays = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setGeofences((p) => p.filter((o) => !idSet.has(o.id)));
    setLocations((p) => p.filter((o) => !idSet.has(o.id)));
    setRoutes((p) => p.filter((o) => !idSet.has(o.id)));
    setPolygons((p) => p.filter((o) => !idSet.has(o.id)));
  }, []);

  const removeAllOverlays = useCallback(() => {
    setGeofences([]);
    setLocations([]);
    setRoutes([]);
    setPolygons([]);
  }, []);

  const setOverlayVisible = useCallback((id: string, visible: boolean) => {
    setGeofences((p) => p.map((o) => (o.id === id ? { ...o, visible } : o)));
    setLocations((p) => p.map((o) => (o.id === id ? { ...o, visible } : o)));
    setRoutes((p) => p.map((o) => (o.id === id ? { ...o, visible } : o)));
    setPolygons((p) => p.map((o) => (o.id === id ? { ...o, visible } : o)));
  }, []);

  const finishMultiPointDraw = useCallback(() => {
    if (drawMode === 'route' && pendingPoints.length >= 2) {
      setNameModal({ kind: 'route', points: [...pendingPoints] });
      setPendingPoints([]);
      setDrawMode(null);
    } else if (drawMode === 'polygon' && pendingPoints.length >= 3) {
      setNameModal({ kind: 'polygon', points: [...pendingPoints] });
      setPendingPoints([]);
      setDrawMode(null);
    }
  }, [drawMode, pendingPoints]);

  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      if (!drawMode) return;

      // Geofence uses click-drag placement (beginGeofenceAt / finishGeofencePlace)
      if (drawMode === 'geofence') return;

      if (drawMode === 'location') {
        setNameModal({ kind: 'location', points: [latlng] });
        setDrawMode(null);
        return;
      }

      if (drawMode === 'route' || drawMode === 'polygon') {
        setPendingPoints((prev) => [...prev, latlng]);
      }
    },
    [drawMode]
  );

  const beginGeofenceAt = useCallback((center: LatLng, radiusKm = MIN_GEOFENCE_RADIUS_KM) => {
    setGeofenceDraft((prev) =>
      prev
        ? { ...prev, radiusKm }
        : defaultGeofenceDraft(center, '', radiusKm)
    );
    setGeofenceModalOpen(false);
  }, []);

  const finishGeofencePlace = useCallback(() => {
    setGeofenceModalOpen(true);
  }, []);

  return {
    basemap,
    setBasemap,
    clusterVehicles,
    setClusterVehicles,
    clusterLocations,
    setClusterLocations,
    drawMode,
    setDrawMode,
    pendingPoints,
    setPendingPoints,
    geofenceDraft,
    setGeofenceDraft,
    geofenceModalOpen,
    setGeofenceModalOpen,
    nameModal,
    setNameModal,
    manageDialog,
    setManageDialog,
    geofences,
    locations,
    routes,
    polygons,
    allOverlays,
    addGeofence,
    addLocation,
    addRoute,
    addPolygon,
    removeOverlays,
    removeAllOverlays,
    setOverlayVisible,
    flyToTarget,
    setFlyToTarget,
    startDraw,
    cancelDrawing,
    finishMultiPointDraw,
    handleMapClick,
    beginGeofenceAt,
    finishGeofencePlace,
  };
}
