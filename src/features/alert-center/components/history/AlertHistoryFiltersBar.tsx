import { useMemo } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import type { AlertCategory, AlertType } from '@/types/alerts';
import { ALERT_CATEGORIES } from '@/design-system/alert-categories';
import { ALERT_TAXONOMY } from '../../constants/alert-taxonomy';
import type { AlertHistoryFilters } from '../../api/alert-api';
import { AlertPeriodPickerButton } from '../filters/AlertPeriodPickerButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ALL_TYPE_OPTIONS = Object.values(ALERT_TAXONOMY).filter(
  (entry) => entry.id !== 'all' && entry.id !== 'unknown'
);

interface AlertHistoryFiltersBarProps {
  filters: AlertHistoryFilters;
  onChange: (patch: Partial<AlertHistoryFilters>) => void;
}

function toggleItem<T extends string>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((i) => i !== item) : [...items, item];
}

export function AlertHistoryFiltersBar({ filters, onChange }: AlertHistoryFiltersBarProps) {
  const typeOptions = useMemo(() => {
    if (!filters.categories?.length) return ALL_TYPE_OPTIONS;
    return ALL_TYPE_OPTIONS.filter((entry) => filters.categories!.includes(entry.category));
  }, [filters.categories]);

  const categoryLabel =
    filters.categories?.length === 0 || !filters.categories
      ? 'Catégories'
      : `${filters.categories.length} catégorie(s)`;

  const typeLabel =
    filters.alertTypes?.length === 0 || !filters.alertTypes
      ? "Types d'alerte"
      : `${filters.alertTypes.length} type(s)`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={filters.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value || undefined })}
          placeholder="Rechercher véhicule, chauffeur, lieu..."
          className="pl-9"
        />
      </div>

      <AlertPeriodPickerButton
        variant="light"
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={({ dateFrom, dateTo }) => onChange({ dateFrom, dateTo })}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="w-3.5 h-3.5" />
            {categoryLabel}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-2 max-h-64 overflow-y-auto">
          {ALERT_CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
            >
              <Checkbox
                checked={filters.categories?.includes(cat.id) ?? false}
                onCheckedChange={() =>
                  onChange({
                    categories: toggleItem(filters.categories ?? [], cat.id as AlertCategory),
                  })
                }
              />
              <span className="text-sm">{cat.label}</span>
            </label>
          ))}
          {(filters.categories?.length ?? 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 h-7 text-xs"
              onClick={() => onChange({ categories: [] })}
            >
              Tout effacer
            </Button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="w-3.5 h-3.5" />
            {typeLabel}
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72 p-2 max-h-72 overflow-y-auto">
          {typeOptions.map((entry) => (
            <label
              key={entry.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
            >
              <Checkbox
                checked={filters.alertTypes?.includes(entry.id as AlertType) ?? false}
                onCheckedChange={() =>
                  onChange({
                    alertTypes: toggleItem(filters.alertTypes ?? [], entry.id as AlertType),
                  })
                }
              />
              <span className="text-sm truncate">{entry.label}</span>
            </label>
          ))}
          {(filters.alertTypes?.length ?? 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 h-7 text-xs"
              onClick={() => onChange({ alertTypes: [] })}
            >
              Tout effacer
            </Button>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
