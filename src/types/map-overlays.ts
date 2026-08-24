/** Map basemap / overlay types for Suivi map controls */

export type BasemapType = 'plan' | 'osm' | 'satellite' | 'tunav';

export type DrawMode = null | 'geofence' | 'location' | 'route' | 'polygon';

export type GeofenceShapeType = 'circulaire' | 'rectangulaire';

export type GeofenceAlertType = 'hors_zone' | 'dans_zone' | 'les_deux';

export type LatLng = [number, number]; // [lat, lng]

export interface GeofenceOverlay {
  id: string;
  kind: 'geofence';
  name: string;
  vehicleId: string;
  shapeType: GeofenceShapeType;
  alertType: GeofenceAlertType;
  radiusKm: number;
  center: LatLng;
  visible: boolean;
}

export interface LocationOverlay {
  id: string;
  kind: 'location';
  name: string;
  position: LatLng;
  visible: boolean;
}

export interface RouteOverlay {
  id: string;
  kind: 'route';
  name: string;
  points: LatLng[];
  visible: boolean;
}

export interface PolygonOverlay {
  id: string;
  kind: 'polygon';
  name: string;
  points: LatLng[];
  visible: boolean;
}

export type MapOverlay =
  | GeofenceOverlay
  | LocationOverlay
  | RouteOverlay
  | PolygonOverlay;

export interface GeofenceDraft {
  vehicleId: string;
  name: string;
  shapeType: GeofenceShapeType;
  alertType: GeofenceAlertType;
  radiusKm: number;
  center: LatLng;
}

export const BASEMAP_TILES: Record<
  BasemapType,
  { url: string; attribution: string; label: string }
> = {
  plan: {
    label: 'Plan',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    label: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  tunav: {
    label: 'TUNAV',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      'TUNAV &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Approximate rectangle bounds from center + radius in km (half-side = radius) */
export function rectangleBoundsFromCenter(
  center: LatLng,
  radiusKm: number
): [[number, number], [number, number]] {
  const [lat, lng] = center;
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return [
    [lat - dLat, lng - dLng],
    [lat + dLat, lng + dLng],
  ];
}
