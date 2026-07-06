import type { AlertType } from '@/types/alerts';

export interface SecurityAlertGroup {
  id: string;
  label: string;
  alertTypes: AlertType[];
}

/** Types excluded from security config — non-GPS or redundant behavior alerts */
export const EXCLUDED_SECURITY_ALERT_TYPES: AlertType[] = [
  'hard_deceleration',
  'aggressive_driving',
  'harsh_brake',
  'harsh_accel',
  'harsh_turn',
  'gps_battery_low',
  'gps_jamming',
  'power_cut',
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
    alertTypes: ['battery_disconnected', 'towing', 'unauthorized_start', 'fuel_theft', 'removal'],
  },
  {
    id: 'driving',
    label: 'Conduite',
    alertTypes: ['speeding', 'excessive_idle', 'driving_time_exceeded'],
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
