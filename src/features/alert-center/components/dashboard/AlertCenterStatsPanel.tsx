import { Car, ShieldAlert, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlertCenterSummary } from '../../hooks/useAlertQueries';
import { AnimatedKpiCard } from '../kpi/AnimatedKpiCard';
import { Skeleton } from '@/components/ui/skeleton';

function vehicleLabel(count: number): string {
  return count <= 1 ? 'véhicule' : 'véhicules';
}

export function AlertCenterStatsPanel({ className }: { className?: string }) {
  const { data: summary, isLoading } = useAlertCenterSummary();

  if (isLoading || !summary) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const sosCount = summary.activeSosVehicles;

  const cards = [
    {
      title: 'Véhicules concernés',
      value: summary.vehiclesInAlert,
      subtitle: vehicleLabel(summary.vehiclesInAlert),
      icon: Car,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      title: 'SOS actifs',
      value: sosCount,
      subtitle: vehicleLabel(sosCount),
      icon: ShieldAlert,
      iconColor: sosCount > 0 ? 'text-rose-600' : 'text-slate-500',
      iconBg: sosCount > 0 ? 'bg-rose-50' : 'bg-slate-100',
    },
    {
      title: 'Véhicules hors ligne',
      value: summary.vehiclesOffline,
      subtitle: vehicleLabel(summary.vehiclesOffline),
      icon: WifiOff,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3', className)}>
      {cards.map((card, i) => (
        <AnimatedKpiCard key={card.title} {...card} simple index={i} />
      ))}
    </div>
  );
}
