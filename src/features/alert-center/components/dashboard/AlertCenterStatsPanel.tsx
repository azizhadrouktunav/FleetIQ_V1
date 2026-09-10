import { Ban, Car, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlertCenterSummary } from '../../hooks/useAlertQueries';
import { Skeleton } from '@/components/ui/skeleton';

interface AlertCenterStatsPanelProps {
  className?: string;
  onSosClick?: () => void;
}

function vehicleUnit(count: number): string {
  return count <= 1 ? 'véhicule' : 'véhicules';
}

/** Webtrace `.alert-kpi` horizontal cards. */
export function AlertCenterStatsPanel({
  className,
  onSosClick,
}: AlertCenterStatsPanelProps) {
  const { data: summary, isLoading } = useAlertCenterSummary();

  if (isLoading || !summary) {
    return (
      <div className={cn('grid w-full grid-cols-1 gap-4 md:grid-cols-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[5.5rem] rounded-[0.9rem]" />
        ))}
      </div>
    );
  }

  const sosCount = summary.activeSosVehicles;

  return (
    <div className={cn('grid w-full grid-cols-1 gap-4 md:grid-cols-3', className)}>
      <div
        className="flex w-full items-center gap-4 rounded-[0.9rem] border bg-white px-5 py-[1.15rem] shadow-sm"
        style={{ borderColor: '#e8edf3' }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#dbeafe', color: '#2563eb' }}
        >
          <Car className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-[1.875rem] font-bold leading-tight" style={{ color: '#0f172a' }}>
            {summary.vehiclesInAlert}
            <span className="ml-1 text-sm font-semibold" style={{ color: '#64748b' }}>
              {vehicleUnit(summary.vehiclesInAlert)}
            </span>
          </p>
          <p
            className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
            style={{ color: '#64748b' }}
          >
            Véhicules concernés
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSosClick}
        className="flex w-full items-center gap-4 rounded-[0.9rem] border bg-white px-5 py-[1.15rem] text-left shadow-sm transition-colors hover:border-red-300"
        style={{ borderColor: '#e8edf3' }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#fee2e2', color: '#dc2626' }}
        >
          <ShieldAlert className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-[1.875rem] font-bold leading-tight" style={{ color: '#0f172a' }}>
            {sosCount}
            <span className="ml-1 text-sm font-semibold" style={{ color: '#64748b' }}>
              {vehicleUnit(sosCount)}
            </span>
          </p>
          <p
            className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
            style={{ color: '#64748b' }}
          >
            SOS actifs
          </p>
        </div>
      </button>

      <div
        className="flex w-full items-center gap-4 rounded-[0.9rem] border bg-white px-5 py-[1.15rem] shadow-sm"
        style={{ borderColor: '#e8edf3' }}
      >
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#f1f5f9', color: '#64748b' }}
        >
          <Ban className="h-6 w-6" aria-hidden />
        </span>
        <div>
          <p className="text-[1.875rem] font-bold leading-tight" style={{ color: '#0f172a' }}>
            {summary.vehiclesOffline}
            <span className="ml-1 text-sm font-semibold" style={{ color: '#64748b' }}>
              {vehicleUnit(summary.vehiclesOffline)}
            </span>
          </p>
          <p
            className="mt-0.5 text-[0.7rem] font-bold uppercase tracking-wider"
            style={{ color: '#64748b' }}
          >
            Véhicules hors ligne
          </p>
        </div>
      </div>
    </div>
  );
}
