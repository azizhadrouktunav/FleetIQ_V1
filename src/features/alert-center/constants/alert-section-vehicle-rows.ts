import type { AlertCenterSectionId } from './alert-config-sections';

export type SectionAlertColumnId =
  | 'licensePlate'
  | 'driverName'
  | 'location'
  | 'zone'
  | 'eventLabel'
  | 'alertLabel'
  | 'detail'
  | 'action';

export interface SectionAlertColumn {
  id: SectionAlertColumnId;
  label: string;
}

export interface BaseSectionAlertRow {
  vehicleId: string;
  licensePlate: string;
  driverName: string;
  location: string;
  coordinates: [number, number];
}

export interface DashboardAlertRow extends BaseSectionAlertRow {}

export interface VehicleManagementAlertRow extends BaseSectionAlertRow {
  alertLabel: string;
}

export interface GeolocationAlertRow extends BaseSectionAlertRow {
  zone: string;
  eventLabel: string;
}

export interface DetailAlertRow extends BaseSectionAlertRow {
  detail: string;
}

export type SectionAlertVehicleRow =
  | DashboardAlertRow
  | VehicleManagementAlertRow
  | GeolocationAlertRow
  | DetailAlertRow;

export function getColumnsForSection(sectionId: AlertCenterSectionId): SectionAlertColumn[] {
  switch (sectionId) {
    case 'dashboard':
      return [
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
    case 'vehicle_management':
      return [
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'alertLabel', label: 'Alerte' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
    case 'geolocation':
      return [
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'zone', label: 'Zone' },
        { id: 'eventLabel', label: 'Événement' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
    case 'security':
    case 'driving_quality':
      return [
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'detail', label: 'Détail' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
    default:
      return [
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
  }
}

export function getCellValue(
  row: SectionAlertVehicleRow,
  columnId: SectionAlertColumnId
): string | null {
  if (columnId === 'action') return null;
  const value = row[columnId as keyof SectionAlertVehicleRow];
  if (typeof value === 'string') return value;
  return '—';
}
