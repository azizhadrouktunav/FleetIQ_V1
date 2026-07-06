import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AlertFilters, AlertRule } from '@/types/alerts';
import {
  fetchAlerts,
  fetchKpis,
  fetchVehicleHealth,
  fetchFleetOverview,
  fetchRecentAlerts,
  type RecentAlertsFilters,
  fetchVehicleTimeline,
  fetchVehicleDocumentAlerts,
  fetchGeofenceRulesForVehicle,
  fetchAnalytics,
  fetchVehicleSummaries,
  fetchVehicleAlerts,
  fetchAlertRules,
  saveAlertRule,
  resolveAlert,
  markAllAlertsRead,
} from '../api/alert-api';
import {
  batchUpsertScopeConfigs,
  deleteAlertContact,
  deleteGeofenceRule,
  fetchAlertContacts,
  fetchBuiltinSeverityOverrides,
  fetchCustomSeverities,
  fetchGeofenceRules,
  fetchNamedUsers,
  fetchOrgStructure,
  fetchScopeConfigs,
  fetchSeverityPolicies,
  saveAlertContact,
  saveBuiltinSeverityOverrides,
  saveCustomSeverities,
  saveGeofenceRule,
  saveSeverityPolicies,
} from '../api/alert-config-api';
import type {
  AlertScopeRef,
  BuiltinSeverityOverride,
  CustomSeverityLevel,
  GeofenceAlertRule,
  SeverityNotificationPolicy,
} from '@/types/alert-config';
import type { AlertNotificationContact, AlertScopeConfig } from '@/types/alert-config';

export const alertKeys = {
  all: ['alerts'] as const,
  list: (filters: AlertFilters) => [...alertKeys.all, 'list', filters] as const,
  summaries: (filters: AlertFilters) => [...alertKeys.all, 'summaries', filters] as const,
  vehicleAlerts: (vehicleId: string) => [...alertKeys.all, 'vehicleAlerts', vehicleId] as const,
  kpis: () => [...alertKeys.all, 'kpis'] as const,
  health: () => [...alertKeys.all, 'health'] as const,
  overview: () => [...alertKeys.all, 'overview'] as const,
  recentAlerts: (filters: RecentAlertsFilters) => [...alertKeys.all, 'recentAlerts', filters] as const,
  timeline: (vehicleId: string) => [...alertKeys.all, 'timeline', vehicleId] as const,
  documentAlerts: (vehicleId: string) => [...alertKeys.all, 'documentAlerts', vehicleId] as const,
  vehicleGeofenceRules: (vehicleId: string) => [...alertKeys.all, 'vehicleGeofenceRules', vehicleId] as const,
  analytics: () => [...alertKeys.all, 'analytics'] as const,
  rules: () => [...alertKeys.all, 'rules'] as const,
  orgStructure: () => [...alertKeys.all, 'orgStructure'] as const,
  scopeConfigs: () => [...alertKeys.all, 'scopeConfigs'] as const,
  geofenceRules: () => [...alertKeys.all, 'geofenceRules'] as const,
  severityPolicies: () => [...alertKeys.all, 'severityPolicies'] as const,
  alertContacts: () => [...alertKeys.all, 'alertContacts'] as const,
  namedUsers: () => [...alertKeys.all, 'namedUsers'] as const,
  customSeverities: () => [...alertKeys.all, 'customSeverities'] as const,
  builtinSeverityOverrides: () => [...alertKeys.all, 'builtinSeverityOverrides'] as const,
};

export function useAlertKpis() {
  return useQuery({ queryKey: alertKeys.kpis(), queryFn: fetchKpis });
}

export function useAlerts(filters: AlertFilters) {
  return useQuery({ queryKey: alertKeys.list(filters), queryFn: () => fetchAlerts(filters) });
}

export function useVehicleSummaries(filters: AlertFilters) {
  return useQuery({
    queryKey: alertKeys.summaries(filters),
    queryFn: () => fetchVehicleSummaries(filters),
  });
}

export function useVehicleAlerts(vehicleId: string | null) {
  return useQuery({
    queryKey: alertKeys.vehicleAlerts(vehicleId ?? ''),
    queryFn: () => fetchVehicleAlerts(vehicleId as string),
    enabled: Boolean(vehicleId),
  });
}

export function useVehicleHealth() {
  return useQuery({ queryKey: alertKeys.health(), queryFn: fetchVehicleHealth });
}

