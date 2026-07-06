import type { FleetOverviewData, FleetStatusVehicleItem } from '@/types/alerts';
import type { Vehicle } from '@/types';
import type { FleetAlert, VehicleHealthSnapshot } from '@/types/alerts';
import { buildVehicleSummaries } from './mockVehicleHealth';

function toStatusItem(
  vehicle: Vehicle,
  summary?: { licensePlate: string; driverName: string; lastCommunication: string }
): FleetStatusVehicleItem {
  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    licensePlate: summary?.licensePlate,
    driverName: summary?.driverName ?? vehicle.driver,
    detail: summary?.lastCommunication ?? vehicle.lastUpdate,
  };
}

export function generateFleetOverview(
  vehicles: Vehicle[],
  health: VehicleHealthSnapshot[],
  alertStore: FleetAlert[],
  sosCount: number
): FleetOverviewData {
  const summaries = buildVehicleSummaries(vehicles, alertStore);
  const summaryById = new Map(summaries.map((s) => [s.vehicleId, s]));

  const onlineVehicles = vehicles
    .filter((v) => v.status !== 'offline')
    .map((v) => toStatusItem(v, summaryById.get(v.id)));

  const offlineVehicles = vehicles
    .filter((v) => v.status === 'offline')
    .map((v) => toStatusItem(v, summaryById.get(v.id)));

  const sosAlerts = alertStore.filter((a) => a.type === 'sos' && a.status === 'active');
  const sosVehicleIds = [...new Set(sosAlerts.map((a) => a.vehicleId))];
  const sosVehicles: FleetStatusVehicleItem[] = sosVehicleIds.map((vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const alert = sosAlerts.find((a) => a.vehicleId === vehicleId);
    const summary = summaryById.get(vehicleId);
    return {
      vehicleId,
      vehicleName: vehicle?.name ?? alert?.vehicleName ?? vehicleId,
      licensePlate: summary?.licensePlate,
      driverName: summary?.driverName ?? vehicle?.driver,
      detail: alert?.message ?? 'Signal SOS actif',
    };
  });

  const topRisk = [...health]
    .sort((a, b) => a.overallScore - b.overallScore || b.alertCount - a.alertCount)
    .slice(0, 5)
    .map((h) => ({
      vehicleId: h.vehicleId,
      vehicleName: h.vehicleName,
      alertCount: h.alertCount,
    }));

  return {
    vehiclesOnline: onlineVehicles.length,
    vehiclesOffline: offlineVehicles.length,
    activeSosCount: sosCount,
    onlineVehicles,
    offlineVehicles,
    sosVehicles,
    upcomingMaintenance: [
      { vehicleName: vehicles[0]?.name ?? 'Fleet-001', dueIn: '3 jours', type: 'Révision' },
      { vehicleName: vehicles[2]?.name ?? 'Fleet-003', dueIn: '1 semaine', type: 'Pneus' },
      { vehicleName: vehicles[5]?.name ?? 'Fleet-006', dueIn: '12 jours', type: 'Vidange' },
    ],
    topRiskVehicles: topRisk,
  };
}
