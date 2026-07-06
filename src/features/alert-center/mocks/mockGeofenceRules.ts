import type { GeofenceAlertRule } from '@/types/alert-config';

export const INITIAL_GEOFENCE_RULES: GeofenceAlertRule[] = [
  {
    id: 'geo-1',
    name: 'Entrée Centre Paris',
    zoneLabel: 'Centre Paris',
    eventType: 'entry',
    severity: 'info',
    enabled: true,
    scopeType: 'department',
    scopeIds: ['dept-transport'],
    activationType: 'permanent',
  },
  {
    id: 'geo-2',
    name: 'Sortie Dépôt Nord',
    zoneLabel: 'Dépôt Nord',
    eventType: 'exit',
    severity: 'warning',
    enabled: true,
    scopeType: 'department',
    scopeIds: ['dept-logistique'],
    activationType: 'permanent',
  },
  {
    id: 'geo-3',
    name: 'Zone interdite A1',
    zoneLabel: 'Zone A1 — Accès restreint',
    eventType: 'both',
    severity: 'critical',
    enabled: false,
    scopeType: 'vehicle',
    scopeIds: ['7', '10'],
    activationType: 'temporary',
    activationStart: '2026-01-01',
    activationEnd: '2026-12-31',
  },
  {
    id: 'geo-4',
    name: 'Sortie périmètre Tunis',
    zoneLabel: 'Périmètre Tunis',
    eventType: 'exit',
    severity: 'warning',
    enabled: true,
    scopeType: 'department',
    scopeIds: ['dept-direction'],
    activationType: 'permanent',
  },
];

export const MOCK_GEOFENCE_ZONES = [
  'Centre Paris',
  'Dépôt Nord',
  'Zone A1 — Accès restreint',
  'Périmètre Tunis',
  'Port de Radès',
  'Aéroport Tunis-Carthage',
];
