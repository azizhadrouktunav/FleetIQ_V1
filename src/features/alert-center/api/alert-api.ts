import type { Vehicle } from '@/types';
import type { AlertFilters, AlertRule, AlertSeverity, AlertType, FleetAlert, TimelineEvent, VehicleAlertItem } from '@/types/alerts';
import { CARD_DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import { delay } from '@/lib/utils';
import { generateMockAlerts } from '../mocks/mockAlerts';
import { computeKpisFromAlerts } from '../mocks/mockKpis';
import {
  buildVehicleSummaries,
  generateVehicleHealth,
  getAllVehicleAlertItemsByCategory,
} from '../mocks/mockVehicleHealth';
import { generateTimelineForVehicle, alertsToTimelineEvents } from '../mocks/mockTimeline';
import { generateFleetOverview } from '../mocks/mockFleetOverview';
import { computeAnalytics } from '../mocks/mockAnalytics';
import { getVehicleDepartmentId } from '../mocks/mockOrgStructure';
import { isDocumentAlert } from '../constants/vehicle-inspector-sections';
import { resolveCategoriesFromSections, type AlertConfigSectionId } from '../constants/alert-config-sections';
import { fetchGeofenceRules } from './alert-config-api';
import type { GeofenceAlertRule } from '@/types/alert-config';

let alertStore: FleetAlert[] = [];
let vehiclesRef: Vehicle[] = [];
let alertRulesStore: AlertRule[] = [];

export function initAlertStore(vehicles: Vehicle[]) {
  vehiclesRef = vehicles;
  alertStore = generateMockAlerts(vehicles);
}

export function getAlertStore(): FleetAlert[] {
  return alertStore;
}

function getDayBounds(isoDate: string): { from: Date; to: Date } {
  const [year, month, day] = isoDate.split('-').map(Number);
  const from = new Date(year, month - 1, day, 0, 0, 0, 0);
  const to = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { from, to };
}

function getDateRangeFromFilters(filters: AlertFilters): { from?: Date; to?: Date } {
  if (filters.selectedDate) {
    return getDayBounds(filters.selectedDate);
  }
  return getDateRangeFromPreset(filters);
}

function getDateRangeFromPreset(filters: AlertFilters): { from?: Date; to?: Date } {
  const now = new Date();
  switch (filters.datePreset) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { from: start, to: now };
    }
    case '24h':
      return { from: new Date(now.getTime() - 24 * 3600000), to: now };
    case '7d':
      return { from: new Date(now.getTime() - 7 * 24 * 3600000), to: now };
    default:
      return {};
  }
}

function getAlertTypesForIndicatorIds(indicatorIds: string[]): Set<string> {
  const types = new Set<string>();
  for (const id of indicatorIds) {
    const config = CARD_DASHBOARD_INDICATORS.find((i) => i.id === id);
    if (config) types.add(config.alertTypeId);
  }
  return types;
}

function applyFilters(alerts: FleetAlert[], filters?: AlertFilters): FleetAlert[] {
  if (!filters) return alerts;
  let result = [...alerts];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.vehicleName.toLowerCase().includes(q) ||
        (a.driverName?.toLowerCase().includes(q) ?? false)
    );
  }
  if (filters.categories.length) {
    result = result.filter((a) => filters.categories.includes(a.category));
  }
  if (filters.severities.length) {
    result = result.filter((a) => filters.severities.includes(a.severity));
  }
  if (filters.dashboardIndicatorIds.length) {
    const types = getAlertTypesForIndicatorIds(filters.dashboardIndicatorIds);
    result = result.filter((a) => types.has(a.type));
  }

  const { from, to } = getDateRangeFromFilters(filters);
  if (from) {
    result = result.filter((a) => new Date(a.createdAt) >= from);
  }
  if (to) {
    result = result.filter((a) => new Date(a.createdAt) <= to);
  }

  return result;
}

