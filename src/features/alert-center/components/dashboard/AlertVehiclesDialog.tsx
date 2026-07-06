import { MapPin } from 'lucide-react';
import type { AlertType } from '@/types/alerts';
import type { AlertTypeVehicleRow } from '../../api/alert-api';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import { useVehiclesForAlertType } from '../../hooks/useAlertQueries';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface AlertVehiclesDialogProps {
  alertType: AlertType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
}

export function AlertVehiclesDialog({
  alertType,
  open,
  onOpenChange,
  onNavigateToVehicle,
}: AlertVehiclesDialogProps) {
  const { data: rows = [], isLoading } = useVehiclesForAlertType(open ? alertType : null);
  const label = alertType ? getTaxonomyEntry(alertType).label : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Aucun véhicule avec cette alerte
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                  <th className="py-2 pr-3">Matricule</th>
                  <th className="py-2 pr-3">Chauffeur</th>
                  <th className="py-2 pr-3">Lieu</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: AlertTypeVehicleRow) => (
                  <tr key={row.vehicleId} className="border-b border-slate-100">
                    <td className="py-2.5 pr-3 font-medium">{row.licensePlate}</td>
                    <td className="py-2.5 pr-3">{row.driverName}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{row.location}</td>
                    <td className="py-2.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          onNavigateToVehicle?.(row.vehicleId, row.coordinates);
                          onOpenChange(false);
                        }}
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        Voir sur carte
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
