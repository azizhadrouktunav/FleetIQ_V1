import { MapPin } from 'lucide-react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSectionId } from '../../constants/alert-config-sections';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import {
  getCellValue,
  getColumnsForSection,
  type SectionAlertVehicleRow,
} from '../../constants/alert-section-vehicle-rows';
import { useVehiclesForAlertType } from '../../hooks/useAlertQueries';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface SectionAlertVehiclesDialogProps {
  alertType: AlertType | null;
  sectionId: AlertCenterSectionId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
}

export function SectionAlertVehiclesDialog({
  alertType,
  sectionId,
  open,
  onOpenChange,
  onNavigateToVehicle,
}: SectionAlertVehiclesDialogProps) {
  const { data: rows = [], isLoading } = useVehiclesForAlertType(
    open ? alertType : null,
    open ? sectionId : null
  );
  const label = alertType ? getTaxonomyEntry(alertType).label : '';
  const columns = sectionId ? getColumnsForSection(sectionId) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
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
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className={`py-2 pr-3 ${col.id === 'action' ? 'text-right' : ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: SectionAlertVehicleRow) => (
                  <tr key={row.vehicleId} className="border-b border-slate-100">
                    {columns.map((col) => {
                      if (col.id === 'action') {
                        return (
                          <td key={col.id} className="py-2.5 text-right">
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
                        );
                      }
                      const value = getCellValue(row, col.id);
                      return (
                        <td
                          key={col.id}
                          className={`py-2.5 pr-3 ${
                            col.id === 'licensePlate' ? 'font-medium' : ''
                          } ${col.id === 'location' || col.id === 'detail' ? 'text-muted-foreground' : ''}`}
                        >
                          {value}
                        </td>
                      );
                    })}
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
