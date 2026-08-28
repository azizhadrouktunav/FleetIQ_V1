import { useMemo, useState } from 'react';
import type { Vehicle } from '@/types';
import type {
  AssignmentScope,
  GeofenceAlertType,
} from '@/types/map-overlays';
import { GEOFENCE_ALERT_LABELS } from '@/types/map-overlays';
import { MOCK_ORG_STRUCTURE } from '@/features/alert-center/mocks/mockOrgStructure';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeoAssignmentFieldsProps {
  assignment: AssignmentScope;
  onAssignmentChange: (next: AssignmentScope) => void;
  alertType: GeofenceAlertType;
  onAlertTypeChange: (next: GeofenceAlertType) => void;
  vehicles: Vehicle[];
  assignmentError?: string;
  showAlertType?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

export function GeoAssignmentFields({
  assignment,
  onAssignmentChange,
  alertType,
  onAlertTypeChange,
  vehicles,
  assignmentError,
  showAlertType = true,
  compact = false,
  disabled = false,
}: GeoAssignmentFieldsProps) {
  const [search, setSearch] = useState('');

  const allItems = useMemo(() => {
    if (assignment.mode === 'vehicle') {
      return vehicles.map((v) => ({
        id: v.id,
        label: `${v.name} (${v.driver})`,
      }));
    }
    return MOCK_ORG_STRUCTURE.departments.map((d) => ({
      id: d.id,
      label: d.name,
    }));
  }, [assignment.mode, vehicles]);

  const labelById = useMemo(
    () => new Map(allItems.map((item) => [item.id, item.label])),
    [allItems]
  );

  const items = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [allItems, search]);

  const setMode = (mode: AssignmentScope['mode']) => {
    onAssignmentChange({ mode, ids: [] });
    setSearch('');
  };

  const toggle = (id: string) => {
    const ids = assignment.ids.includes(id)
      ? assignment.ids.filter((x) => x !== id)
      : [...assignment.ids, id];
    onAssignmentChange({ ...assignment, ids });
  };

  const selectAll = () => {
    const visibleIds = items.map((item) => item.id);
    const merged = new Set([...assignment.ids, ...visibleIds]);
    onAssignmentChange({ ...assignment, ids: Array.from(merged) });
  };

  const clearAll = () => {
    onAssignmentChange({ ...assignment, ids: [] });
  };

  return (
    <div
      className={cn(
        'space-y-3',
        compact && 'space-y-2',
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      <div className="space-y-1.5">
        <Label>Affectation (optionnelle)</Label>
        <p className="text-[11px] text-slate-500">
          Vous pouvez enregistrer sans affectation et assigner plus tard via
          Gérer.
        </p>
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100">
          <button
            type="button"
            onClick={() => setMode('vehicle')}
            className={cn(
              'h-8 rounded-md text-sm font-medium transition-colors',
              assignment.mode === 'vehicle'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            )}
          >
            Véhicules
          </button>
          <button
            type="button"
            onClick={() => setMode('department')}
            className={cn(
              'h-8 rounded-md text-sm font-medium transition-colors',
              assignment.mode === 'department'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            )}
          >
            Départements
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label>
            {assignment.mode === 'vehicle' ? 'Véhicules' : 'Départements'}
          </Label>
          {assignment.ids.length > 0 && (
            <Badge variant="info" className="text-[10px] h-5">
              {assignment.ids.length} sélectionné
              {assignment.ids.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {assignment.mode === 'vehicle' && (
          <p className="text-[11px] text-slate-500">
            Plusieurs véhicules peuvent être sélectionnés.
          </p>
        )}

        {assignment.ids.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {assignment.ids.map((id) => (
              <Badge
                key={id}
                variant="outline"
                className="text-[10px] font-normal cursor-pointer"
                onClick={() => toggle(id)}
              >
                {labelById.get(id) ?? id} ×
              </Badge>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              assignment.mode === 'vehicle'
                ? 'Rechercher un véhicule…'
                : 'Rechercher un département…'
            }
            className="pl-8"
            autoComplete="off"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            disabled={items.length === 0}
            className="text-[10px] text-blue-600 hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed"
          >
            Tout sélectionner
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={assignment.ids.length === 0}
            className="text-[10px] text-slate-500 hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed"
          >
            Tout désélectionner
          </button>
        </div>

        <div className="max-h-28 sm:max-h-36 overflow-y-auto rounded-md border border-slate-200 divide-y divide-slate-100">
          {items.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">Aucun résultat</p>
          ) : (
            items.map((item) => {
              const checked = assignment.ids.includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(item.id)}
                  />
                  <span className="truncate text-slate-800">{item.label}</span>
                </label>
              );
            })
          )}
        </div>
        {assignmentError && (
          <p className="text-xs text-rose-600">{assignmentError}</p>
        )}
      </div>

      {showAlertType && (
        <div className="space-y-1.5">
          <Label htmlFor="geo-alert-type">Type d&apos;alerte</Label>
          <select
            id="geo-alert-type"
            value={alertType}
            onChange={(e) =>
              onAlertTypeChange(e.target.value as GeofenceAlertType)
            }
            className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm bg-white"
          >
            {(Object.keys(GEOFENCE_ALERT_LABELS) as GeofenceAlertType[]).map(
              (key) => (
                <option key={key} value={key}>
                  {GEOFENCE_ALERT_LABELS[key]}
                </option>
              )
            )}
          </select>
        </div>
      )}
    </div>
  );
}
