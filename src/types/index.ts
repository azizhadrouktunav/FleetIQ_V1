export type VehicleStatus = 'active' | 'idle' | 'offline';

export interface Vehicle {
  id: string;
  name: string;
  status: VehicleStatus;
  speed: number; // km/h
  location: string;
  coordinates: [number, number]; // [lat, lng]
  lastUpdate: string;
  driver: string;
  batteryLevel: number;
}

export type DurationUnit = 'days' | 'weeks' | 'months';

export interface DynamicDuration {
  type: 'relative' | 'fixed';
  // For relative dates
  unit?: DurationUnit;
  value?: number;
  // For fixed dates
  dateDebut?: string;
  dateFin?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  vehicles: string[];
  duration: DynamicDuration;
  isDefault: boolean;
  createdAt: string;
  // Additional fields for report forms
  formData?: {
    [key: string]: any;
  };
}

export * from './alerts';