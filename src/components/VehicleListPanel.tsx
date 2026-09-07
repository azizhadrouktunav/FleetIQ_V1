import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  Route,
  StopCircle,
  FileText,
  Zap,
  Navigation,
  Power,
  Settings,
  Download,
  ChevronDown,
  Clock,
  Car,
  Calendar,
  Layers,
  AlertTriangle,
  Check,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import { Vehicle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DateTimePicker } from './DateTimePicker';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ACTIONS,
  SUIVIE_DEPARTMENTS,
  type SuivieAction,
} from '@/features/suivie/column-defs';
import {
  ALERT_TYPES,
  applySuivieFilters,
  buildRowsForAction,
  getFilteredVehicleIds,
  type AppliedSuivieFilters,
  type SuivieRow,
} from '@/features/suivie/mock-data';
import { useColumnPreferences } from '@/features/suivie/useColumnPreferences';

interface VehicleListPanelProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onFilteredVehicleIdsChange?: (ids: string[] | null) => void;
}

function SortableHeader({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      className="px-2 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-700 whitespace-nowrap select-none"
      {...attributes}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="p-0.5 rounded hover:bg-blue-500/50 cursor-grab active:cursor-grabbing touch-none"
          aria-label={`Réordonner ${label}`}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5 text-blue-100" />
        </button>
        <span>{label}</span>
      </div>
    </th>
  );
}

function cellClassFor(columnId: string, value: string): string {
  const base = 'px-3 py-2 text-xs text-slate-600';
  if (
    columnId === 'Type' ||
    (columnId === 'Status' && value === 'Échouée') ||
    value.includes('↓')
  ) {
    return `${base} text-rose-600 font-medium`;
  }
  if (
    columnId === 'Status' &&
    (value === 'Circulation' || value === 'Exécutée' || value === 'ON')
  ) {
    return `${base}`;
  }
  if (columnId === 'name' || columnId === 'Vehicle' || columnId === 'Matricule') {
    return 'px-3 py-2 text-xs font-medium text-slate-700';
  }
  return base;
}

function renderCellContent(
  columnId: string,
  value: string,
  row: SuivieRow
): React.ReactNode {
  if (columnId === 'horodatage') {
    const statusColor =
      String(value).includes('mn') && !String(value).includes('h')
        ? 'bg-emerald-500'
        : String(value).includes('j')
          ? 'bg-rose-500'
          : 'bg-amber-500';
    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-5 h-5 rounded-full ${statusColor} flex items-center justify-center`}
        >
          <Clock className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-medium text-slate-700">{value}</span>
      </div>
    );
  }

  if (columnId === 'Status' || columnId === 'StopRun') {
    const isGood =
      value === 'Circulation' || value === 'Exécutée' || value === 'ON';
    const isBad = value === 'Stop' || value === 'Échouée' || value === 'Expirée';
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          isGood
            ? 'bg-emerald-100 text-emerald-700'
            : isBad
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-700'
        }`}
      >
        {value}
      </span>
    );
  }

  if (columnId === 'speed' || columnId === 'Speed') {
    const high = parseInt(value, 10) > 90;
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          high ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {value}
      </span>
    );
  }

  if (columnId === 'AlertIcon') {
    return value === '⚠' ? (
      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
    ) : (
      <span className="text-slate-400">—</span>
    );
  }

  if (columnId === 'Action') {
    return (
      <button
        type="button"
        className="text-[11px] font-medium text-blue-600 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value || 'Carte'}
      </button>
    );
  }

  void row;
  return value || '—';
}