function applyVehicleStateFilters(
  summaries: ReturnType<typeof buildVehicleSummaries>,
  filters?: AlertFilters
) {
  if (!filters?.vehicleStates.length) return summaries;
  const states = filters.vehicleStates;

  return summaries.filter((s) => {
    const checks: boolean[] = [];
    if (states.includes('with_alerts')) checks.push(s.totalAlerts > 0);
    if (states.includes('without_alerts')) checks.push(s.totalAlerts === 0);
    return checks.some(Boolean);
  });
}

function applySummaryFilters(
  summaries: ReturnType<typeof buildVehicleSummaries>,
  filters?: AlertFilters
) {
  if (!filters) return summaries;
  let result = summaries;

  if (filters.departmentIds.length) {
    result = result.filter((s) => {
      const deptId = getVehicleDepartmentId(s.vehicleId);
      return deptId != null && filters.departmentIds.includes(deptId);
    });
  }
  if (filters.gpsStatuses.length) {
    result = result.filter((s) => filters.gpsStatuses.includes(s.gpsStatus));
  }
  if (filters.movementStates.length) {
    result = result.filter((s) => {
      if (filters.movementStates.includes('moving') && s.isMoving) return true;
      if (filters.movementStates.includes('stopped') && !s.isMoving) return true;
      return false;
    });
  }
  if (filters.dashboardIndicatorIds.length) {
    result = result.filter((s) =>
      filters.dashboardIndicatorIds.every(
        (id) => s.dashboardIndicators[id]?.status === 'active'
      )
    );
  }

  return result;
}

export async function fetchAlerts(filters?: AlertFilters) {
  await delay(400);
  return applyFilters(alertStore, filters);
}

export async function fetchVehicleSummaries(filters?: AlertFilters) {
  await delay(350);
  const filteredAlerts = applyFilters(alertStore, filters);
  const vehicleIdsWithAlerts = new Set(filteredAlerts.map((a) => a.vehicleId));

  let summaries = buildVehicleSummaries(vehiclesRef, alertStore);

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    summaries = summaries.filter(
      (s) =>
        s.vehicleName.toLowerCase().includes(q) ||
        s.licensePlate.toLowerCase().includes(q) ||
        s.driverName.toLowerCase().includes(q)
    );
  }

  if (filters && (filters.categories.length || filters.severities.length || filters.datePreset || filters.selectedDate || filters.dashboardIndicatorIds.length)) {
    summaries = summaries.filter((s) => vehicleIdsWithAlerts.has(s.vehicleId));
  }

  summaries = applyVehicleStateFilters(summaries, filters);
  summaries = applySummaryFilters(summaries, filters);

  if (filters?.severities.length) {
    summaries = summaries.filter((s) => {
      if (filters.severities!.includes('critical') && s.criticalCount > 0) return true;
      if (filters.severities!.includes('warning') && s.warningCount > 0) return true;
      if (filters.severities!.includes('info') && s.infoCount > 0) return true;
      return false;
    });
  }

  return summaries.sort((a, b) => b.criticalCount - a.criticalCount || b.totalAlerts - a.totalAlerts);
}

export async function fetchVehicleAlerts(vehicleId: string) {
  await delay(300);
  const vehicle = vehiclesRef.find((v) => v.id === vehicleId);
  if (!vehicle) return {} as Record<string, VehicleAlertItem[]>;

  return getAllVehicleAlertItemsByCategory(vehicleId, alertStore, vehicle);
}

export async function fetchKpis() {
  await delay(300);
  return computeKpisFromAlerts(alertStore);
}

export async function fetchVehicleHealth() {
  await delay(350);
  return generateVehicleHealth(vehiclesRef, alertStore);
}

export async function fetchFleetOverview() {
  await delay(300);
  const health = generateVehicleHealth(vehiclesRef, alertStore);
  const sosCount = alertStore.filter((a) => a.type === 'sos' && a.status === 'active').length;
  return generateFleetOverview(vehiclesRef, health, alertStore, sosCount);
}

