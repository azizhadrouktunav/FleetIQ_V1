import { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSection, AlertCenterSectionId } from '../../constants/alert-config-sections';
import { getAlertTypesForCenterSection } from '../../constants/alert-config-sections';
import { useAlertTypeVehicleCounts } from '../../hooks/useAlertQueries';
import { useSectionDisplayConfig } from '../../hooks/useSectionDisplayConfig';
import { AlertTypeIndicatorTile } from './AlertTypeIndicatorTile';
import { SectionDisplayConfigSheet } from './SectionDisplayConfigSheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertSectionPanelProps {
  section: AlertCenterSection;
  defaultOpen?: boolean;
  onSelectAlertType: (alertType: AlertType, sectionId: AlertCenterSectionId) => void;
}

export function AlertSectionPanel({
  section,
  defaultOpen = true,
  onSelectAlertType,
}: AlertSectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [configOpen, setConfigOpen] = useState(false);
  const { visibleAlertTypes, config, setItemVisible, moveItem, resetToDefaults } =
    useSectionDisplayConfig(section.id);

  const poolAlertTypes = getAlertTypesForCenterSection(section.id);
  const { data: counts = {} } = useAlertTypeVehicleCounts(poolAlertTypes);

  const displayAlertTypes = visibleAlertTypes.filter((type) => (counts[type] ?? 0) > 0);

  const activeCount = displayAlertTypes.reduce((sum, type) => sum + (counts[type] ?? 0), 0);

  return (
    <>
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex-1 flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors min-w-0"
          >
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {section.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {visibleAlertTypes.length === 0
                  ? 'Aucune alerte configurée'
                  : displayAlertTypes.length === 0
                    ? 'Aucune alerte active'
                    : `${activeCount} véhicule(s) avec alerte(s) active(s)`}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-slate-400 transition-transform shrink-0 ml-2',
                open && 'rotate-180'
              )}
            />
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mr-2"
            onClick={(e) => {
              e.stopPropagation();
              setConfigOpen(true);
            }}
            aria-label={`Configuration — ${section.label}`}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {open && (
          <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
            {displayAlertTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {visibleAlertTypes.length === 0
                  ? 'Aucune alerte configurée — cliquez sur l&apos;icône configuration'
                  : 'Aucune alerte active'}
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-3">
                {displayAlertTypes.map((alertType) => (
                  <AlertTypeIndicatorTile
                    key={alertType}
                    alertType={alertType}
                    vehicleCount={counts[alertType] ?? 0}
                    onClick={() => onSelectAlertType(alertType, section.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SectionDisplayConfigSheet
        sectionId={section.id}
        sectionLabel={section.label}
        open={configOpen}
        onOpenChange={setConfigOpen}
        config={config}
        setItemVisible={setItemVisible}
        moveItem={moveItem}
        resetToDefaults={resetToDefaults}
      />
    </>
  );
}