export function VehicleListPanel({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  isCollapsed = false,
  onToggleCollapse,
  onFilteredVehicleIdsChange,
}: VehicleListPanelProps) {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined'
      ? Math.min(800, Math.round(window.innerWidth * 0.9))
      : 800
  );
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [isResizing, setIsResizing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(
    new Set()
  );

  // Draft filter state
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const [draftAction, setDraftAction] =
    useState<SuivieAction>('suivie_generale');
  const [draftVehicles, setDraftVehicles] = useState<Set<string>>(new Set());
  const [draftDepartments, setDraftDepartments] = useState<Set<string>>(
    new Set()
  );
  const [draftAlertTypes, setDraftAlertTypes] = useState<Set<string>>(
    new Set()
  );

  // Applied filter state
  const [applied, setApplied] = useState<AppliedSuivieFilters | null>(null);

  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [vehicleTab, setVehicleTab] = useState<'vehicles' | 'departments'>(
    'vehicles'
  );
  const [vehicleSearch, setVehicleSearch] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const alertDropdownRef = useRef<HTMLDivElement>(null);
  const columnSettingsRef = useRef<HTMLDivElement>(null);

  const activeAction: SuivieAction = applied?.action ?? draftAction;
  const {
    visibleColumns,
    allColumns,
    prefs,
    toggleVisible,
    reorder,
    resetToDefault,
  } = useColumnPreferences(activeAction);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const formatDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${y}/${m}/${d} ${h}:${min}:${s}`;
    };
    const startStr = formatDate(start);
    const endStr = formatDate(now);
    setDraftStartDate(startStr);
    setDraftEndDate(endStr);
    setApplied({
      action: 'suivie_generale',
      vehicleIds: new Set(),
      departments: new Set(),
      startDate: startStr,
      endDate: endStr,
      alertTypes: new Set(),
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 600 && newWidth <= 1200) setWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && !(e.target as Element).closest('.action-menu')) {
        setOpenMenuId(null);
      }
      if (
        vehicleDropdownRef.current &&
        !vehicleDropdownRef.current.contains(e.target as Node)
      ) {
        setIsVehicleDropdownOpen(false);
      }
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(e.target as Node)
      ) {
        setIsActionDropdownOpen(false);
      }
      if (
        alertDropdownRef.current &&
        !alertDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAlertDropdownOpen(false);
      }
      if (
        columnSettingsRef.current &&
        !columnSettingsRef.current.contains(e.target as Node)
      ) {
        setIsColumnSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const tableRows = useMemo(() => {
    if (!applied) return [] as SuivieRow[];
    const all = buildRowsForAction(applied.action, vehicles);
    return applySuivieFilters(all, applied);
  }, [applied, vehicles]);

  useEffect(() => {
    if (!onFilteredVehicleIdsChange || !applied) return;
    const hasScope =
      applied.vehicleIds.size > 0 || applied.departments.size > 0;
    if (!hasScope) {
      onFilteredVehicleIdsChange(null);
      return;
    }
    onFilteredVehicleIdsChange(getFilteredVehicleIds(tableRows));
  }, [applied, tableRows, onFilteredVehicleIdsChange]);

  const rowsByDepartment = useMemo(() => {
    if (activeAction !== 'suivie_generale') return null;
    const grouped: Record<string, SuivieRow[]> = {};
    for (const dept of SUIVIE_DEPARTMENTS) grouped[dept] = [];
    for (const row of tableRows) {
      if (!grouped[row.department]) grouped[row.department] = [];
      grouped[row.department].push(row);
    }
    return Object.fromEntries(
      Object.entries(grouped).filter(([, rows]) => rows.length > 0)
    );
  }, [activeAction, tableRows]);

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v])),
    [vehicles]
  );

  const filteredVehiclesList = vehicles.filter(
    (v) =>
      v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.id.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const applyFilters = useCallback(() => {
    setApplied({
      action: draftAction,
      vehicleIds: new Set(draftVehicles),
      departments: new Set(draftDepartments),
      startDate: draftStartDate,
      endDate: draftEndDate,
      alertTypes: new Set(draftAlertTypes),
    });
  }, [
    draftAction,
    draftVehicles,
    draftDepartments,
    draftStartDate,
    draftEndDate,
    draftAlertTypes,
  ]);

  const toggleVehicle = (id: string) => {
    setDraftVehicles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDepartment = (dept: string) => {
    setDraftDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  const toggleAlertType = (type: string) => {
    setDraftAlertTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const getVehicleButtonText = () => {
    const vCount = draftVehicles.size;
    const dCount = draftDepartments.size;
    if (vCount === 0 && dCount === 0) return 'Sélectionner véhicules';
    const parts: string[] = [];
    if (vCount > 0) parts.push(`${vCount} véh.`);
    if (dCount > 0) parts.push(`${dCount} dép.`);
    return parts.join(', ');
  };

  const toggleDepartmentCollapse = (dept: string) => {
    setCollapsedDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  const menuItems = [
    { icon: MapPin, label: 'Afficher sur la carte' },
    { icon: Route, label: 'Afficher trajectoire' },
    { icon: StopCircle, label: 'Afficher Stop/Circulation' },
    { icon: FileText, label: 'Afficher le rapport détaillé' },
    { icon: Zap, label: 'Afficher les excès de vitesse' },
    { icon: Navigation, label: 'Demande position actuelle' },
    { icon: Power, label: 'Arrêt à distance(AAD)' },
    { icon: Settings, label: 'Paramétrage des alertes' },
  ];

  const handleMenuAction = (action: string, vehicleId: string) => {
    const vehicle = vehicleById[vehicleId];
    if (action === 'Afficher sur la carte' && vehicle) {
      onSelectVehicle(vehicle);
    }
    setOpenMenuId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorder(String(active.id), String(over.id));
  };

  const colCount =
    visibleColumns.length + (activeAction === 'suivie_generale' ? 1 : 0);

  const selectRowVehicle = (row: SuivieRow) => {
    const vehicle = vehicleById[row.vehicleId];
    if (vehicle) onSelectVehicle(vehicle);
  };

  const renderDataRow = (row: SuivieRow) => {
    const isGenerale = activeAction === 'suivie_generale';
    const commonClasses = `transition-colors border-b border-slate-100 ${
      selectedVehicleId === row.vehicleId
        ? 'bg-blue-50'
        : 'bg-white hover:bg-slate-50'
    }${isGenerale ? ' action-menu' : ''}`;

    const actionMenu =
      isGenerale && openMenuId === row.id ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 top-full mt-0.5 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleMenuAction(item.label, row.vehicleId)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group"
              >
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                <span className="text-sm text-slate-700 group-hover:text-slate-900">
                  {item.label}
                </span>
              </button>
            );
          })}
        </motion.div>
      ) : null;

    return (
      <tr
        key={row.id}
        className={commonClasses}
        onClick={() => {
          if (isGenerale) {
            setOpenMenuId(openMenuId === row.id ? null : row.id);
          } else {
            selectRowVehicle(row);
          }
        }}
      >
        {visibleColumns.map((col, colIndex) => {
          const raw = row[col.id];
          const value =
            raw === undefined || raw === null ? '—' : String(raw);
          return (
            <td
              key={col.id}
              className={`${cellClassFor(col.id, value)}${
                colIndex === 0 ? ' relative' : ''
              }`}
            >
              {colIndex === 0 && actionMenu}
              {renderCellContent(col.id, value, row)}
            </td>
          );
        })}
        {isGenerale && (
          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() =>
                setOpenMenuId(openMenuId === row.id ? null : row.id)
              }
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-600" />
            </button>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: isCollapsed ? '0px' : isDesktop ? `${width}px` : '100%',
      }}
      className="h-full flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/50 flex-shrink-0 relative transition-all duration-300 shadow-2xl min-w-0 w-full max-w-full"
    >
      {onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-6 h-12 bg-white/95 backdrop-blur-sm hover:bg-white border border-slate-200 rounded-r-lg flex items-center justify-center transition-colors shadow-lg"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          )}
        </button>
      )}

      {!isCollapsed && (
        <>
          <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50 overflow-visible relative z-20">
            <div className="px-3 py-2 flex flex-col gap-2 overflow-visible">
              {/* Filters */}
              <div className="w-full min-w-0 flex flex-col gap-2">
                <div
                  className="relative w-full min-w-0"
                  ref={vehicleDropdownRef}
                >
                  <label className="text-xs font-semibold text-slate-700 mb-1 block flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    Véhicules / Départements
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setIsVehicleDropdownOpen(!isVehicleDropdownOpen)
                    }
                    className="w-full h-8 flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-3 text-xs transition-all shadow-sm"
                  >
                    <span
                      className={`truncate ${
                        draftVehicles.size > 0 || draftDepartments.size > 0
                          ? 'text-slate-900 font-medium'
                          : 'text-slate-500'
                      }`}
                    >
                      {getVehicleButtonText()}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
                        isVehicleDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isVehicleDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[400px] w-full max-w-[min(320px,calc(100vw-2rem))]"
                      >
                        <div className="flex border-b border-slate-100">
                          <button
                            type="button"
                            onClick={() => setVehicleTab('vehicles')}
                            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
                              vehicleTab === 'vehicles'
                                ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Véhicules ({draftVehicles.size})
                          </button>
                          <button
                            type="button"
                            onClick={() => setVehicleTab('departments')}
                            className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
                              vehicleTab === 'departments'
                                ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Départements ({draftDepartments.size})
                          </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                          {vehicleTab === 'vehicles' ? (
                            <>
                              <div className="p-2 border-b border-slate-100">
                                <div className="relative">
                                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={vehicleSearch}
                                    onChange={(e) =>
                                      setVehicleSearch(e.target.value)
                                    }
                                    className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 px-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDraftVehicles(
                                        new Set(vehicles.map((v) => v.id))
                                      )
                                    }
                                    className="text-[9px] text-blue-600 hover:underline font-medium"
                                  >
                                    Tout
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDraftVehicles(new Set())}
                                    className="text-[9px] text-slate-500 hover:underline"
                                  >
                                    Rien
                                  </button>
                                </div>
                              </div>
                              <div className="overflow-y-auto flex-1 p-1">
                                {filteredVehiclesList.map((vehicle) => (
                                  <label
                                    key={vehicle.id}
                                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                                  >
                                    <div
                                      className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                                        draftVehicles.has(vehicle.id)
                                          ? 'bg-blue-600 border-blue-600'
                                          : 'border-slate-300 bg-white group-hover:border-blue-400'
                                      }`}
                                    >
                                      {draftVehicles.has(vehicle.id) && (
                                        <Check className="w-2 h-2 text-white" />
                                      )}
                                    </div>
                                    <input
                                      type="checkbox"
                                      className="sr-only"
                                      checked={draftVehicles.has(vehicle.id)}
                                      onChange={() => toggleVehicle(vehicle.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-slate-700 truncate">
                                        {vehicle.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 truncate">
                                        {vehicle.driver}
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="flex-1 overflow-y-auto p-1">
                              <div className="flex items-center justify-between mb-1.5 px-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraftDepartments(
                                      new Set([...SUIVIE_DEPARTMENTS])
                                    )
                                  }
                                  className="text-[9px] text-blue-600 hover:underline font-medium"
                                >
                                  Tout
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDraftDepartments(new Set())
                                  }
                                  className="text-[9px] text-slate-500 hover:underline"
                                >
                                  Rien
                                </button>
                              </div>
                              {SUIVIE_DEPARTMENTS.map((dept) => (
                                <label
                                  key={dept}
                                  className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                                >
                                  <div
                                    className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                                      draftDepartments.has(dept)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-slate-300 bg-white group-hover:border-blue-400'
                                    }`}
                                  >
                                    {draftDepartments.has(dept) && (
                                      <Check className="w-2 h-2 text-white" />
                                    )}
                                  </div>
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={draftDepartments.has(dept)}
                                    onChange={() => toggleDepartment(dept)}
                                  />
                                  <span className="text-xs font-medium text-slate-700">
                                    {dept}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {draftAction !== 'suivie_generale' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <label className="text-xs font-semibold text-slate-700 mb-1 block flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Date début
                      </label>
                      <DateTimePicker
                        value={draftStartDate}
                        onChange={setDraftStartDate}
                        placeholder="Début"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="text-xs font-semibold text-slate-700 mb-1 block flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        Date fin
                      </label>
                      <DateTimePicker
                        value={draftEndDate}
                        onChange={setDraftEndDate}
                        placeholder="Fin"
                      />
                    </div>
                  </div>
                )}

                <div
                  className={
                    draftAction === 'alertes'
                      ? 'grid grid-cols-2 gap-2'
                      : 'w-full min-w-0'
                  }
                >
                <div
                  className="relative min-w-0"
                  ref={actionDropdownRef}
                >
                  <label className="text-xs font-semibold text-slate-700 mb-1 block flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Action
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setIsActionDropdownOpen(!isActionDropdownOpen)
                    }
                    className="w-full h-8 flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-3 text-xs transition-all shadow-sm"
                  >
                    <span className="text-slate-900 font-medium truncate">
                      {ACTIONS.find((a) => a.id === draftAction)?.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
                        isActionDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isActionDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden"
                      >
                        <div className="p-1">
                          {ACTIONS.map((action) => (
                            <button
                              key={action.id}
                              type="button"
                              onClick={() => {
                                setDraftAction(action.id);
                                setApplied((prev) =>
                                  prev
                                    ? { ...prev, action: action.id }
                                    : {
                                        action: action.id,
                                        vehicleIds: new Set(draftVehicles),
                                        departments: new Set(draftDepartments),
                                        startDate: draftStartDate,
                                        endDate: draftEndDate,
                                        alertTypes: new Set(draftAlertTypes),
                                      }
                                );
                                setIsActionDropdownOpen(false);
                                setIsColumnSettingsOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                draftAction === action.id
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {draftAction === 'alertes' && (
                  <div
                    className="relative min-w-0"
                    ref={alertDropdownRef}
                  >
                    <label className="text-xs font-semibold text-slate-700 mb-1 block flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Types d'alerte
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setIsAlertDropdownOpen(!isAlertDropdownOpen)
                      }
                      className="w-full h-8 flex items-center justify-between bg-white border border-slate-200 hover:border-blue-400 rounded-lg px-3 text-xs transition-all shadow-sm"
                    >
                      <span className="truncate text-slate-700 font-medium">
                        {draftAlertTypes.size === 0
                          ? 'Tous les types'
                          : `${draftAlertTypes.size} type(s) sélectionné(s)`}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
                          isAlertDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isAlertDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden w-full min-w-[220px] max-h-[280px] flex flex-col"
                        >
                          <div className="p-1.5 border-b border-slate-100 flex justify-between">
                            <button
                              type="button"
                              onClick={() =>
                                setDraftAlertTypes(new Set([...ALERT_TYPES]))
                              }
                              className="text-[9px] text-blue-600 hover:underline font-medium"
                            >
                              Tout
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraftAlertTypes(new Set())}
                              className="text-[9px] text-slate-500 hover:underline"
                            >
                              Rien
                            </button>
                          </div>
                          <div className="overflow-y-auto p-1">
                            {ALERT_TYPES.map((type) => (
                              <label
                                key={type}
                                className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-slate-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={draftAlertTypes.has(type)}
                                  onChange={() => toggleAlertType(type)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3"
                                />
                                <span className="text-[11px] text-slate-700">
                                  {type}
                                </span>
                              </label>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                </div>
              </div>

              {/* Actions cluster */}
              <div className="w-full flex items-center gap-1.5">
                <div className="relative shrink-0" ref={columnSettingsRef}>
                  <button
                    type="button"
                    onClick={() =>
                      setIsColumnSettingsOpen(!isColumnSettingsOpen)
                    }
                    title="Paramétrer les colonnes"
                    className="flex items-center justify-center w-8 h-8 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-all shadow-sm"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {isColumnSettingsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full mt-2 left-0 w-72 max-h-80 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] flex flex-col overflow-hidden"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">
                            Colonnes affichées
                          </span>
                          <button
                            type="button"
                            onClick={resetToDefault}
                            className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-medium"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Réinitialiser
                          </button>
                        </div>
                        <div className="overflow-y-auto p-1.5 flex-1">
                          {allColumns.map((col) => {
                            const checked = !!prefs.visible[col.id];
                            const visibleCount = Object.values(
                              prefs.visible
                            ).filter(Boolean).length;
                            const disableOff = checked && visibleCount <= 1;
                            return (
                              <label
                                key={col.id}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 ${
                                  disableOff ? 'opacity-60' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={disableOff}
                                  onChange={() => toggleVisible(col.id)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                                />
                                <span className="text-xs text-slate-700">
                                  {col.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className="flex-1 h-8 flex items-center justify-center gap-1.5 px-2.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  className="flex-1 h-8 flex items-center justify-center gap-1.5 px-2.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-1 h-8 px-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 font-semibold text-xs"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Appliquer
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto bg-white min-w-0">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-600 sticky top-0 z-10">
                <tr>
                  <SortableContext
                    items={visibleColumns.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {visibleColumns.map((col) => (
                      <SortableHeader
                        key={col.id}
                        id={col.id}
                        label={col.label}
                      />
                    ))}
                  </SortableContext>
                  {activeAction === 'suivie_generale' && (
                    <th className="px-3 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-700 whitespace-nowrap">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Math.max(colCount, 1)}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Aucun résultat pour ces filtres. Modifiez la sélection
                      puis cliquez sur Appliquer.
                    </td>
                  </tr>
                ) : activeAction === 'suivie_generale' && rowsByDepartment ? (
                  Object.entries(rowsByDepartment).map(([dept, rows]) => {
                    const isCollapsedDept = collapsedDepartments.has(dept);
                    return (
                      <Fragment key={dept}>
                        <tr className="bg-blue-100">
                          <td colSpan={colCount} className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleDepartmentCollapse(dept)}
                              className="w-full flex items-center justify-between hover:bg-blue-150 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {isCollapsedDept ? (
                                  <ChevronRight className="w-4 h-4 text-blue-700" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-blue-700" />
                                )}
                                <span className="text-sm font-semibold text-blue-700">
                                  Département: {dept} ({rows.length})
                                </span>
                              </div>
                            </button>
                          </td>
                        </tr>
                        {!isCollapsedDept &&
                          rows.map((row) => renderDataRow(row))}
                      </Fragment>
                    );
                  })
                ) : (
                  tableRows.map((row) => renderDataRow(row))
                )}
              </tbody>
            </table>
            </DndContext>
          </div>

          <div
            onMouseDown={() => setIsResizing(true)}
            className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors group"
          >
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-12 bg-slate-300 group-hover:bg-blue-500 transition-colors rounded-l" />
          </div>
        </>
      )}
    </div>
  );
}
