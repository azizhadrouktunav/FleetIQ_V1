import { useEffect, useMemo, useState } from 'react';
import type { Vehicle } from '@/types';
import type {
  AssignmentScope,
  GeofenceAlertType,
  LatLng,
  LocationOverlay,
  OverlayFormDraft,
} from '@/types/map-overlays';
import {
  emptyAssignment,
  formatRouteDistance,
  formatRouteDuration,
} from '@/types/map-overlays';
import { fetchDrivingRoute } from '@/lib/osrm-routing';
import { GeoAssignmentFields } from '@/components/GeoAssignmentFields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDown,
  ArrowLeft,
  GripVertical,
  MapPinned,
  Plus,
  Route,
  Search,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaypointStop {
  instanceId: string;
  locationId: string;
}

function createStop(locationId: string): WaypointStop {
  return {
    instanceId: `wp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    locationId,
  };
}

interface RouteViaLocationsPanelProps {
  open: boolean;
  locations: LocationOverlay[];
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (draft: OverlayFormDraft) => void;
  onRequestAddLocation: () => void;
  onPreviewChange?: (
    waypoints: LatLng[],
    metrics: { distanceMeters: number; durationSeconds: number } | null
  ) => void;
}

function SortableStopRow({
  stop,
  index,
  total,
  name,
  role,
  onMove,
  onRemove,
}: {
  stop: WaypointStop;
  index: number;
  total: number;
  name: string;
  role: string;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.instanceId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5',
        isDragging && 'opacity-90 shadow-lg border-blue-200 bg-white z-10 relative'
      )}
    >
      <button
        type="button"
        className="p-0.5 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none shrink-0"
        title="Glisser pour réordonner"
        aria-label="Glisser pour réordonner"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          {role}
        </p>
        <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
      </div>
      <button
        type="button"
        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
        disabled={index === 0}
        onClick={() => onMove(index, -1)}
        title="Monter"
      >
        <ArrowDown className="w-3.5 h-3.5 rotate-180" />
      </button>
      <button
        type="button"
        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
        disabled={index === total - 1}
        onClick={() => onMove(index, 1)}
        title="Descendre"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
        onClick={() => onRemove(index)}
        title="Retirer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

export function RouteViaLocationsPanel({
  open,
  locations,
  vehicles,
  onClose,
  onSave,
  onRequestAddLocation,
  onPreviewChange,
}: RouteViaLocationsPanelProps) {
  const [name, setName] = useState('');
  const [stops, setStops] = useState<WaypointStop[]>([]);
  const [stagingIds, setStagingIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [assignment, setAssignment] = useState<AssignmentScope>(
    emptyAssignment()
  );
  const [alertType, setAlertType] = useState<GeofenceAlertType>('les_deux');
  const [metrics, setMetrics] = useState<{
    distanceMeters: number;
    durationSeconds: number;
  } | null>(null);
  const [geometry, setGeometry] = useState<LatLng[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    waypoints?: string;
    assignment?: string;
  }>({});
  const [routing, setRouting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleLocations = useMemo(
    () => locations.filter((l) => l.visible !== false),
    [locations]
  );

  const locById = useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations]
  );

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visibleLocations;
    return visibleLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)
    );
  }, [visibleLocations, search]);

  const locationIds = useMemo(
    () => stops.map((s) => s.locationId),
    [stops]
  );

  const waypoints = useMemo(() => {
    return locationIds
      .map((id) => locById.get(id)?.position)
      .filter((p): p is LatLng => !!p);
  }, [locationIds, locById]);

  useEffect(() => {
    if (!open) return;
    setName('');
    setStops([]);
    setStagingIds([]);
    setSearch('');
    setAssignment(emptyAssignment());
    setAlertType('les_deux');
    setMetrics(null);
    setGeometry([]);
    setErrors({});
  }, [open]);

  useEffect(() => {
    if (!open) {
      onPreviewChange?.([], null);
    }
  }, [open, onPreviewChange]);

  useEffect(() => {
    if (!open || waypoints.length < 2) {
      setMetrics(null);
      setGeometry(waypoints);
      onPreviewChange?.(waypoints, null);
      return;
    }
    let cancelled = false;
    setRouting(true);
    const timer = window.setTimeout(() => {
      void fetchDrivingRoute(waypoints).then((result) => {
        if (cancelled) return;
        setGeometry(result.geometry);
        const m = {
          distanceMeters: result.distanceMeters,
          durationSeconds: result.durationSeconds,
        };
        setMetrics(m);
        setRouting(false);
        onPreviewChange?.(result.geometry, m);
      });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints, open]);

  if (!open) return null;

  const toggleStaging = (id: string) => {
    setStagingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const visibleIds = filteredLocations.map((l) => l.id);
    setStagingIds((prev) => {
      const merged = [...prev];
      for (const id of visibleIds) {
        if (!merged.includes(id)) merged.push(id);
      }
      return merged;
    });
  };

  const clearStaging = () => setStagingIds([]);

  const addStagingToRoute = () => {
    if (stagingIds.length === 0) return;
    setStops((prev) => [...prev, ...stagingIds.map((id) => createStop(id))]);
    setStagingIds([]);
    setErrors((prev) => ({ ...prev, waypoints: undefined }));
  };

  const removeAt = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= stops.length) return;
    setStops((prev) => arrayMove(prev, index, next));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStops((prev) => {
      const oldIndex = prev.findIndex((s) => s.instanceId === active.id);
      const newIndex = prev.findIndex((s) => s.instanceId === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Le nom est requis.';
    if (stops.length < 2) {
      next.waypoints = 'Ajoutez au moins un départ et une arrivée.';
    }
    if (assignment.ids.length === 0) {
      next.assignment =
        assignment.mode === 'vehicle'
          ? 'Sélectionnez au moins un véhicule.'
          : 'Sélectionnez au moins un département.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      name: name.trim(),
      assignment,
      alertType,
      points: geometry.length >= 2 ? geometry : waypoints,
      waypoints,
      waypointLocationIds: locationIds,
      distanceMeters: metrics?.distanceMeters,
      durationSeconds: metrics?.durationSeconds,
    });
  };

  return (
    <div className="h-full w-[360px] flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/50 shadow-2xl">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Retour"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-sky-50 text-sky-600">
          <Route className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800 flex-1 truncate">
          Route par emplacements
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {locations.length < 2 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center space-y-2">
            <MapPinned className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-600">
              Créez au moins deux emplacements pour construire une route.
            </p>
            <Button type="button" size="sm" onClick={onRequestAddLocation}>
              Ajouter un emplacement
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="route-via-name">Nom de la route</Label>
              <Input
                id="route-via-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tunis → Sousse"
              />
              {errors.name && (
                <p className="text-xs text-rose-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Itinéraire (départ → étapes → arrivée)</Label>
              {stops.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">
                  Aucun point — sélectionnez des emplacements ci-dessous.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={stops.map((s) => s.instanceId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-1.5">
                      {stops.map((stop, index) => {
                        const loc = locById.get(stop.locationId);
                        const role =
                          index === 0
                            ? 'Départ'
                            : index === stops.length - 1
                              ? 'Arrivée'
                              : `Étape ${index}`;
                        return (
                          <SortableStopRow
                            key={stop.instanceId}
                            stop={stop}
                            index={index}
                            total={stops.length}
                            name={loc?.name ?? stop.locationId}
                            role={role}
                            onMove={move}
                            onRemove={removeAt}
                          />
                        );
                      })}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}

              <div className="space-y-2 rounded-lg border border-slate-200 p-2.5 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs text-slate-600">
                    Ajouter des emplacements
                  </Label>
                  {stagingIds.length > 0 && (
                    <Badge variant="info" className="text-[10px] h-5">
                      {stagingIds.length} sélectionné
                      {stagingIds.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un emplacement…"
                    className="pl-8 h-9 text-sm"
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllFiltered}
                    disabled={filteredLocations.length === 0}
                    className="text-[10px] text-blue-600 hover:underline disabled:text-slate-300 disabled:no-underline"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    type="button"
                    onClick={clearStaging}
                    disabled={stagingIds.length === 0}
                    className="text-[10px] text-slate-500 hover:underline disabled:text-slate-300 disabled:no-underline"
                  >
                    Effacer
                  </button>
                </div>

                <div className="max-h-36 overflow-y-auto rounded-md border border-slate-200 divide-y divide-slate-100">
                  {filteredLocations.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      Aucun emplacement trouvé
                    </p>
                  ) : (
                    filteredLocations.map((loc) => {
                      const checked = stagingIds.includes(loc.id);
                      return (
                        <label
                          key={loc.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleStaging(loc.id)}
                          />
                          <span className="truncate text-slate-800">
                            {loc.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full gap-1.5"
                  size="sm"
                  onClick={addStagingToRoute}
                  disabled={stagingIds.length === 0}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter à l&apos;itinéraire
                  {stagingIds.length > 0 ? ` (${stagingIds.length})` : ''}
                </Button>
                <p className="text-[10px] text-slate-400">
                  Glissez l&apos;icône ⋮⋮ pour réordonner. Doublons autorisés.
                </p>
              </div>

              {errors.waypoints && (
                <p className="text-xs text-rose-600">{errors.waypoints}</p>
              )}
            </div>

            {(metrics || routing) && (
              <p className="text-xs text-slate-500 bg-sky-50 rounded-lg px-3 py-2 border border-sky-100">
                {routing
                  ? 'Calcul du trajet…'
                  : `Estimation : ${formatRouteDistance(metrics?.distanceMeters)} · ${formatRouteDuration(metrics?.durationSeconds)}`}
              </p>
            )}

            <GeoAssignmentFields
              assignment={assignment}
              onAssignmentChange={setAssignment}
              alertType={alertType}
              onAlertTypeChange={setAlertType}
              vehicles={vehicles}
              assignmentError={errors.assignment}
            />
          </>
        )}
      </div>

      {locations.length >= 2 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSave}
            disabled={routing}
          >
            Enregistrer
          </Button>
        </div>
      )}
    </div>
  );
}
