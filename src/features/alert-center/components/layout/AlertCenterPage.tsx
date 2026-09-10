import { useEffect } from 'react';
import { Clock } from 'lucide-react';
import type { Vehicle } from '@/types';
import { initAlertStore, getUnreadCount } from '../../api/alert-api';
import { useAlertCenterContext } from '../../context/AlertCenterContext';
import { GlobalAlertSectionsDashboard } from '../dashboard/GlobalAlertSectionsDashboard';

interface AlertCenterPageProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onOpenHistory?: (vehicleIds?: string[]) => void;
  onUnreadCountChange?: (count: number) => void;
}

/** Webtrace-parity layout: single column, #f4f6f8, no vehicle inspector panel. */
export function AlertCenterPage({
  vehicles,
  onNavigateToVehicle,
  onOpenHistory,
  onUnreadCountChange,
}: AlertCenterPageProps) {
  const { refreshUnreadCount } = useAlertCenterContext();

  useEffect(() => {
    initAlertStore(vehicles);
    refreshUnreadCount();
  }, [vehicles, refreshUnreadCount]);

  const unreadCount = getUnreadCount();

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
    refreshUnreadCount();
  }, [unreadCount, onUnreadCountChange, refreshUnreadCount]);

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: '#f4f6f8' }}>
      <div className="box-border flex w-full flex-col gap-[1.15rem] px-4 pb-6 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="font-bold leading-tight"
              style={{ fontSize: '1.75rem', color: '#1e293b' }}
            >
              Centre d&apos;alertes
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
              {unreadCount} alerte(s) non lue(s)
            </p>
          </div>
          {onOpenHistory ? (
            <button
              type="button"
              onClick={() => onOpenHistory()}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors hover:bg-slate-50"
              style={{ borderColor: '#e2e8f0', color: '#475569' }}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Historique
            </button>
          ) : null}
        </div>

        <GlobalAlertSectionsDashboard onNavigateToVehicle={onNavigateToVehicle} />
      </div>
    </div>
  );
}
