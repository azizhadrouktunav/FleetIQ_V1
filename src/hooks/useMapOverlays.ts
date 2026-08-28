import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type {
  AssignmentScope,
  BasemapType,
  DefaultZoneOverlay,
  DrawMode,
  GeofenceAlertType,
  GeofenceDraft,
  GeofenceOverlay,
  LatLng,
  LocationFormState,
  LocationOverlay,
  ManageOverlayKind,
  MapOverlay,
  OverlayFormDraft,
  PolygonOverlay,
  RouteOverlay,
} from '../types/map-overlays';
import {
  createId,
  emptyAssignment,
  getGeofenceFitPoints,
} from '../types/map-overlays';
import { fetchDrivingRoute } from '../lib/osrm-routing';
import {
  createTunisiaDefaultZones,
  getTunisiaProvince,
} from '../data/tunisia-provinces';
import {
  closingWouldSelfIntersect,
  wouldSelfIntersect,
} from '../lib/polygon-geometry';

const MIN_GEOFENCE_RADIUS_KM = 0.05;

export type GeometryEditKind = 'polygon' | 'route';

export type EditTarget =
  | { kind: 'geofence'; id: string }
  | { kind: 'location'; id: string }
  | { kind: 'route'; id: string }
  | { kind: 'polygon'; id: string }
  | { kind: 'defaultZone'; id: string }
  | null;

export type OverlayPanelMode = 'view' | 'edit';

export type ZoneSelectTarget = Extract<
  NonNullable<EditTarget>,
  { kind: 'geofence' | 'polygon' | 'defaultZone' }
>;

export type BulkAssignKind = 'geofence' | 'polygon' | 'defaultZone';

export type RouteCreateMode = 'locations' | 'map' | null;

/** Prefer stored waypoints; otherwise sample sparse pins from a dense OSRM path. */
function routeEditWaypoints(route: RouteOverlay): LatLng[] {
  if (route.waypoints && route.waypoints.length >= 2) {
    return [...route.waypoints];
  }
  const pts = route.points;
  if (pts.length <= 4) return [...pts];
  return [
    pts[0],
    pts[Math.floor(pts.length / 3)],
    pts[Math.floor((2 * pts.length) / 3)],
    pts[pts.length - 1],
  ];
}

