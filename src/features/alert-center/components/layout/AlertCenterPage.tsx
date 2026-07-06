import { useEffect, useState } from 'react';
import { Settings, Filter, PanelRight } from 'lucide-react';
import type { Vehicle } from '@/types';
import { initAlertStore, getUnreadCount } from '../../api/alert-api';
import { useAlertFilters } from '../../hooks/useAlertFilters';
import {
  useVehicleSummaries,
  useAlertKpis,
  useMarkAllRead,
} from '../../hooks/useAlertQueries';
import { useAlertCenterContext } from '../../context/AlertCenterContext';
import { AlertFiltersPanel } from '../filters/AlertFiltersPanel';
import { VehicleAlertCardList } from '../vehicle/VehicleAlertCardList';
import { ContextualRightPanel } from '../sidebar/ContextualRightPanel';
import { AlertKpiGrid } from '../kpi/AlertKpiGrid';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertCenterPageProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onOpenSettings?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function AlertCenterPage({
  vehicles,
  onNavigateToVehicle,
  onOpenSettings,
  onUnreadCountChange,
}: AlertCenterPageProps) {
  const { filters, updateFilter, resetFilters } = useAlertFilters();
  const { selectedVehicleId, setSelectedVehicleId, refreshUnreadCount } = useAlertCenterContext();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileOverview, setShowMobileOverview] = useState(false);

  useEffect(() => {
    initAlertStore(vehicles);
    refreshUnreadCount();
  }, [vehicles, refreshUnreadCount]);

  const { data: summaries, isLoading, isError, refetch } = useVehicleSummaries(filters);
  const { data: kpis, isLoading: kpisLoading } = useAlertKpis();
  const markAllRead = useMarkAllRead();

  const unreadCount = getUnreadCount();

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
    refreshUnreadCount();
  }, [unreadCount, onUnreadCountChange, refreshUnreadCount, summaries]);

  const handleSelectVehicle = (vehicleId: string) => {
    if (!vehicleId) {
      setSelectedVehicleId(null);
    } else {
      setSelectedVehicleId(vehicleId);
      setShowMobileOverview(true);
    }
  };

  const filtersPanel = (
    <AlertFiltersPanel
      filters={filters}
      vehicles={vehicles}
      onUpdate={updateFilter}
      onReset={resetFilters}
    />
  );

  const rightPanel = (
    <ContextualRightPanel
      selectedVehicleId={selectedVehicleId}
      selectedDate={filters.selectedDate}
      onBack={() => {
        setSelectedVehicleId(null);
        setShowMobileOverview(false);
      }}
      onSelectVehicle={(id) => handleSelectVehicle(id)}
      onNavigateToVehicle={onNavigateToVehicle}
      onOpenSettings={onOpenSettings}
    />
  );

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
      {/* 1. Sidebar filtres — pleine hauteur desktop */}
      <aside className="hidden xl:flex w-[280px] shrink-0 h-full border-r border-slate-800">
        {filtersPanel}
      </aside>

      {/* Overlay mobile filtres */}
      {showMobileFilters && (
        <div
          className="absolute inset-0 bg-black/40 z-30 xl:hidden"
          onClick={() => setShowMobileFilters(false)}
          aria-hidden
        />
      )}

      {/* Drawer filtres mobile — pleine hauteur */}
      <aside
        className={cn(
          'xl:hidden absolute inset-y-0 left-0 z-40 w-[280px] border-r border-slate-800 shadow-xl',
          showMobileFilters ? 'flex' : 'hidden'
        )}
      >
        {filtersPanel}
      </aside>

      {/* 2. Colonne centrale : header + KPI + liste véhicules */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <div className="flex items-center justify-between px-4 lg:px-6 pt-4 pb-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Centre d&apos;alertes
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {unreadCount} alerte(s) non lue(s) · {summaries?.length ?? 0} véhicule(s)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setShowMobileFilters((v) => !v)}
              aria-label="Filtres"
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileOverview((v) => !v)}
              aria-label="Panneau flotte"
            >
              <PanelRight className="w-4 h-4" />
            </Button>
            {onOpenSettings && (
              <Button variant="outline" size="sm" onClick={onOpenSettings}>
                <Settings className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Configuration</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate(undefined, { onSuccess: refreshUnreadCount })}
            >
              Tout marquer lu
            </Button>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <AlertKpiGrid data={kpis} isLoading={kpisLoading} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <VehicleAlertCardList
            summaries={summaries}
            isLoading={isLoading}
            isError={isError}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={handleSelectVehicle}
            onRetry={() => refetch()}
          />
        </div>
      </div>

      {/* Overlay mobile panneau droit */}
      {showMobileOverview && (
        <div
          className="absolute inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setShowMobileOverview(false)}
          aria-hidden
        />
      )}

      {/* 3. Panneau droit — pleine hauteur desktop */}
      <aside className="hidden lg:flex w-[320px] shrink-0 h-full overflow-hidden border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {rightPanel}
      </aside>

      {/* Drawer panneau droit mobile — pleine hauteur */}
      <aside
        className={cn(
          'lg:hidden absolute inset-y-0 right-0 z-40 w-[min(320px,100vw)] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden',
          showMobileOverview ? 'flex' : 'hidden'
        )}
      >
        {rightPanel}
      </aside>
    </div>
  );
}