export interface RecentAlertsFilters {
  severities?: AlertSeverity[];
  alertTypes?: AlertType[];
  configSectionIds?: AlertConfigSectionId[];
  selectedDate?: string;
  limit?: number;
}

export async function fetchRecentAlerts(filters?: RecentAlertsFilters): Promise<TimelineEvent[]> {
  await delay(300);
  let result = [...alertStore];

  if (filters?.severities?.length) {
    result = result.filter((a) => filters.severities!.includes(a.severity));
  }
  if (filters?.alertTypes?.length) {
    result = result.filter((a) => filters.alertTypes!.includes(a.type));
  }
  if (filters?.configSectionIds) {
    if (filters.configSectionIds.length === 0) return [];
    const allowedCategories = resolveCategoriesFromSections(filters.configSectionIds);
    result = result.filter((a) => allowedCategories.includes(a.category));
  }
  if (filters?.selectedDate) {
    const { from, to } = getDayBounds(filters.selectedDate);
    result = result.filter((a) => {
      const created = new Date(a.createdAt);
      return created >= from && created <= to;
    });
  }

  const limit = filters?.limit ?? 15;
  result = result
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return alertsToTimelineEvents(result);
}

export async function fetchVehicleTimeline(vehicleId: string) {
  await delay(250);
  return generateTimelineForVehicle(vehicleId, alertStore);
}

export async function fetchVehicleDocumentAlerts(vehicleId: string): Promise<FleetAlert[]> {
  await delay(200);
  return alertStore.filter(
    (a) =>
      a.vehicleId === vehicleId &&
      isDocumentAlert(a.type) &&
      a.status !== 'resolved'
  );
}

export async function fetchGeofenceRulesForVehicle(vehicleId: string): Promise<GeofenceAlertRule[]> {
  await delay(200);
  const rules = await fetchGeofenceRules();
  const deptId = getVehicleDepartmentId(vehicleId);
  return rules.filter(
    (r) =>
      r.enabled &&
      ((r.scopeType === 'vehicle' && r.scopeIds.includes(vehicleId)) ||
        (r.scopeType === 'department' && deptId != null && r.scopeIds.includes(deptId)))
  );
}

export async function fetchAnalytics() {
  await delay(400);
  return computeAnalytics(alertStore);
}

export async function resolveAlert(id: string) {
  await delay(200);
  alertStore = alertStore.map((a) =>
    a.id === id ? { ...a, status: 'resolved' as const, isRead: true } : a
  );
}

export async function markAllAlertsRead() {
  await delay(200);
  alertStore = alertStore.map((a) => ({ ...a, isRead: true }));
}

export function getUnreadCount(): number {
  return alertStore.filter((a) => !a.isRead && a.status !== 'resolved').length;
}

export async function fetchAlertRules() {
  await delay(200);
  return alertRulesStore;
}

export async function saveAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>) {
  await delay(300);
  const newRule: AlertRule = {
    ...rule,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  alertRulesStore = [...alertRulesStore, newRule];
  return newRule;
}

export async function updateAlertRule(id: string, updates: Partial<AlertRule>) {
  await delay(200);
  alertRulesStore = alertRulesStore.map((r) => (r.id === id ? { ...r, ...updates } : r));
}

export function exportVehicleTimelineCsv(vehicleId: string): string {
  const events = generateTimelineForVehicle(vehicleId, alertStore);
  const header = 'Date,Heure,Alerte,Gravité,Description,Notifié';
  const rows = events.map(
    (e) =>
      `"${e.date}","${e.time}","${e.label}","${e.severity}","${e.description}","${e.notifiedUser ?? ''}"`
  );
  return [header, ...rows].join('\n');
}

export function getVehicleById(vehicleId: string): Vehicle | undefined {
  return vehiclesRef.find((v) => v.id === vehicleId);
}
