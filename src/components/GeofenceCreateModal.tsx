import { useEffect, useRef, useState } from 'react';
import type { Vehicle } from '@/types';
import type { GeofenceDraft } from '@/types/map-overlays';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface GeofenceCreateModalProps {
  open: boolean;
  draft: GeofenceDraft | null;
  vehicles: Vehicle[];
  onDraftChange: (draft: GeofenceDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Floating panel (not a blocking dialog) so the user can re-click the map
 * to reposition the geofence while the form stays open. Header is draggable.
 */
export function GeofenceCreateModal({
  open,
  draft,
  vehicles,
  onDraftChange,
  onSave,
  onCancel,
}: GeofenceCreateModalProps) {
  const [errors, setErrors] = useState<{
    name?: string;
    vehicleId?: string;
    radiusKm?: string;
  }>({});
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    if (open) setOffset({ x: 0, y: 0 });
  }, [open]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setOffset({
        x: dragRef.current.originX + dx,
        y: dragRef.current.originY + dy,
      });
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (!open || !draft) return null;

  const update = <K extends keyof GeofenceDraft>(
    key: K,
    value: GeofenceDraft[K]
  ) => {
    onDraftChange({ ...draft, [key]: value });
  };

  const handleSave = () => {
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = 'Le nom est requis.';
    if (!draft.vehicleId) next.vehicleId = 'Sélectionnez un véhicule.';
    if (!draft.radiusKm || draft.radiusKm <= 0)
      next.radiusKm = 'Rayon invalide.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave();
  };

  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  return (
    <div
      className="absolute left-1/2 top-20 z-50 w-full max-w-md pointer-events-auto"
      style={{
        transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
      }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="geofence-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        <div
          className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground cursor-move select-none"
          onMouseDown={startDrag}
        >
          <h2
            id="geofence-modal-title"
            className="text-lg font-bold tracking-tight"
          >
            Ajouter un géopérage
          </h2>
          <button
            type="button"
            onClick={onCancel}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
          <p className="text-xs text-slate-500">
            Recliquez sur la carte pour repositionner le centre. Cliquez sur le
            cercle puis glissez vers l’extérieur ou le centre pour ajuster le
            rayon. Glissez la barre de titre pour déplacer cette fenêtre.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="gf-vehicle">Véhicule à sélectionner</Label>
            <select
              id="gf-vehicle"
              value={draft.vehicleId}
              onChange={(e) => update('vehicleId', e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm bg-white"
            >
              <option value="">— Choisir —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.driver})
                </option>
              ))}
            </select>
            {errors.vehicleId && (
              <p className="text-xs text-rose-600">{errors.vehicleId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gf-name">Nom de géopérage</Label>
            <Input
              id="gf-name"
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ex: Zone dépôt"
            />
            {errors.name && (
              <p className="text-xs text-rose-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gf-shape">Type de géopérage</Label>
            <select
              id="gf-shape"
              value={draft.shapeType}
              onChange={(e) =>
                update(
                  'shapeType',
                  e.target.value as GeofenceDraft['shapeType']
                )
              }
              className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm bg-white"
            >
              <option value="circulaire">Circulaire</option>
              <option value="rectangulaire">Rectangulaire</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gf-alert">Type d&apos;alerte</Label>
            <select
              id="gf-alert"
              value={draft.alertType}
              onChange={(e) =>
                update(
                  'alertType',
                  e.target.value as GeofenceDraft['alertType']
                )
              }
              className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm bg-white"
            >
              <option value="hors_zone">Hors zone</option>
              <option value="dans_zone">Dans zone</option>
              <option value="les_deux">Les deux</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gf-radius">Rayon (km)</Label>
            <Input
              id="gf-radius"
              type="number"
              min={0.1}
              step={0.1}
              value={draft.radiusKm}
              onChange={(e) =>
                update('radiusKm', parseFloat(e.target.value) || 0)
              }
            />
            {errors.radiusKm && (
              <p className="text-xs text-rose-600">{errors.radiusKm}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="gf-lat">Latitude</Label>
              <Input
                id="gf-lat"
                type="number"
                step="any"
                value={Number(draft.center[0].toFixed(6))}
                onChange={(e) =>
                  update('center', [
                    parseFloat(e.target.value) || 0,
                    draft.center[1],
                  ])
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gf-lng">Longitude</Label>
              <Input
                id="gf-lng"
                type="number"
                step="any"
                value={Number(draft.center[1].toFixed(6))}
                onChange={(e) =>
                  update('center', [
                    draft.center[0],
                    parseFloat(e.target.value) || 0,
                  ])
                }
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
