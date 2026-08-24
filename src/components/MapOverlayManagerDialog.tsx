import { useEffect, useState } from 'react';
import type {
  GeofenceOverlay,
  LocationOverlay,
  PolygonOverlay,
  RouteOverlay,
  LatLng,
} from '@/types/map-overlays';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  CircleDot,
  Eye,
  LocateFixed,
  MapPinned,
  Pentagon,
  Route,
  Trash2,
} from 'lucide-react';
import type { ComponentType } from 'react';

type ManageKind = 'location' | 'route' | 'polygon' | 'geofence';

const TITLES: Record<ManageKind, string> = {
  location: 'Gestion des emplacements',
  route: 'Gestion des routes',
  polygon: 'Gestion des polygones',
  geofence: 'Gestion géopérage',
};

const KIND_VISUAL: Record<
  ManageKind,
  { icon: ComponentType<{ className?: string }>; chip: string }
> = {
  geofence: { icon: CircleDot, chip: 'bg-blue-50 text-blue-600' },
  location: { icon: MapPinned, chip: 'bg-emerald-50 text-emerald-600' },
  polygon: { icon: Pentagon, chip: 'bg-violet-50 text-violet-600' },
  route: { icon: Route, chip: 'bg-sky-50 text-sky-600' },
};

interface MapOverlayManagePanelProps {
  kind: ManageKind;
  locations: LocationOverlay[];
  routes: RouteOverlay[];
  polygons: PolygonOverlay[];
  geofences: GeofenceOverlay[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onFlyTo: (center: LatLng) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
}

export function MapOverlayManagePanel({
  kind,
  locations,
  routes,
  polygons,
  geofences,
  onBack,
  onDelete,
  onFlyTo,
  onToggleVisible,
}: MapOverlayManagePanelProps) {
  const items =
    kind === 'location'
      ? locations
      : kind === 'route'
        ? routes
        : kind === 'geofence'
          ? geofences
          : polygons;

  const getCenter = (
    item: LocationOverlay | RouteOverlay | PolygonOverlay | GeofenceOverlay
  ): LatLng => {
    if (item.kind === 'location') return item.position;
    if (item.kind === 'geofence') return item.center;
    return item.points[0] ?? [48.8566, 2.3522];
  };

  const KindIcon = KIND_VISUAL[kind].icon;

  return (
    <div className="h-full w-[360px] flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/50 shadow-2xl">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Retour à la liste des véhicules"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span
          className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${KIND_VISUAL[kind].chip}`}
        >
          <KindIcon className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800 flex-1 truncate">
          {TITLES[kind]}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">
            Aucun élément enregistré.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 px-2 py-2 rounded-xl border border-slate-100 bg-slate-50/50"
              >
                <span
                  className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${KIND_VISUAL[kind].chip}`}
                >
                  <KindIcon className="w-4 h-4" />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-800 truncate min-w-0">
                  {item.name}
                </span>
                <button
                  type="button"
                  title={item.visible ? 'Masquer' : 'Afficher'}
                  aria-label={item.visible ? 'Masquer' : 'Afficher'}
                  onClick={() => onToggleVisible(item.id, !item.visible)}
                  className={`p-1.5 rounded-md transition-colors ${
                    item.visible
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Centrer sur la carte"
                  aria-label="Centrer sur la carte"
                  onClick={() => onFlyTo(getCenter(item))}
                  className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-slate-800"
                >
                  <LocateFixed className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Supprimer"
                  aria-label="Supprimer"
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBack}
        >
          Retour aux véhicules
        </Button>
      </div>
    </div>
  );
}

interface NameOverlayModalProps {
  open: boolean;
  kind: 'location' | 'route' | 'polygon' | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

const NAME_TITLES = {
  location: 'Nom de l’emplacement',
  route: 'Nom de l’itinéraire',
  polygon: 'Nom du polygone',
};

export function NameOverlayModal({
  open,
  kind,
  onSave,
  onCancel,
}: NameOverlayModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setError('');
    }
  }, [open, kind]);

  if (!kind) return null;

  const handleSave = () => {
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    onSave(name.trim());
    setName('');
    setError('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setName('');
          setError('');
          onCancel();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{NAME_TITLES[kind]}</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="Saisir un nom…"
            className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
        <DialogFooter className="px-6 py-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSave}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
