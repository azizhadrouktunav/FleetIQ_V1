import type { AlertType } from '@/types/alerts';

export interface SecurityAlertGroup {
  id: string;
  label: string;
  alertTypes: AlertType[];
}

/** Types excluded from security config — non-GPS or redundant behavior alerts */
export const EXCLUDED_SECURITY_ALERT_TYPES: AlertType[] = [
  'aggressive_driving',
  'gps_battery_low',
  'gps_jamming',
  'power_cut',
  'removal',
];

export const SECURITY_ALERT_GROUPS: SecurityAlertGroup[] = [
  {
    id: 'connectivity',
    label: 'Connectivité',
    alertTypes: ['gps_signal', 'gsm_lost'],
  },
  {
    id: 'protection',
    label: 'Protection',
    alertTypes: ['battery_disconnected', 'towing', 'unauthorized_start', 'fuel_theft'],
  },
  {
    id: 'driving',
    label: 'Conduite',
    alertTypes: [
      'speeding',
      'excessive_idle',
      'driving_time_exceeded',
      'harsh_brake',
      'harsh_accel',
      'hard_deceleration',
      'harsh_turn',
    ],
  },
  {
    id: 'emergency',
    label: 'Urgence',
    alertTypes: ['sos'],
  },
];

export function getSecurityAlertTypes(): AlertType[] {
  return SECURITY_ALERT_GROUPS.flatMap((g) => g.alertTypes);
}

export function getSecurityAlertGroup(alertType: AlertType): SecurityAlertGroup | undefined {
  return SECURITY_ALERT_GROUPS.find((g) => g.alertTypes.includes(alertType));
}

export function isExcludedSecurityAlertType(alertType: AlertType): boolean {
  return EXCLUDED_SECURITY_ALERT_TYPES.includes(alertType);
}
