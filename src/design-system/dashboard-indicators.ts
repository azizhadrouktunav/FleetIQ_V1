import {
  Hand,
  Package,
  Fuel,
  Shield,
  Wind,
  Lock,
  DoorOpen,
  Battery,
  Droplets,
  Thermometer,
  Wrench,
  LifeBuoy,
  Disc,
  Gauge,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import type { AlertType } from '@/types/alerts';

export interface DashboardIndicatorConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  alertTypeId: AlertType;
  visibleOnCard: boolean;
}

/** 20 dashboard indicators visible on vehicle cards per spec */
export const DASHBOARD_INDICATORS: DashboardIndicatorConfig[] = [
  { id: 'handbrake', label: 'Frein à main', shortLabel: 'FM', icon: Hand, alertTypeId: 'handbrake', visibleOnCard: true },
  { id: 'trunk', label: 'Coffre', shortLabel: 'CF', icon: Package, alertTypeId: 'trunk', visibleOnCard: true },
  { id: 'fuel', label: 'Carburant bas', shortLabel: 'FU', icon: Fuel, alertTypeId: 'fuel', visibleOnCard: true },
  { id: 'seatbelt', label: 'Ceinture conducteur', shortLabel: 'CE', icon: Shield, alertTypeId: 'seatbelt', visibleOnCard: true },
  { id: 'ac', label: 'Climatisation', shortLabel: 'CL', icon: Wind, alertTypeId: 'ac', visibleOnCard: true },
  { id: 'central_lock', label: 'Fermeture centrale', shortLabel: 'FC', icon: Lock, alertTypeId: 'central_lock', visibleOnCard: true },
  { id: 'driver_door', label: 'Porte conducteur', shortLabel: 'PC', icon: DoorOpen, alertTypeId: 'driver_door', visibleOnCard: true },
  { id: 'front_right_door', label: 'Porte avant droite', shortLabel: 'PD', icon: DoorOpen, alertTypeId: 'front_right_door', visibleOnCard: true },
  { id: 'rear_left_door', label: 'Porte arrière gauche', shortLabel: 'PG', icon: DoorOpen, alertTypeId: 'rear_left_door', visibleOnCard: true },
  { id: 'rear_right_door', label: 'Porte arrière droite', shortLabel: 'PR', icon: DoorOpen, alertTypeId: 'rear_right_door', visibleOnCard: true },
  { id: 'battery', label: 'Batterie', shortLabel: 'BA', icon: Battery, alertTypeId: 'battery', visibleOnCard: true },
  { id: 'oil_pressure', label: 'Pression huile', shortLabel: 'PH', icon: Droplets, alertTypeId: 'oil_pressure', visibleOnCard: true },
  { id: 'temperature', label: 'Temp. moteur', shortLabel: 'TM', icon: Thermometer, alertTypeId: 'temperature', visibleOnCard: true },
  { id: 'check_engine', label: 'Check Engine', shortLabel: 'CE', icon: Wrench, alertTypeId: 'check_engine', visibleOnCard: true },
  { id: 'airbag', label: 'Airbag', shortLabel: 'AB', icon: LifeBuoy, alertTypeId: 'airbag', visibleOnCard: true },
  { id: 'abs', label: 'ABS', shortLabel: 'AB', icon: Disc, alertTypeId: 'abs', visibleOnCard: true },
  { id: 'coolant_level', label: 'Liquide refroidissement', shortLabel: 'LR', icon: Droplets, alertTypeId: 'coolant_level', visibleOnCard: true },
  { id: 'brake_fluid_level', label: 'Liquide frein', shortLabel: 'LF', icon: Droplets, alertTypeId: 'brake_fluid_level', visibleOnCard: true },
  { id: 'cruise_control', label: 'Régulateur vitesse', shortLabel: 'RV', icon: Gauge, alertTypeId: 'cruise_control', visibleOnCard: true },
  { id: 'main_lights', label: 'Feux principaux', shortLabel: 'FP', icon: Lightbulb, alertTypeId: 'main_lights', visibleOnCard: true },
];

export const CARD_DASHBOARD_INDICATORS = DASHBOARD_INDICATORS.filter((i) => i.visibleOnCard);

export function getDashboardIndicator(id: string): DashboardIndicatorConfig | undefined {
  return DASHBOARD_INDICATORS.find((i) => i.id === id);
}

export const INDICATOR_SEVERITY_COLORS = {
  critical: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  inactive: 'text-slate-300',
} as const;