function polygonCentroid(points: LatLng[]): LatLng {
  if (!points.length) return [36.8, 10.18];
  const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [lat, lng];
}

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
  setPendingPoints: Dispatch<SetStateAction<LatLng[]>>;
  polygonDrawError: string | null;
  clearPolygonDrawError: () => void;
  undoPendingPoint: () => void;
  geofenceDraft: GeofenceDraft | null;
  setGeofenceDraft: Dispatch<SetStateAction<GeofenceDraft | null>>;
  geofenceModalOpen: boolean;
  setGeofenceModalOpen: (o: boolean) => void;
  locationForm: LocationFormState | null;
  setLocationForm: Dispatch<SetStateAction<LocationFormState | null>>;
  locationFormOpen: boolean;
  overlayForm: OverlayFormDraft | null;
  setOverlayForm: Dispatch<SetStateAction<OverlayFormDraft | null>>;
  overlayFormKind: 'polygon' | 'route' | null;
  editTarget: EditTarget;
  setEditTarget: (t: EditTarget) => void;
  geometryEditKind: GeometryEditKind | null;
  editingOverlayId: string | null;
  /** Effective map interaction mode: create drawMode or geometry edit */
  activeGeometryMode: GeometryEditKind | null;
  manageDialog: ManageOverlayKind | null;
  setManageDialog: (m: ManageOverlayKind | null) => void;
  routeCreateOpen: boolean;
  routeCreateMode: RouteCreateMode;
  openRouteCreate: (initialMode?: RouteCreateMode) => void;
  closeRouteCreate: () => void;
  setRouteCreateMode: (mode: RouteCreateMode) => void;
  routePreview: {
    geometry: LatLng[];
    distanceMeters?: number;
    durationSeconds?: number;
  } | null;
  setRoutePreview: (
    p: {
      geometry: LatLng[];
      distanceMeters?: number;
      durationSeconds?: number;
    } | null
  ) => void;
  geofences: GeofenceOverlay[];
  locations: LocationOverlay[];
  routes: RouteOverlay[];
  polygons: PolygonOverlay[];
  defaultZones: DefaultZoneOverlay[];
  allOverlays: MapOverlay[];
  highlightedZoneId: string | null;
  setHighlightedZoneId: (id: string | null) => void;
  addGeofence: (draft: GeofenceDraft) => void;
  updateGeofence: (id: string, draft: GeofenceDraft) => void;
  addLocation: (form: LocationFormState) => void;
  updateLocation: (id: string, form: LocationFormState) => void;
  addRouteFromDraft: (draft: OverlayFormDraft) => void;
  updateRoute: (id: string, draft: OverlayFormDraft) => void;
  addPolygonFromDraft: (draft: OverlayFormDraft) => void;
  updatePolygon: (id: string, draft: OverlayFormDraft) => void;
  updateDefaultZone: (
    id: string,
    patch: { assignment: AssignmentScope; alertType: GeofenceAlertType }
  ) => void;
  removeOverlays: (ids: string[]) => void;
  removeAllOverlays: () => void;
  setOverlayVisible: (id: string, visible: boolean) => void;
  flyToTarget: LatLng | null;
  flyToZoom: number | null;
  setFlyToTarget: (t: LatLng | null, zoom?: number) => void;
  fitBoundsPoints: LatLng[] | null;
  setFitBoundsPoints: (points: LatLng[] | null) => void;
  startDraw: (mode: Exclude<DrawMode, null>) => void;
  cancelDrawing: () => void;
  finishMultiPointDraw: () => void | Promise<void>;
  handleMapClick: (latlng: LatLng, mapZoom?: number) => void;
  beginGeofenceAt: (center: LatLng, radiusKm?: number) => void;
  finishGeofencePlace: () => void;
  overlayPanelMode: OverlayPanelMode;
  openOverlayView: (target: ZoneSelectTarget) => void;
  startOverlayEdit: () => void;
  openEdit: (target: NonNullable<EditTarget>) => void;
  closeEditForms: () => void;
  bulkAssignOpen: boolean;
  bulkAssignIds: string[];
  bulkAssignKind: BulkAssignKind | null;
  manageSelectedIds: string[];
  toggleManageSelect: (id: string) => void;
  selectAllManage: (ids: string[]) => void;
  clearManageSelection: () => void;
  openBulkAssign: (ids: string[], kind: BulkAssignKind) => void;
  closeBulkAssign: () => void;
  applyBulkAssignment: (
    assignment: AssignmentScope,
    alertType: GeofenceAlertType
  ) => void;
  tryAddPolygonPoint: (latlng: LatLng) => boolean;
  /** Persist polygon/route edit including pending map geometry */
  saveGeometryEdit: () => Promise<boolean>;
}

