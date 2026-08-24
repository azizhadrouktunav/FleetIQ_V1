import { useEffect, useRef, useState, type ComponentType } from 'react';
import {
  Eye,
  Layers,
  Trash2,
  Route,
  Check,
  SlidersHorizontal,
  CircleDot,
  MapPinned,
  Pentagon,
  PanelRightClose,
} from 'lucide-react';
import type { BasemapType, DrawMode, MapOverlay } from '../types/map-overlays';
import { BASEMAP_TILES } from '../types/map-overlays';

type OpenMenu = 'geo' | 'visibility' | 'layers' | 'delete' | null;

const toolbarBtn =
  'h-10 w-10 inline-flex items-center justify-center rounded-xl border transition-colors';
const toolbarIdle =
  'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
const toolbarActive = 'border-blue-200 bg-blue-50 text-blue-700';
const toolbarTrashActive = 'border-rose-200 bg-rose-50 text-rose-700';

function MenuRow({
  icon: Icon,
  chip,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  chip: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
    >
      <span
        className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${chip}`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </button>
  );
}

interface MapControlsProps {
  basemap: BasemapType;
  onBasemapChange: (b: BasemapType) => void;
  clusterVehicles: boolean;
  onClusterVehiclesChange: (v: boolean) => void;
  clusterLocations: boolean;
  onClusterLocationsChange: (v: boolean) => void;
  drawMode: DrawMode;
  onStartDraw: (mode: Exclude<DrawMode, null>) => void;
  onOpenManage: (kind: 'location' | 'route' | 'polygon' | 'geofence') => void;
  overlays: MapOverlay[];
  onRemoveOverlays: (ids: string[]) => void;
  onRemoveAllOverlays: () => void;
  pendingPointsCount: number;
  onFinishDraw: () => void;
  onCancelDraw: () => void;
}

export function MapControls({
  basemap,
  onBasemapChange,
  clusterVehicles,
  onClusterVehiclesChange,
  clusterLocations,
  onClusterLocationsChange,
  drawMode,
  onStartDraw,
  onOpenManage,
  overlays,
  onRemoveOverlays,
  onRemoveAllOverlays,
  pendingPointsCount,
  onFinishDraw,
  onCancelDraw,
}: MapControlsProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<Set<string>>(
    new Set()
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (openMenu) {
        setOpenMenu(null);
        return;
      }
      if (drawMode) onCancelDraw();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [drawMode, onCancelDraw, openMenu]);

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const startAndClose = (mode: Exclude<DrawMode, null>) => {
    onStartDraw(mode);
    setOpenMenu(null);
  };

  const toggleDeleteId = (id: string) => {
    setSelectedDeleteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canFinishRoute = drawMode === 'route' && pendingPointsCount >= 2;
  const canFinishPolygon = drawMode === 'polygon' && pendingPointsCount >= 3;

  return (
    <div
      ref={toolbarRef}
      className="absolute top-4 right-4 z-40 flex flex-col items-end gap-2"
    >
      {drawMode && (
        <div className="bg-slate-900/90 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-lg max-w-xs flex items-center gap-2">
          <span className="flex-1">
            {drawMode === 'geofence' &&
              'Cliquez pour placer · glissez le cercle pour ajuster le rayon'}
            {drawMode === 'location' &&
              'Cliquez sur la carte pour ajouter un emplacement'}
            {drawMode === 'route' &&
              `Itinéraire : ${pendingPointsCount} point(s) — min. 2`}
            {drawMode === 'polygon' &&
              `Polygone : ${pendingPointsCount} point(s) — min. 3`}
          </span>
          {(canFinishRoute || canFinishPolygon) && (
            <button
              type="button"
              onClick={onFinishDraw}
              className="px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
            >
              Terminer
            </button>
          )}
          <button
            type="button"
            onClick={onCancelDraw}
            className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs"
          >
            Annuler
          </button>
        </div>
      )}

      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`${toolbarBtn} ${toolbarIdle} bg-white/95 backdrop-blur-xl shadow-lg`}
          title="Afficher les contrôles carte"
          aria-label="Afficher les contrôles carte"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-1 bg-white/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-slate-200">
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('geo')}
              className={`${toolbarBtn} ${
                openMenu === 'geo' || drawMode ? toolbarActive : toolbarIdle
              }`}
              title="Opération Géographique"
              aria-label="Opération Géographique"
              aria-expanded={openMenu === 'geo'}
            >
              <CircleDot className="w-5 h-5" />
            </button>

            {openMenu === 'geo' && (
              <div className="absolute right-full top-0 mr-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Opérations géographiques
                  </h3>
                </div>
                <div className="p-2">
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Créer
                  </p>
                  <MenuRow
                    icon={CircleDot}
                    chip="bg-blue-50 text-blue-600"
                    label="Ajouter géopérage"
                    onClick={() => startAndClose('geofence')}
                  />
                  <MenuRow
                    icon={Route}
                    chip="bg-sky-50 text-sky-600"
                    label="Ajouter un itinéraire"
                    onClick={() => startAndClose('route')}
                  />
                  <MenuRow
                    icon={MapPinned}
                    chip="bg-emerald-50 text-emerald-600"
                    label="Ajouter emplacement"
                    onClick={() => startAndClose('location')}
                  />
                  <MenuRow
                    icon={Pentagon}
                    chip="bg-violet-50 text-violet-600"
                    label="Ajouter polygone"
                    onClick={() => startAndClose('polygon')}
                  />

                  <div className="my-2 border-t border-slate-100" />
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Gérer
                  </p>
                  <MenuRow
                    icon={CircleDot}
                    chip="bg-blue-50 text-blue-600"
                    label="Gestion géopérage"
                    onClick={() => {
                      onOpenManage('geofence');
                      setOpenMenu(null);
                    }}
                  />
                  <MenuRow
                    icon={MapPinned}
                    chip="bg-emerald-50 text-emerald-600"
                    label="Gestion des emplacements"
                    onClick={() => {
                      onOpenManage('location');
                      setOpenMenu(null);
                    }}
                  />
                  <MenuRow
                    icon={Pentagon}
                    chip="bg-violet-50 text-violet-600"
                    label="Gestion des polygones"
                    onClick={() => {
                      onOpenManage('polygon');
                      setOpenMenu(null);
                    }}
                  />
                  <MenuRow
                    icon={Route}
                    chip="bg-sky-50 text-sky-600"
                    label="Gestion des routes"
                    onClick={() => {
                      onOpenManage('route');
                      setOpenMenu(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('visibility')}
              className={`${toolbarBtn} ${
                openMenu === 'visibility' ? toolbarActive : toolbarIdle
              }`}
              title="Visibilité"
              aria-label="Visibilité"
              aria-expanded={openMenu === 'visibility'}
            >
              <Eye className="w-5 h-5" />
            </button>

            {openMenu === 'visibility' && (
              <div className="absolute right-full top-0 mr-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Visibilité
                  </h3>
                </div>
                <div className="p-2">
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clusterVehicles}
                      onChange={(e) =>
                        onClusterVehiclesChange(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      Regrouper les véhicules en secteurs
                    </span>
                  </label>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clusterLocations}
                      onChange={(e) =>
                        onClusterLocationsChange(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      Regrouper les emplacements en secteurs
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('layers')}
              className={`${toolbarBtn} ${
                openMenu === 'layers' ? toolbarActive : toolbarIdle
              }`}
              title="Map Layer"
              aria-label="Map Layer"
              aria-expanded={openMenu === 'layers'}
            >
              <Layers className="w-5 h-5" />
            </button>

            {openMenu === 'layers' && (
              <div className="absolute right-full top-0 mr-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Vue de la carte
                  </h3>
                </div>
                <div className="p-2">
                  {(Object.keys(BASEMAP_TILES) as BasemapType[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onBasemapChange(key);
                        setOpenMenu(null);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        basemap === key
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {BASEMAP_TILES[key].label}
                      </span>
                      {basemap === key && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                toggleMenu('delete');
                setSelectedDeleteIds(new Set());
              }}
              className={`${toolbarBtn} ${
                openMenu === 'delete'
                  ? toolbarTrashActive
                  : `${toolbarIdle} hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200`
              }`}
              title="Supprimer des couches de la carte"
              aria-label="Supprimer des couches de la carte"
              aria-expanded={openMenu === 'delete'}
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {openMenu === 'delete' && (
              <div className="absolute right-full top-0 mr-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Supprimer des couches
                  </h3>
                </div>
                {overlays.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 text-center">
                    Aucune couche à supprimer
                  </div>
                ) : (
                  <>
                    <div className="p-2 max-h-48 overflow-y-auto">
                      {overlays.map((o) => (
                        <label
                          key={o.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDeleteIds.has(o.id)}
                            onChange={() => toggleDeleteId(o.id)}
                            className="w-4 h-4 text-rose-600 border-slate-300 rounded"
                          />
                          <span className="text-sm text-slate-800 truncate flex-1">
                            {o.name}
                          </span>
                          <span className="text-[10px] uppercase text-slate-400 font-medium">
                            {o.kind === 'geofence'
                              ? 'Géopérage'
                              : o.kind === 'location'
                                ? 'Emplacement'
                                : o.kind === 'route'
                                  ? 'Route'
                                  : 'Polygone'}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 flex gap-2">
                      <button
                        type="button"
                        disabled={selectedDeleteIds.size === 0}
                        onClick={() => {
                          onRemoveOverlays([...selectedDeleteIds]);
                          setSelectedDeleteIds(new Set());
                          setOpenMenu(null);
                        }}
                        className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Supprimer la sélection
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRemoveAllOverlays();
                          setSelectedDeleteIds(new Set());
                          setOpenMenu(null);
                        }}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Tout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpenMenu(null);
              setIsCollapsed(true);
            }}
            className={`${toolbarBtn} ${toolbarIdle}`}
            title="Masquer les contrôles carte"
            aria-label="Masquer les contrôles carte"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
