import { useEffect, useState } from 'react';
import { PanelRight, History } from 'lucide-react';
import type { Vehicle } from '@/types';
import { initAlertStore, getUnreadCount } from '../../api/alert-api';
import { useAlertCenterContext } from '../../context/AlertCenterContext';
import { GlobalAlertSectionsDashboard } from '../dashboard/GlobalAlertSectionsDashboard';
import { ContextualRightPanel } from '../sidebar/ContextualRightPanel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertCenterPageProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onOpenHistory?: (vehicleIds?: string[]) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function AlertCenterPage({
  vehicles,
  onNavigateToVehicle,
  onOpenHistory,
  onUnreadCountChange,
}: AlertCenterPageProps) {
  const { selectedVehicleId, setSelectedVehicleId, refreshUnreadCount } = useAlertCenterContext();
  const [showMobileOverview, setShowMobileOverview] = useState(false);

  useEffect(() => {
    initAlertStore(vehicles);
    refreshUnreadCount();
  }, [vehicles, refreshUnreadCount]);

  const unreadCount = getUnreadCount();

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
    refreshUnreadCount();
  }, [unreadCount, onUnreadCountChange, refreshUnreadCount]);

  const handleCloseInspector = () => {
    setSelectedVehicleId(null);
    setShowMobileOverview(false);
  };

  const showRightPanel = Boolean(selectedVehicleId);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-slate-950 relative">
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <div className="flex items-center justify-between px-4 lg:px-6 pt-4 pb-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Centre d&apos;alertes
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {unreadCount} alerte(s) non lue(s)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showRightPanel && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowMobileOverview((v) => !v)}
                aria-label="Panneau véhicule"
              >
                <PanelRight className="w-4 h-4" />
              </Button>
            )}
            {onOpenHistory && (
              <Button variant="outline" size="sm" onClick={() => onOpenHistory()}>
                <History className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Historique</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <GlobalAlertSectionsDashboard
            onNavigateToVehicle={onNavigateToVehicle}
            onSelectVehicle={(vehicleId) => {
              setSelectedVehicleId(vehicleId);
              setShowMobileOverview(true);
            }}
          />
        </div>
      </div>

      {showRightPanel && showMobileOverview && (
        <div
          className="absolute inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setShowMobileOverview(false)}
          aria-hidden
        />
      )}

      {showRightPanel && selectedVehicleId && (
        <aside className="hidden lg:flex w-[320px] shrink-0 h-full overflow-hidden border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <ContextualRightPanel
            selectedVehicleId={selectedVehicleId}
            onBack={handleCloseInspector}
            onNavigateToVehicle={onNavigateToVehicle}
            onOpenHistory={onOpenHistory}
          />
        </aside>
      )}

      {showRightPanel && selectedVehicleId && (
        <aside
          className={cn(
            'lg:hidden absolute inset-y-0 right-0 z-40 w-[min(320px,100vw)] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden',
            showMobileOverview ? 'flex' : 'hidden'
          )}
        >
          <ContextualRightPanel
            selectedVehicleId={selectedVehicleId}
            onBack={handleCloseInspector}
            onNavigateToVehicle={onNavigateToVehicle}
            onOpenHistory={onOpenHistory}
          />
        </aside>
      )}
    </div>
  );
}