const defaultGeofenceDraft = (
  center: LatLng,
  radiusKm = MIN_GEOFENCE_RADIUS_KM
): GeofenceDraft => ({
  assignment: emptyAssignment(),
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
  const [polygonDrawError, setPolygonDrawError] = useState<string | null>(null);
  const [geofenceDraft, setGeofenceDraft] = useState<GeofenceDraft | null>(null);
  const [geofenceModalOpen, setGeofenceModalOpen] = useState(false);
  const [locationForm, setLocationForm] = useState<LocationFormState | null>(
    null
  );
  const [locationFormOpen, setLocationFormOpen] = useState(false);
  const [overlayForm, setOverlayForm] = useState<OverlayFormDraft | null>(null);
  const [overlayFormKind, setOverlayFormKind] = useState<
    'polygon' | 'route' | null
  >(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [geometryEditKind, setGeometryEditKind] =
    useState<GeometryEditKind | null>(null);
  const [manageDialog, setManageDialog] = useState<ManageOverlayKind | null>(
    null
  );
  const [routeCreateOpen, setRouteCreateOpen] = useState(false);
  const [routeCreateMode, setRouteCreateModeState] =
    useState<RouteCreateMode>(null);
  const [routePreview, setRoutePreview] = useState<{
    geometry: LatLng[];
    distanceMeters?: number;
    durationSeconds?: number;
  } | null>(null);
  const [geofences, setGeofences] = useState<GeofenceOverlay[]>([]);
  const [locations, setLocations] = useState<LocationOverlay[]>([]);
  const [routes, setRoutes] = useState<RouteOverlay[]>([]);
  const [polygons, setPolygons] = useState<PolygonOverlay[]>([]);
  const [defaultZones, setDefaultZones] = useState<DefaultZoneOverlay[]>(() =>
    createTunisiaDefaultZones()
  );
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(
    null
  );
  const [flyToTarget, setFlyToTargetState] = useState<LatLng | null>(null);
  const [flyToZoom, setFlyToZoom] = useState<number | null>(null);
  const [fitBoundsPoints, setFitBoundsPoints] = useState<LatLng[] | null>(
    null
  );
  const [overlayPanelMode, setOverlayPanelMode] =
    useState<OverlayPanelMode>('view');
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkAssignIds, setBulkAssignIds] = useState<string[]>([]);
  const [bulkAssignKind, setBulkAssignKind] = useState<BulkAssignKind | null>(
    null
  );
  const [manageSelectedIds, setManageSelectedIds] = useState<string[]>([]);

  const setFlyToTarget = useCallback((t: LatLng | null, zoom?: number) => {
    setFlyToTargetState(t);
    setFlyToZoom(t ? (zoom ?? 15) : null);
  }, []);

  const allOverlays = useMemo<MapOverlay[]>(
    () => [
      ...geofences,
      ...locations,
      ...routes,
      ...polygons,
      ...defaultZones,
    ],
    [geofences, locations, routes, polygons, defaultZones]
  );

  const editingOverlayId =
    overlayPanelMode === 'edit' &&
    editTarget &&
    (editTarget.kind === 'polygon' ||
      editTarget.kind === 'route' ||
      editTarget.kind === 'geofence' ||
      editTarget.kind === 'location')
      ? editTarget.id
      : null;

  const activeGeometryMode: GeometryEditKind | null =
    drawMode === 'polygon' || drawMode === 'route'
      ? drawMode
      : geometryEditKind;

  const clearPolygonDrawError = useCallback(() => {
    setPolygonDrawError(null);
  }, []);

  const closeEditForms = useCallback(() => {
    setEditTarget(null);
    setGeometryEditKind(null);
    setOverlayForm(null);
    setOverlayFormKind(null);
    setLocationForm(null);
    setLocationFormOpen(false);
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
    setPendingPoints([]);
    setPolygonDrawError(null);
    setRoutePreview(null);
    setOverlayPanelMode('view');
    setHighlightedZoneId(null);
  }, []);

  const cancelDrawing = useCallback(() => {
    setDrawMode(null);
    setPendingPoints([]);
    setPolygonDrawError(null);
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
    setLocationForm(null);
    setLocationFormOpen(false);
    setOverlayForm(null);
    setOverlayFormKind(null);
    setRoutePreview(null);
    setGeometryEditKind(null);
    setEditTarget(null);
    setOverlayPanelMode('view');
  }, []);

  const closeRouteCreate = useCallback(() => {
    setRouteCreateOpen(false);
    setRouteCreateModeState(null);
    setDrawMode(null);
    setPendingPoints([]);
    setRoutePreview(null);
    setPolygonDrawError(null);
  }, []);

  const openRouteCreate = useCallback((initialMode?: RouteCreateMode) => {
    setEditTarget(null);
    setGeometryEditKind(null);
    setOverlayForm(null);
    setOverlayFormKind(null);
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
    setLocationForm(null);
    setLocationFormOpen(false);
    setPolygonDrawError(null);
    setRoutePreview(null);
    setRouteCreateOpen(true);
    setRouteCreateModeState(initialMode ?? null);
    if (initialMode === 'map') {
      setPendingPoints([]);
      setDrawMode('route');
    } else {
      setDrawMode(null);
      setPendingPoints([]);
    }
  }, []);

  const setRouteCreateMode = useCallback((mode: RouteCreateMode) => {
    setRouteCreateModeState(mode);
    setPolygonDrawError(null);
    setRoutePreview(null);
    if (mode === 'map') {
      setPendingPoints([]);
      setDrawMode('route');
    } else {
      setDrawMode(null);
      setPendingPoints([]);
    }
  }, []);

  const startDraw = useCallback(
    (mode: Exclude<DrawMode, null>) => {
      closeEditForms();
      closeRouteCreate();
      setRoutePreview(null);
      setPendingPoints([]);
      setPolygonDrawError(null);
      setGeometryEditKind(null);
      setDrawMode(mode);
    },
    [closeEditForms, closeRouteCreate]
  );

  const undoPendingPoint = useCallback(() => {
    setPendingPoints((prev) => prev.slice(0, -1));
    setPolygonDrawError(null);
  }, []);

  const tryAddPolygonPoint = useCallback(
    (latlng: LatLng): boolean => {
      let ok = true;
      setPendingPoints((prev) => {
        if (wouldSelfIntersect(prev, latlng)) {
          ok = false;
          return prev;
        }
        return [...prev, latlng];
      });
      if (!ok) {
        setPolygonDrawError(
          'Point invalide : le segment croiserait le polygone.'
        );
      } else {
        setPolygonDrawError(null);
      }
      return ok;
    },
    []
  );

  const addGeofence = useCallback((draft: GeofenceDraft) => {
    const vehicleId =
      draft.assignment.mode === 'vehicle'
        ? draft.assignment.ids[0] ?? ''
        : '';
    setGeofences((prev) => [
      ...prev,
      {
        id: createId('gf'),
        kind: 'geofence',
        name: draft.name || 'Géopérage',
        vehicleId,
        assignment: draft.assignment,
        shapeType: draft.shapeType,
        alertType: draft.alertType,
        radiusKm: draft.radiusKm,
        center: draft.center,
        provinceId: draft.provinceId,
        visible: true,
      },
    ]);
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
    setDrawMode(null);
    setPendingPoints([]);
    setEditTarget(null);
  }, []);

  const updateGeofence = useCallback((id: string, draft: GeofenceDraft) => {
    const vehicleId =
      draft.assignment.mode === 'vehicle'
        ? draft.assignment.ids[0] ?? ''
        : '';
    setGeofences((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              name: draft.name || o.name,
              vehicleId,
              assignment: draft.assignment,
              shapeType: draft.shapeType,
              alertType: draft.alertType,
              radiusKm: draft.radiusKm,
              center: draft.center,
              provinceId: draft.provinceId,
            }
          : o
      )
    );
    setGeofenceDraft(null);
    setGeofenceModalOpen(false);
    setEditTarget(null);
    setGeometryEditKind(null);
  }, []);

  const addLocation = useCallback((form: LocationFormState) => {
    setLocations((prev) => [
      ...prev,
      {
        id: createId('loc'),
        kind: 'location',
        name: form.name || 'Emplacement',
        position: form.position,
        visible: true,
      },
    ]);
    setLocationForm(null);
    setLocationFormOpen(false);
    setDrawMode(null);
    setPendingPoints([]);
    setEditTarget(null);
  }, []);

  const updateLocation = useCallback((id: string, form: LocationFormState) => {
    setLocations((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              name: form.name || o.name,
              position: form.position,
              assignment: undefined,
              alertType: undefined,
            }
          : o
      )
    );
    setLocationForm(null);
    setLocationFormOpen(false);
    setEditTarget(null);
    setGeometryEditKind(null);
  }, []);

  const addRouteFromDraft = useCallback((draft: OverlayFormDraft) => {
    setRoutes((prev) => [
      ...prev,
      {
        id: createId('route'),
        kind: 'route',
        name: draft.name || 'Itinéraire',
        points: draft.points,
        waypoints: draft.waypoints,
        waypointLocationIds: draft.waypointLocationIds,
        distanceMeters: draft.distanceMeters,
        durationSeconds: draft.durationSeconds,
        assignment: draft.assignment,
        alertType: draft.alertType,
        visible: true,
      },
    ]);
    setOverlayForm(null);
    setOverlayFormKind(null);
    setDrawMode(null);
    setPendingPoints([]);
    setRoutePreview(null);
    setRouteCreateOpen(false);
    setRouteCreateModeState(null);
    setEditTarget(null);
    setGeometryEditKind(null);
  }, []);

  const updateRoute = useCallback((id: string, draft: OverlayFormDraft) => {
    setRoutes((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              name: draft.name || o.name,
              assignment: draft.assignment,
              alertType: draft.alertType,
              ...(draft.points.length
                ? {
                    points: draft.points,
                    waypoints: draft.waypoints,
                    waypointLocationIds: draft.waypointLocationIds,
                    distanceMeters: draft.distanceMeters,
                    durationSeconds: draft.durationSeconds,
                  }
                : {}),
            }
          : o
      )
    );
    setOverlayForm(null);
    setOverlayFormKind(null);
    setEditTarget(null);
    setGeometryEditKind(null);
    setPendingPoints([]);
    setRoutePreview(null);
  }, []);

  const addPolygonFromDraft = useCallback((draft: OverlayFormDraft) => {
    setPolygons((prev) => [
      ...prev,
      {
        id: createId('poly'),
        kind: 'polygon',
        name: draft.name || 'Polygone',
        points: draft.points,
        assignment: draft.assignment,
        alertType: draft.alertType,
        visible: true,
      },
    ]);
    setOverlayForm(null);
    setOverlayFormKind(null);
    setDrawMode(null);
    setPendingPoints([]);
    setEditTarget(null);
    setGeometryEditKind(null);
  }, []);

  const updatePolygon = useCallback((id: string, draft: OverlayFormDraft) => {
    setPolygons((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              name: draft.name || o.name,
              assignment: draft.assignment,
              alertType: draft.alertType,
              ...(draft.points.length ? { points: draft.points } : {}),
            }
          : o
      )
    );
    setOverlayForm(null);
    setOverlayFormKind(null);
    setEditTarget(null);
    setGeometryEditKind(null);
    setPendingPoints([]);
    setPolygonDrawError(null);
  }, []);

  const updateDefaultZone = useCallback(
    (
      id: string,
      patch: { assignment: AssignmentScope; alertType: GeofenceAlertType }
    ) => {
      setDefaultZones((prev) =>
        prev.map((z) =>
          z.id === id
            ? {
                ...z,
                assignment: patch.assignment,
                alertType: patch.alertType,
                visible: true,
              }
            : z
        )
      );
      setOverlayForm(null);
      setOverlayFormKind(null);
      setEditTarget(null);
      setGeometryEditKind(null);
    },
    []
  );

  const removeOverlays = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setGeofences((p) => p.filter((o) => !idSet.has(o.id)));
    setLocations((p) => p.filter((o) => !idSet.has(o.id)));
    setRoutes((p) => p.filter((o) => !idSet.has(o.id)));
    setPolygons((p) => p.filter((o) => !idSet.has(o.id)));
    // default zones are readonly — never delete
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
    setDefaultZones((p) =>
      p.map((o) => (o.id === id ? { ...o, visible } : o))
    );
  }, []);

  const finishMultiPointDraw = useCallback(async () => {
    if (drawMode === 'route' && pendingPoints.length >= 2) {
      const waypoints = [...pendingPoints];
      const result = await fetchDrivingRoute(waypoints);
      setOverlayForm({
        name: '',
        assignment: emptyAssignment(),
        alertType: 'les_deux',
        points: result.geometry,
        waypoints,
        distanceMeters: result.distanceMeters,
        durationSeconds: result.durationSeconds,
      });
      setOverlayFormKind('route');
      setPendingPoints([]);
      setDrawMode(null);
      setRoutePreview(null);
      setRouteCreateOpen(false);
      setRouteCreateModeState(null);
      setOverlayPanelMode('edit');
      setEditTarget(null);
    } else if (drawMode === 'polygon' && pendingPoints.length >= 3) {
      if (closingWouldSelfIntersect(pendingPoints)) {
        setPolygonDrawError(
          'Polygone invalide : la fermeture croise des segments.'
        );
        return;
      }
      setOverlayForm({
        name: '',
        assignment: emptyAssignment(),
        alertType: 'les_deux',
        points: [...pendingPoints],
      });
      setOverlayFormKind('polygon');
      setPendingPoints([]);
      setDrawMode(null);
      setPolygonDrawError(null);
      setOverlayPanelMode('edit');
      setEditTarget(null);
    }
  }, [drawMode, pendingPoints]);

  const handleMapClick = useCallback(
    (latlng: LatLng, _mapZoom?: number) => {
      // Reposition location while form is open
      if (locationFormOpen && locationForm) {
        setLocationForm({ ...locationForm, position: latlng });
        return;
      }

      // Geometry edit from Manage → Modifier
      if (geometryEditKind === 'route') {
        setPendingPoints((prev) => [...prev, latlng]);
        return;
      }
      if (geometryEditKind === 'polygon') {
        tryAddPolygonPoint(latlng);
        return;
      }

      if (!drawMode) return;

      if (drawMode === 'geofence') return;

      if (drawMode === 'location') {
        setLocationForm({
          name: '',
          position: latlng,
        });
        setLocationFormOpen(true);
        setDrawMode(null);
        return;
      }

      if (drawMode === 'route') {
        setPendingPoints((prev) => [...prev, latlng]);
        return;
      }

      if (drawMode === 'polygon') {
        tryAddPolygonPoint(latlng);
      }
    },
    [
      drawMode,
      geometryEditKind,
      locationForm,
      locationFormOpen,
      tryAddPolygonPoint,
    ]
  );

  const beginGeofenceAt = useCallback(
    (center: LatLng, radiusKm = MIN_GEOFENCE_RADIUS_KM) => {
      setGeofenceDraft((prev) =>
        prev
          ? { ...prev, center, radiusKm }
          : defaultGeofenceDraft(center, radiusKm)
      );
      setGeofenceModalOpen(false);
    },
    []
  );

  const finishGeofencePlace = useCallback(() => {
    setOverlayPanelMode('edit');
    setGeofenceModalOpen(true);
  }, []);

  const loadOverlayPanel = useCallback(
    (target: NonNullable<EditTarget>, mode: OverlayPanelMode) => {
      setDrawMode(null);
      setPendingPoints([]);
      setPolygonDrawError(null);
      setRouteCreateOpen(false);
      setRouteCreateModeState(null);
      setRoutePreview(null);
      setGeometryEditKind(null);
      setOverlayPanelMode(mode);
      setEditTarget(target);
      setHighlightedZoneId(null);

      if (target.kind === 'geofence') {
        const g = geofences.find((x) => x.id === target.id);
        if (!g) return;
        setGeofenceDraft({
          assignment: g.assignment ?? {
            mode: 'vehicle',
            ids: g.vehicleId ? [g.vehicleId] : [],
          },
          name: g.name,
          shapeType: g.shapeType,
          alertType: g.alertType,
          radiusKm: g.radiusKm,
          center: g.center,
          provinceId: g.provinceId,
        });
        setGeofenceModalOpen(true);
        setFitBoundsPoints(
          getGeofenceFitPoints(g, {
            provincePoints: g.provinceId
              ? getTunisiaProvince(g.provinceId)?.points
              : undefined,
          })
        );
        return;
      }

      if (target.kind === 'location') {
        const loc = locations.find((x) => x.id === target.id);
        if (!loc) return;
        setLocationForm({
          name: loc.name,
          position: loc.position,
        });
        setLocationFormOpen(true);
        setFlyToTarget(loc.position, 15);
        return;
      }

      if (target.kind === 'polygon') {
        const p = polygons.find((x) => x.id === target.id);
        if (!p) return;
        setOverlayForm({
          name: p.name,
          assignment: p.assignment ?? emptyAssignment(),
          alertType: p.alertType ?? 'les_deux',
          points: p.points,
        });
        setOverlayFormKind('polygon');
        if (mode === 'edit') {
          setGeometryEditKind('polygon');
          setPendingPoints([...p.points]);
        } else {
          setFitBoundsPoints(p.points);
        }
        return;
      }

      if (target.kind === 'route') {
        const r = routes.find((x) => x.id === target.id);
        if (!r) return;
        const waypoints = routeEditWaypoints(r);
        setOverlayForm({
          name: r.name,
          assignment: r.assignment ?? emptyAssignment(),
          alertType: r.alertType ?? 'les_deux',
          points: r.points,
          waypoints,
          waypointLocationIds: r.waypointLocationIds,
          distanceMeters: r.distanceMeters,
          durationSeconds: r.durationSeconds,
        });
        setOverlayFormKind('route');
        setGeometryEditKind('route');
        setPendingPoints(waypoints);
        setFlyToTarget(waypoints[0] ?? r.points[0], 13);
        return;
      }

      if (target.kind === 'defaultZone') {
        const z = defaultZones.find((x) => x.id === target.id);
        if (!z) return;
        setOverlayForm({
          name: z.name,
          assignment: z.assignment ?? emptyAssignment(),
          alertType: z.alertType ?? 'les_deux',
          points: z.points,
        });
        setOverlayFormKind(null);
        setHighlightedZoneId(z.id);
        setOverlayVisible(z.id, true);
        setFitBoundsPoints(z.points);
      }
    },
    [
      geofences,
      locations,
      polygons,
      routes,
      defaultZones,
      setOverlayVisible,
      setFlyToTarget,
    ]
  );

  const openOverlayView = useCallback(
    (target: ZoneSelectTarget) => {
      loadOverlayPanel(target, 'view');
    },
    [loadOverlayPanel]
  );

  const openEdit = useCallback(
    (target: NonNullable<EditTarget>) => {
      loadOverlayPanel(target, 'edit');
    },
    [loadOverlayPanel]
  );

  const startOverlayEdit = useCallback(() => {
    if (!editTarget) return;
    setOverlayPanelMode('edit');

    if (editTarget.kind === 'polygon') {
      const p = polygons.find((x) => x.id === editTarget.id);
      if (!p) return;
      setGeometryEditKind('polygon');
      setPendingPoints([...p.points]);
      return;
    }

    if (editTarget.kind === 'route') {
      const r = routes.find((x) => x.id === editTarget.id);
      if (!r) return;
      const waypoints = routeEditWaypoints(r);
      setGeometryEditKind('route');
      setPendingPoints(waypoints);
    }
  }, [editTarget, polygons, routes]);

  const saveGeometryEdit = useCallback(async (): Promise<boolean> => {
    if (!editTarget || !overlayForm) return false;

    if (editTarget.kind === 'polygon' && geometryEditKind === 'polygon') {
      if (pendingPoints.length < 3) {
        setPolygonDrawError('Le polygone nécessite au moins 3 points.');
        return false;
      }
      if (closingWouldSelfIntersect(pendingPoints)) {
        setPolygonDrawError(
          'Polygone invalide : la fermeture croise des segments.'
        );
        return false;
      }
      updatePolygon(editTarget.id, {
        ...overlayForm,
        points: [...pendingPoints],
      });
      return true;
    }

    if (editTarget.kind === 'route' && geometryEditKind === 'route') {
      if (pendingPoints.length < 2) {
        setPolygonDrawError('La route nécessite au moins 2 points.');
        return false;
      }
      const result = await fetchDrivingRoute(pendingPoints);
      updateRoute(editTarget.id, {
        ...overlayForm,
        points: result.geometry,
        waypoints: [...pendingPoints],
        waypointLocationIds: undefined,
        distanceMeters: result.distanceMeters,
        durationSeconds: result.durationSeconds,
      });
      return true;
    }

    return false;
  }, [
    editTarget,
    overlayForm,
    geometryEditKind,
    pendingPoints,
    updatePolygon,
    updateRoute,
  ]);

  useEffect(() => {
    setManageSelectedIds([]);
  }, [manageDialog]);

  const toggleManageSelect = useCallback((id: string) => {
    setManageSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const selectAllManage = useCallback((ids: string[]) => {
    setManageSelectedIds(ids);
  }, []);

  const clearManageSelection = useCallback(() => {
    setManageSelectedIds([]);
  }, []);

  const openBulkAssign = useCallback((ids: string[], kind: BulkAssignKind) => {
    if (ids.length === 0) return;
    setBulkAssignIds(ids);
    setBulkAssignKind(kind);
    setBulkAssignOpen(true);
  }, []);

  const closeBulkAssign = useCallback(() => {
    setBulkAssignOpen(false);
  }, []);

  const applyBulkAssignment = useCallback(
    (assignment: AssignmentScope, alertType: GeofenceAlertType) => {
      if (!bulkAssignKind || bulkAssignIds.length === 0) return;
      const idSet = new Set(bulkAssignIds);
      const vehicleId =
        assignment.mode === 'vehicle' ? assignment.ids[0] ?? '' : '';

      if (bulkAssignKind === 'geofence') {
        setGeofences((prev) =>
          prev.map((o) =>
            idSet.has(o.id)
              ? { ...o, assignment, alertType, vehicleId }
              : o
          )
        );
      } else if (bulkAssignKind === 'polygon') {
        setPolygons((prev) =>
          prev.map((o) =>
            idSet.has(o.id) ? { ...o, assignment, alertType } : o
          )
        );
      } else if (bulkAssignKind === 'defaultZone') {
        setDefaultZones((prev) =>
          prev.map((z) =>
            idSet.has(z.id)
              ? { ...z, assignment, alertType, visible: true }
              : z
          )
        );
      }

      setBulkAssignOpen(false);
      setManageSelectedIds([]);
    },
    [bulkAssignKind, bulkAssignIds]
  );

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
    polygonDrawError,
    clearPolygonDrawError,
    undoPendingPoint,
    geofenceDraft,
    setGeofenceDraft,
    geofenceModalOpen,
    setGeofenceModalOpen,
    locationForm,
    setLocationForm,
    locationFormOpen,
    overlayForm,
    setOverlayForm,
    overlayFormKind,
    editTarget,
    setEditTarget,
    geometryEditKind,
    editingOverlayId,
    activeGeometryMode,
    manageDialog,
    setManageDialog,
    routeCreateOpen,
    routeCreateMode,
    openRouteCreate,
    closeRouteCreate,
    setRouteCreateMode,
    routePreview,
    setRoutePreview,
    geofences,
    locations,
    routes,
    polygons,
    defaultZones,
    allOverlays,
    highlightedZoneId,
    setHighlightedZoneId,
    addGeofence,
    updateGeofence,
    addLocation,
    updateLocation,
    addRouteFromDraft,
    updateRoute,
    addPolygonFromDraft,
    updatePolygon,
    updateDefaultZone,
    removeOverlays,
    removeAllOverlays,
    setOverlayVisible,
    flyToTarget,
    flyToZoom,
    setFlyToTarget,
    fitBoundsPoints,
    setFitBoundsPoints,
    startDraw,
    cancelDrawing,
    finishMultiPointDraw,
    handleMapClick,
    beginGeofenceAt,
    finishGeofencePlace,
    overlayPanelMode,
    openOverlayView,
    startOverlayEdit,
    openEdit,
    closeEditForms,
    bulkAssignOpen,
    bulkAssignIds,
    bulkAssignKind,
    manageSelectedIds,
    toggleManageSelect,
    selectAllManage,
    clearManageSelection,
    openBulkAssign,
    closeBulkAssign,
    applyBulkAssignment,
    tryAddPolygonPoint,
    saveGeometryEdit,
  };
}
