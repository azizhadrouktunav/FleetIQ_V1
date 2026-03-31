export type AlertType =
'all' |
'dashboard_alerts' |
'speeding' |
'geofence' |
'country_border' |
'route' |
'towing' |
'battery_disconnected' |
'message_received' |
'temperature' |
'fuel' |
'aggressive_driving' |
'sos' |
'taxi_status' |
'ignition' |
'trunk' |
'hood' |
'door' |
'maintenance' |
'stop' |
'gps_signal' |
'long_stop' |
'driving_time_exceeded' |
'driver_identification' |
'fleet_alert' |
'photo_received' |
'removal' |
'unknown';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertTypeConfig {
  id: AlertType;
  label: string;
  icon: string;
  severity: AlertSeverity;
}

export interface Alert {
  id: string;
  type: AlertType;
  vehicleId: string;
  vehicleName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  location?: string;
  isRead: boolean;
  details?: {
    [key: string]: any;
  };
}

export interface VehicleAlertConfig {
  vehicleId: string;
  enabledAlerts: Set<AlertType>;
  alertSettings: { [key in
  AlertType]?: {
    enabled: boolean;
    threshold?: number;
    notifyEmail?: boolean;
    notifySMS?: boolean;
  } };

}