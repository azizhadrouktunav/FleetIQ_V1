import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Vehicle } from '@/types';
import type { AlertHistoryFilters } from '@/features/alert-center/api/alert-api';
import { initAlertStore } from '@/features/alert-center/api/alert-api';
import { useAlertHistory } from '@/features/alert-center/hooks/useAlertQueries';
import { AlertHistoryFiltersBar } from '@/features/alert-center/components/history/AlertHistoryFiltersBar';
import { AlertHistoryTable } from '@/features/alert-center/components/history/AlertHistoryTable';
import { Button } from '@/components/ui/button';

interface AlertHistoryPageProps {
  vehicles?: Vehicle[];
  initialVehicleIds?: string[];
  onBack?: () => void;
}

export function AlertHistoryPage({
  vehicles = [],
  initialVehicleIds = [],
  onBack,
}: AlertHistoryPageProps) {
  useEffect(() => {
    if (vehicles.length) initAlertStore(vehicles);
  }, [vehicles]);

  const [filters, setFilters] = useState<AlertHistoryFilters>({
    vehicleIds: initialVehicleIds.length ? initialVehicleIds : undefined,
  });

  const queryFilters = useMemo(
    () => ({
      ...filters,
      categories: filters.categories?.length ? filters.categories : undefined,
      alertTypes: filters.alertTypes?.length ? filters.alertTypes : undefined,
      vehicleIds: filters.vehicleIds?.length ? filters.vehicleIds : undefined,
    }),
    [filters]
  );

  const { data: rows = [], isLoading } = useAlertHistory(queryFilters);

  const handleFilterChange = (patch: Partial<AlertHistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="shrink-0 px-4 lg:px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-start gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0 mt-0.5">
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Historique d&apos;alerte
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Consultez et filtrez l&apos;historique des alertes de la flotte
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
        <AlertHistoryFiltersBar filters={filters} onChange={handleFilterChange} />
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Chargement...' : `${rows.length} alerte(s) trouvée(s)`}
          {initialVehicleIds.length > 0 && filters.vehicleIds?.length
            ? ' — filtré par véhicule sélectionné'
            : ''}
        </p>
        <AlertHistoryTable rows={rows} isLoading={isLoading} />
      </div>
    </div>
  );
}
