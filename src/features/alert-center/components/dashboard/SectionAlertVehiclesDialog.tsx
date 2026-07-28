import { useEffect, useMemo, useState } from 'react';
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
import { TableFooter } from '@/components/TableFooter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SectionAlertVehiclesDialogProps {
  alertType: AlertType | null;
  sectionId: AlertCenterSectionId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

const cellPadding = (colId: string, columns: { id: string }[]) => {
  const isFirst = columns[0]?.id === colId;
  const isLast = columns[columns.length - 1]?.id === colId;
  return cn(
    isFirst && 'pl-6',
    isLast && 'pr-6',
    !isFirst && 'pl-3',
    !isLast && 'pr-3'
  );
};

export function SectionAlertVehiclesDialog({
  alertType,
  sectionId,
  open,
  onOpenChange,
  onNavigateToVehicle,
  onSelectVehicle,
}: SectionAlertVehiclesDialogProps) {
  const { data: rows = [], isLoading } = useVehiclesForAlertType(
    open ? alertType : null,
    open ? sectionId : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const label = alertType ? getTaxonomyEntry(alertType).label : '';
  const columns = sectionId ? getColumnsForSection(sectionId) : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [alertType, sectionId, open]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage, itemsPerPage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex flex-col min-h-0">
          {isLoading ? (
            <div className="space-y-2 px-6 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Aucun véhicule avec cette alerte
            </p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                    {columns.map((col) => (
                      <th
                        key={col.id}
                        className={cn(
                          'py-3',
                          cellPadding(col.id, columns),
                          col.id === 'action' && 'text-right'
                        )}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row: SectionAlertVehicleRow) => (
                    <tr key={row.vehicleId} className="border-b border-slate-100">
                      {columns.map((col) => {
                        if (col.id === 'action') {
                          return (
                            <td
                              key={col.id}
                              className={cn('py-2.5 text-right', cellPadding(col.id, columns))}
                            >
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
                        const isVehicleCol = col.id === 'licensePlate' && onSelectVehicle;
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              'py-2.5',
                              cellPadding(col.id, columns),
                              col.id === 'licensePlate' && 'font-medium',
                              col.id === 'alertDateTime' && 'text-muted-foreground whitespace-nowrap',
                              (col.id === 'location' || col.id === 'detail') && 'text-muted-foreground'
                            )}
                          >
                            {isVehicleCol ? (
                              <button
                                type="button"
                                className="text-left text-blue-600 hover:underline"
                                onClick={() => {
                                  onSelectVehicle(row.vehicleId);
                                  onOpenChange(false);
                                }}
                              >
                                {value}
                              </button>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <TableFooter
                currentPage={currentPage}
                totalItems={rows.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showExports={false}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
