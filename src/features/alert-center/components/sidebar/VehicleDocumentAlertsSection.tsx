import { Clock } from 'lucide-react';
import type { FleetAlert } from '@/types/alerts';
import { getAlertTypeLabel } from '../../constants/alert-type-registry';
import { getFleetParcAlertLabel } from '../../constants/fleet-parc-alert-modules';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTypeIcon } from '../shared/AlertTypeIcon';

interface VehicleDocumentAlertsSectionProps {
  alerts?: FleetAlert[];
  isLoading?: boolean;
}

export function VehicleDocumentAlertsSection({
  alerts,
  isLoading,
}: VehicleDocumentAlertsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 px-4 pb-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!alerts?.length) {
    return (
      <p className="text-sm text-muted-foreground px-4 pb-4">Aucun document à régler</p>
    );
  }

  return (
    <div className="px-4 pb-4 space-y-2">
      {alerts.map((alert) => {
        const label = getFleetParcAlertLabel(alert.type, getAlertTypeLabel(alert.type));
        return (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50/50"
          >
            <AlertTypeIcon alertType={alert.type} severity={alert.severity} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <Badge
                  variant={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'high' : 'info'}
                  className="text-[10px] h-5"
                >
                  {alert.severity === 'critical' ? 'Critique' : alert.severity === 'warning' ? 'Avertissement' : 'Info'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600">{alert.message}</p>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {alert.timestamp}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