export function useFleetOverview() {
  return useQuery({ queryKey: alertKeys.overview(), queryFn: fetchFleetOverview });
}

export function useRecentAlerts(filters: RecentAlertsFilters) {
  return useQuery({
    queryKey: alertKeys.recentAlerts(filters),
    queryFn: () => fetchRecentAlerts(filters),
  });
}

export function useVehicleTimeline(vehicleId: string | null) {
  return useQuery({
    queryKey: alertKeys.timeline(vehicleId ?? ''),
    queryFn: () => fetchVehicleTimeline(vehicleId as string),
    enabled: Boolean(vehicleId),
  });
}

export function useVehicleDocumentAlerts(vehicleId: string | null) {
  return useQuery({
    queryKey: alertKeys.documentAlerts(vehicleId ?? ''),
    queryFn: () => fetchVehicleDocumentAlerts(vehicleId as string),
    enabled: Boolean(vehicleId),
  });
}

export function useVehicleGeofenceRules(vehicleId: string | null) {
  return useQuery({
    queryKey: alertKeys.vehicleGeofenceRules(vehicleId ?? ''),
    queryFn: () => fetchGeofenceRulesForVehicle(vehicleId as string),
    enabled: Boolean(vehicleId),
  });
}

export function useAlertAnalytics() {
  return useQuery({ queryKey: alertKeys.analytics(), queryFn: fetchAnalytics });
}

export function useAlertRules() {
  return useQuery({ queryKey: alertKeys.rules(), queryFn: fetchAlertRules });
}

export function useSaveAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => saveAlertRule(rule),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.rules() }),
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.all }),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAlertsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.all }),
  });
}

export function useOrgStructure() {
  return useQuery({ queryKey: alertKeys.orgStructure(), queryFn: fetchOrgStructure });
}

export function useScopeConfigs() {
  return useQuery({ queryKey: alertKeys.scopeConfigs(), queryFn: fetchScopeConfigs });
}

export function useBatchUpsertScopeConfigs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      scopes,
      updates,
    }: {
      scopes: AlertScopeRef[];
      updates: Omit<AlertScopeConfig, 'id' | 'scopeType' | 'scopeId'>[];
    }) => batchUpsertScopeConfigs(scopes, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.scopeConfigs() }),
  });
}

export function useGeofenceRules() {
  return useQuery({ queryKey: alertKeys.geofenceRules(), queryFn: fetchGeofenceRules });
}

export function useSaveGeofenceRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rule: Omit<GeofenceAlertRule, 'id'> & { id?: string }) => saveGeofenceRule(rule),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.geofenceRules() }),
  });
}

export function useDeleteGeofenceRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGeofenceRule,
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.geofenceRules() }),
  });
}

export function useSeverityPolicies() {
  return useQuery({ queryKey: alertKeys.severityPolicies(), queryFn: fetchSeverityPolicies });
}

export function useSaveSeverityPolicies() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (policies: SeverityNotificationPolicy[]) => saveSeverityPolicies(policies),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.severityPolicies() }),
  });
}

export function useAlertContacts() {
  return useQuery({ queryKey: alertKeys.alertContacts(), queryFn: fetchAlertContacts });
}

export function useSaveAlertContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contact: Omit<AlertNotificationContact, 'id'> & { id?: string }) =>
      saveAlertContact(contact),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.alertContacts() }),
  });
}

export function useDeleteAlertContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAlertContact,
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.alertContacts() }),
  });
}

export function useNamedUsers() {
  return useQuery({ queryKey: alertKeys.namedUsers(), queryFn: fetchNamedUsers });
}

export function useCustomSeverities() {
  return useQuery({ queryKey: alertKeys.customSeverities(), queryFn: fetchCustomSeverities });
}

export function useSaveCustomSeverities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (levels: CustomSeverityLevel[]) => saveCustomSeverities(levels),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.customSeverities() });
      qc.invalidateQueries({ queryKey: alertKeys.severityPolicies() });
    },
  });
}

export function useBuiltinSeverityOverrides() {
  return useQuery({
    queryKey: alertKeys.builtinSeverityOverrides(),
    queryFn: fetchBuiltinSeverityOverrides,
  });
}

export function useSaveBuiltinSeverityOverrides() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (overrides: BuiltinSeverityOverride[]) => saveBuiltinSeverityOverrides(overrides),
    onSuccess: () => qc.invalidateQueries({ queryKey: alertKeys.builtinSeverityOverrides() }),
  });
}
