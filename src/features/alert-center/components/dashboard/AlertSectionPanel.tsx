import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSection } from '../../constants/alert-config-sections';
import { getAlertTypesForCenterSection } from '../../constants/alert-config-sections';
import { useAlertTypeVehicleCounts } from '../../hooks/useAlertQueries';
import { AlertTypeIndicatorTile } from './AlertTypeIndicatorTile';
import { cn } from '@/lib/utils';

interface AlertSectionPanelProps {
  section: AlertCenterSection;
  defaultOpen?: boolean;
  onSelectAlertType: (alertType: AlertType) => void;
}

export function AlertSectionPanel({
  section,
  defaultOpen = true,
  onSelectAlertType,
}: AlertSectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const alertTypes = getAlertTypesForCenterSection(section.id);
  const { data: counts = {} } = useAlertTypeVehicleCounts(alertTypes);

  const activeCount = alertTypes.reduce((sum, type) => sum + (counts[type] ?? 0), 0);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            {section.label}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeCount > 0
              ? `${activeCount} véhicule(s) avec alerte(s) active(s)`
              : 'Aucune alerte active'}
          </p>
        </div>
        <ChevronDown
          className={cn('w-5 h-5 text-slate-400 transition-transform shrink-0', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-3">
            {alertTypes.map((alertType) => (
              <AlertTypeIndicatorTile
                key={alertType}
                alertType={alertType}
                vehicleCount={counts[alertType] ?? 0}
                onClick={() => onSelectAlertType(alertType)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
