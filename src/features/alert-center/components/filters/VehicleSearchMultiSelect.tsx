import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface VehicleSearchMultiSelectProps {
  vehicles: Vehicle[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function VehicleSearchMultiSelect({ vehicles, value, onChange }: VehicleSearchMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const labelById = useMemo(() => new Map(vehicles.map((v) => [v.id, v.name])), [vehicles]);

  const filteredVehicles = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q)
    );
  }, [vehicles, query]);

  const isSelected = (id: string) => value.includes(id);

  const toggle = (id: string) => {
    onChange(isSelected(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredVehicles.map((v) => v.id);
    onChange(Array.from(new Set([...value, ...visibleIds])));
  };

  const clearAll = () => onChange([]);

  const removeOne = (id: string) => onChange(value.filter((v) => v !== id));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
        <Input
          placeholder="Véhicule, immatriculation, conducteur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          className="pl-8 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500 h-9"
        />
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {value.map((id) => (
            <Badge
              key={id}
              variant="outline"
              className="text-[10px] h-5 gap-1 border-slate-600 text-slate-300 bg-slate-800"
            >
              {labelById.get(id) ?? id}
              <button
                type="button"
                onClick={() => removeOne(id)}
                className="hover:text-white"
                aria-label={`Retirer ${labelById.get(id) ?? id}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-slate-600 bg-slate-800 shadow-lg">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-b border-slate-700">
            <span className="text-[10px] text-slate-400">
              {value.length > 0
                ? `${value.length} sélectionné${value.length > 1 ? 's' : ''}`
                : `${filteredVehicles.length} véhicule${filteredVehicles.length > 1 ? 's' : ''}`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllVisible}
                className="text-[10px] text-blue-400 hover:text-blue-300 hover:underline"
              >
                Tout sélectionner
              </button>
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[10px] text-slate-400 hover:text-slate-300 hover:underline"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filteredVehicles.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Aucun véhicule trouvé</p>
            ) : (
              filteredVehicles.map((vehicle) => (
                <label
                  key={vehicle.id}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors',
                    isSelected(vehicle.id)
                      ? 'bg-blue-900/40 border border-blue-700/50'
                      : 'hover:bg-slate-700/50 border border-transparent'
                  )}
                >
                  <Checkbox
                    checked={isSelected(vehicle.id)}
                    onCheckedChange={() => toggle(vehicle.id)}
                    className="mt-0.5 border-slate-500 data-[state=checked]:bg-blue-600"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate">{vehicle.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{vehicle.driver}</p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
