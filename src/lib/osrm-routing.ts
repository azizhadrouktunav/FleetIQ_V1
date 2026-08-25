import type { LatLng } from '../types/map-overlays';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

/**
 * Fetch a road-following driving route between waypoints via public OSRM.
 * Returns waypoints as a straight-line fallback on error or if fewer than 2 points.
 */
export async function fetchDrivingRoute(waypoints: LatLng[]): Promise<LatLng[]> {
  if (waypoints.length < 2) return waypoints;

  const coords = waypoints
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(';');
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return waypoints;
    const data = (await res.json()) as OsrmRouteResponse;
    if (data.code !== 'Ok' || !data.routes?.[0]?.geometry?.coordinates?.length) {
      return waypoints;
    }
    return data.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as LatLng
    );
  } catch {
    return waypoints;
  }
}
