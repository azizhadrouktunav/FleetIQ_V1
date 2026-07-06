import type { AlertType } from '@/types/alerts';

export interface FleetParcAlertModule {
  id: string;
  label: string;
  description: string;
  alertTypes: AlertType[];
  typeLabels?: Partial<Record<AlertType, string>>;
}

export const FLEET_PARC_ALERT_MODULES: FleetParcAlertModule[] = [
  {
    id: 'maintenance',
    label: 'Gestion de maintenance',
    description: 'Rappels entretien et vidange',
    alertTypes: ['maintenance_due', 'oil_change'],
  },
  {
    id: 'documents',
    label: 'Gestion de documents',
    description: 'Assurance, contrôle technique, vignette, carte grise',
    alertTypes: [
      'technical_inspection',
      'insurance_expired',
      'registration_expired',
      'documents_expired',
    ],
    typeLabels: {
      documents_expired: 'Vignette / Autre taxe expirée',
    },
  },
  {
    id: 'rental',
    label: 'Emprunt et location',
    description: 'Échéances paiement et fin de contrat',
    alertTypes: ['lease_payment', 'lease_end'],
  },
  {
    id: 'incidents',
    label: 'Gestion des sinistres',
    description: 'Accidents et sinistres véhicule',
    alertTypes: ['accident'],
  },
];

export function getFleetParcAlertTypes(): AlertType[] {
  return FLEET_PARC_ALERT_MODULES.flatMap((m) => m.alertTypes);
}

export function getFleetParcAlertLabel(
  alertType: AlertType,
  defaultLabel: string
): string {
  for (const mod of FLEET_PARC_ALERT_MODULES) {
    if (mod.typeLabels?.[alertType]) return mod.typeLabels[alertType]!;
  }
  return defaultLabel;
}
