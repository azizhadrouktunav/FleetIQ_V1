import { getAlertTypeIconConfigWithFallback } from '@/design-system/alert-type-icons';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import type { AlertType } from '@/types/alerts';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AlertTypeIndicatorTileProps {
  alertType: AlertType;
  vehicleCount: number;
  onClick: () => void;
}

export function AlertTypeIndicatorTile({
  alertType,
  vehicleCount,
  onClick,
}: AlertTypeIndicatorTileProps) {
  const entry = getTaxonomyEntry(alertType);
  const iconConfig = getAlertTypeIconConfigWithFallback(alertType, entry.defaultSeverity);
  const Icon = iconConfig.icon;
  const isActive = vehicleCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors text-center',
        isActive
          ? 'border-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700'
          : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60 dark:bg-slate-900 dark:border-slate-700'
      )}
    >
      <div className="relative">
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </div>
        {vehicleCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 text-[10px] font-bold"
          >
            {vehicleCount}
          </Badge>
        )}
      </div>
      <span className="text-[10px] leading-tight text-slate-700 dark:text-slate-300 line-clamp-2">
        {entry.label}
      </span>
    </button>
  );
}
