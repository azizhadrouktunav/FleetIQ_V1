import React, { useEffect, useState } from 'react';
import { AlertsSidebar } from './AlertsSidebar';
import { RecentAlerts } from './RecentAlerts';
import { AlertConfiguration } from './AlertConfiguration';
import { DashboardAlertsContent } from './DashboardAlertsContent';
import { Alert, AlertType, VehicleAlertConfig } from '../types/alerts';
import { Vehicle } from '../types';
interface AlertsContentProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (
  vehicleId: string,
  coordinates: [number, number])
  => void;
  hideBadges?: boolean;
}
export function AlertsContent({
  vehicles,
  onNavigateToVehicle,
  hideBadges = false
}: AlertsContentProps) {
  const [activeAlertType, setActiveAlertType] = useState<AlertType>('all');
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<
    Map<string, VehicleAlertConfig>>(
    new Map());
  // Generate mock alerts
  useEffect(() => {
    const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'speeding',
      vehicleId: vehicles[0]?.id || '1',
      vehicleName: vehicles[0]?.name || 'Fleet-001',
      severity: 'critical',
      message:
      'Vitesse excessive détectée: 142 km/h dans une zone limitée à 90 km/h',
      timestamp: 'Il y a 5 minutes',
      location: 'Avenue des Champs-Élysées, Paris',
      isRead: false,
      details: {
        'Vitesse détectée': '142 km/h',
        'Limite autorisée': '90 km/h',
        Dépassement: '+52 km/h'
      }
    },
    {
      id: '2',
      type: 'fuel',
      vehicleId: vehicles[1]?.id || '2',
      vehicleName: vehicles[1]?.name || 'Fleet-002',
      severity: 'warning',
      message: 'Niveau de carburant faible: 15%',
      timestamp: 'Il y a 15 minutes',
      location: 'Boulevard Haussmann, Paris',
      isRead: false,
      details: {
        'Niveau actuel': '15%',
        'Autonomie restante': '~45 km'
      }
    },
    {
      id: '3',
      type: 'geofence',
      vehicleId: vehicles[2]?.id || '3',
      vehicleName: vehicles[2]?.name || 'Fleet-003',
      severity: 'info',
      message: 'Véhicule sorti de la zone autorisée "Centre Paris"',
      timestamp: 'Il y a 30 minutes',
      location: 'Périphérique Nord',
      isRead: false
    },
    {
      id: '4',
      type: 'maintenance',
      vehicleId: vehicles[0]?.id || '1',
      vehicleName: vehicles[0]?.name || 'Fleet-001',
      severity: 'warning',
      message: 'Maintenance programmée dans 500 km',
      timestamp: 'Il y a 1 heure',
      isRead: true,
      details: {
        Type: 'Révision complète',
        'Kilométrage actuel': '49,500 km',
        'Prochain entretien': '50,000 km'
      }
    },
    {
      id: '5',
      type: 'sos',
      vehicleId: vehicles[3]?.id || '4',
      vehicleName: vehicles[3]?.name || 'Fleet-004',
      severity: 'critical',
      message: 'Signal SOS activé par le conducteur',
      timestamp: 'Il y a 2 heures',
      location: 'Gare de Lyon, Paris',
      isRead: true
    }];

    setAlerts(mockAlerts);
    // Initialize alert configs for all vehicles
    const configs = new Map<string, VehicleAlertConfig>();
    vehicles.forEach((vehicle) => {
      configs.set(vehicle.id, {
        vehicleId: vehicle.id,
        enabledAlerts: new Set(['speeding', 'fuel', 'sos', 'maintenance']),
        alertSettings: {
          speeding: {
            enabled: true,
            threshold: 90,
            notifyEmail: true,
            notifySMS: false
          },
          fuel: {
            enabled: true,
            threshold: 20,
            notifyEmail: true,
            notifySMS: true
          },
          sos: {
            enabled: true,
            notifyEmail: true,
            notifySMS: true
          },
          maintenance: {
            enabled: true,
            notifyEmail: true,
            notifySMS: false
          }
        }
      });
    });
    setAlertConfigs(configs);
  }, [vehicles]);
  const handleMarkAsRead = (alertId: string) => {
    setAlerts((prev) =>
    prev.map((alert) =>
    alert.id === alertId ?
    {
      ...alert,
      isRead: true
    } :
    alert
    )
    );
  };
  const handleDismiss = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };
  const handleSaveConfig = (vehicleId: string, config: VehicleAlertConfig) => {
    setAlertConfigs((prev) => {
      const newConfigs = new Map(prev);
      newConfigs.set(vehicleId, config);
      return newConfigs;
    });
    console.log('Saving config for vehicle:', vehicleId, config);
  };
  // Filter alerts based on active type
  const filteredAlerts =
  activeAlertType === 'all' ?
  alerts :
  alerts.filter((alert) => alert.type === activeAlertType);
  // Calculate alert counts
  const alertCounts: { [key in AlertType]?: number } = {
    all: alerts.filter((a) => !a.isRead).length
  };
  alerts.forEach((alert) => {
    if (!alert.isRead) {
      alertCounts[alert.type] = (alertCounts[alert.type] || 0) + 1;
    }
  });
  return (
    <div className="flex h-full">
      <AlertsSidebar
        activeAlertType={activeAlertType}
        onSelectAlertType={(type) => {
          setActiveAlertType(type);
          setShowConfiguration(false);
        }}
        alertCounts={alertCounts}
        onOpenConfiguration={() => setShowConfiguration(!showConfiguration)}
        hideBadges={hideBadges} />
      

      <div className="flex-1 bg-slate-50 overflow-hidden relative">
        {activeAlertType === 'dashboard_alerts' ?
        <DashboardAlertsContent
          vehicles={vehicles}
          onNavigateToVehicle={onNavigateToVehicle} /> :

        showConfiguration ?
        <AlertConfiguration
          vehicles={vehicles}
          alertConfigs={alertConfigs}
          onSaveConfig={handleSaveConfig} /> :


        <RecentAlerts
          alerts={filteredAlerts}
          onMarkAsRead={handleMarkAsRead}
          onDismiss={handleDismiss} />

        }
      </div>
    </div>);

}