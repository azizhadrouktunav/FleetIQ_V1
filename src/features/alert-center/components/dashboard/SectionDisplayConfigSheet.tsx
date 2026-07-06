import { ChevronDown, ChevronUp } from 'lucide-react';
import { DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import { getAlertTypeIconConfigWithFallback } from '@/design-system/alert-type-icons';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSectionId } from '../../constants/alert-config-sections';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import {
  getPoolAlertTypesForSection,
  isDoorOrTrunkAlert,
  type SectionDisplayConfig,
} from '../../constants/section-display-config';
import { Switch } from '../config/Switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface SectionDisplayConfigSheetProps {
  sectionId: AlertCenterSectionId;
  sectionLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SectionDisplayConfig;
  setItemVisible: (alertType: AlertType, visible: boolean) => void;
  moveItem: (alertType: AlertType, direction: 'up' | 'down') => void;
  resetToDefaults: () => void;
}

export function SectionDisplayConfigSheet({
  sectionId,
  sectionLabel,
  open,
  onOpenChange,
  config,
  setItemVisible,
  moveItem,
  resetToDefaults,
}: SectionDisplayConfigSheetProps) {
  const sortedItems = [...config.items].sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleCount = sortedItems.filter((item) => item.visible).length;
  const totalCount = getPoolAlertTypesForSection(sectionId).length;
  const isDashboard = sectionId === 'dashboard';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <SheetTitle>Configuration — {sectionLabel}</SheetTitle>
          <SheetDescription>
            {visibleCount} alerte(s) affichée(s) sur {totalCount}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {sortedItems.map((item, index) => {
            const entry = getTaxonomyEntry(item.alertType);
            const indicator = DASHBOARD_INDICATORS.find((i) => i.alertTypeId === item.alertType);
            const iconConfig = getAlertTypeIconConfigWithFallback(
              item.alertType,
              entry.defaultSeverity
            );
            const Icon = indicator?.icon ?? iconConfig.icon;
            const isCritical = entry.defaultSeverity === 'critical';
            const isDoorTrunk = isDashboard && isDoorOrTrunkAlert(item.alertType);

            return (
              <div
                key={item.alertType}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  item.visible
                    ? 'border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700'
                    : 'border-slate-100 bg-slate-50/80 opacity-75 dark:bg-slate-900/50 dark:border-slate-800'
                )}
              >
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(item.alertType, 'up')}
                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    aria-label="Monter"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === sortedItems.length - 1}
                    onClick={() => moveItem(item.alertType, 'down')}
                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                  <Icon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {indicator?.label ?? entry.label}
                    </p>
                    {isDoorTrunk && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        Porte/coffre
                      </Badge>
                    )}
                    {isDashboard && !isCritical && !isDoorTrunk && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        Non critique
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Ordre #{item.displayOrder}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Switch
                    checked={item.visible}
                    onCheckedChange={(visible) => setItemVisible(item.alertType, visible)}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {item.visible ? 'Affiché' : 'Masqué'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" className="w-full" onClick={resetToDefaults}>
            Réinitialiser aux valeurs par défaut
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
