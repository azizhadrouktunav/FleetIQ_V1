import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import { Vehicle, type VehicleStatus } from '../types';
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
import {
  nextSortState,
  sortSuivieRows,
  type ColumnSortState,
  type SortDir,
} from '@/features/suivie/sort-rows';

interface VehicleListPanelProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onFilteredVehicleIdsChange?: (ids: string[] | null) => void;
  statusFilter?: Set<VehicleStatus>;
}

const EMPTY_STATUS_FILTER = new Set<VehicleStatus>();

function SortableHeader({
  id,
  label,
  sortDir,
  onSortClick,
}: {
  id: string;
  label: string;
  sortDir: SortDir | null;
  onSortClick: (columnId: string) => void;
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

  const ariaSort =
    sortDir === 'asc'
      ? 'ascending'
      : sortDir === 'desc'
        ? 'descending'
        : 'none';

  const SortIcon =
    sortDir === 'asc' ? ArrowUp : sortDir === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <th
      ref={setNodeRef}
      style={style}
      aria-sort={ariaSort}
      className="px-2 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-700 whitespace-nowrap select-none"
      {...attributes}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="p-0.5 rounded hover:bg-blue-500/50 cursor-grab active:cursor-grabbing touch-none shrink-0"
          aria-label={`Réordonner ${label}`}
          {...listeners}
        >
          <GripVertical className="w-3.5 h-3.5 text-blue-100" />
        </button>
        <button
          type="button"
          onClick={() => onSortClick(id)}
          className={`flex items-center gap-1 min-w-0 rounded px-1 py-0.5 cursor-pointer hover:bg-blue-500/40 transition-colors ${
            sortDir ? 'bg-blue-500/30' : ''
          }`}
          title={`Trier par ${label}`}
        >
          <span className="truncate">{label}</span>
          <SortIcon
            className={`w-3.5 h-3.5 shrink-0 ${
              sortDir ? 'text-white' : 'text-blue-200/80'
            }`}
          />
        </button>
      </div>
    </th>
  );
}

function FilterBulkActions({
  onSelectAll,
  onClear,
}: {
  onSelectAll: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onSelectAll}
        className="px-2 py-1 rounded-md text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors"
      >
        Tout sélectionner
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 hover:border-slate-400 transition-colors"
      >
        Tout désélectionner
      </button>
    </div>
  );
}

type OpenActionMenu = {
  rowId: string;
  vehicleId: string;
  x: number;
  y: number;
} | null;

function clampMenuPosition(
  x: number,
  y: number,
  menuWidth = 256,
  menuHeight = 320
) {
  const pad = 8;
  const maxX = window.innerWidth - menuWidth - pad;
  const maxY = window.innerHeight - menuHeight - pad;
  return {
    x: Math.max(pad, Math.min(x, maxX)),
    y: Math.max(pad, Math.min(y, maxY)),
  };
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
  statusFilter = EMPTY_STATUS_FILTER,
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
  const [openMenu, setOpenMenu] = useState<OpenActionMenu>(null);
  const [sort, setSort] = useState<ColumnSortState | null>(null);
  const [groupByDepartment, setGroupByDepartment] = useState(true);
  const [visibleDepartments, setVisibleDepartments] = useState<Set<string>>(
    () => new Set(SUIVIE_DEPARTMENTS)
  );
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(
    new Set()
  );

  // Draft filter state
  const [draftStartDate, setDraftStartDate] = useState('');
  const [draftEndDate, setDraftEndDate] = useState('');
  const [draftAction, setDraftAction] =
    useState<SuivieAction>('suivie_generale');
  const [draftVehicles, setDraftVehicles] = useState<Set<string>>(new Set());
  const [draftAlertTypes, setDraftAlertTypes] = useState<Set<string>>(
    new Set()
  );

  // Applied filter state
  const [applied, setApplied] = useState<AppliedSuivieFilters | null>(null);

  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');

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
      if (openMenu && !(e.target as Element).closest('.action-menu')) {
        setOpenMenu(null);
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
  }, [openMenu]);

  useEffect(() => {
    setSort(null);
    setTableSearch('');
    if (activeAction === 'suivie_generale') {
      setVisibleDepartments(new Set(SUIVIE_DEPARTMENTS));
      setGroupByDepartment(true);
    }
  }, [activeAction]);

  const toggleSort = useCallback((columnId: string) => {
    setSort((prev) => nextSortState(prev, columnId));
  }, []);

  const toggleVisibleDepartment = useCallback((dept: string) => {
    setVisibleDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  }, []);

  const selectAllVisibleDepartments = useCallback(() => {
    setVisibleDepartments(new Set(SUIVIE_DEPARTMENTS));
  }, []);

  const clearVisibleDepartments = useCallback(() => {
    setVisibleDepartments(new Set());
  }, []);

  const vehicleById = useMemo(
    () => Object.fromEntries(vehicles.map((v) => [v.id, v])),
    [vehicles]
  );

  const scopedRows = useMemo(() => {
    if (!applied) return [] as SuivieRow[];
    const all = buildRowsForAction(applied.action, vehicles);
    return applySuivieFilters(all, applied);
  }, [applied, vehicles]);

  const tableRows = useMemo(() => {
    let rows = scopedRows;
    if (
      activeAction === 'suivie_generale' &&
      statusFilter.size > 0
    ) {
      rows = rows.filter((row) => {
        const status = vehicleById[row.vehicleId]?.status;
        return status != null && statusFilter.has(status);
      });
    }
    if (
      activeAction === 'suivie_generale' &&
      groupByDepartment &&
      visibleDepartments.size < SUIVIE_DEPARTMENTS.length
    ) {
      rows = rows.filter((row) => visibleDepartments.has(row.department));
    }
    // Flat list when not grouping (or non-générale): apply global sort
    if (activeAction === 'suivie_generale' && groupByDepartment) {
      return rows;
    }
    return sortSuivieRows(rows, sort);
  }, [
    scopedRows,
    activeAction,
    statusFilter,
    vehicleById,
    sort,
    groupByDepartment,
    visibleDepartments,
  ]);

  useEffect(() => {
    if (!onFilteredVehicleIdsChange || !applied) return;
    const hasScope =
      applied.vehicleIds.size > 0 || applied.departments.size > 0;
    const hasDeptVisibility =
      activeAction === 'suivie_generale' &&
      groupByDepartment &&
      visibleDepartments.size < SUIVIE_DEPARTMENTS.length;
    if (!hasScope && !hasDeptVisibility) {
      onFilteredVehicleIdsChange(null);
      return;
    }
    onFilteredVehicleIdsChange(getFilteredVehicleIds(tableRows));
  }, [
    applied,
    tableRows,
    onFilteredVehicleIdsChange,
    activeAction,
    groupByDepartment,
    visibleDepartments,
  ]);

  const rowsByDepartment = useMemo(() => {
    if (activeAction !== 'suivie_generale' || !groupByDepartment) return null;
    const grouped: Record<string, SuivieRow[]> = {};
    for (const dept of SUIVIE_DEPARTMENTS) {
      if (!visibleDepartments.has(dept)) continue;
      grouped[dept] = [];
    }
    for (const row of tableRows) {
      if (!visibleDepartments.has(row.department)) continue;
      if (!grouped[row.department]) grouped[row.department] = [];
      grouped[row.department].push(row);
    }
    const entries = Object.entries(grouped).filter(([, rows]) => rows.length > 0);
    return Object.fromEntries(
      entries.map(([dept, rows]) => [dept, sortSuivieRows(rows, sort)])
    );
  }, [
    activeAction,
    tableRows,
    sort,
    groupByDepartment,
    visibleDepartments,
  ]);

  const rowMatchesTableSearch = useCallback(
    (row: SuivieRow, query: string) => {
      if (!query) return true;
      const parts: string[] = [
        row.vehicleName,
        row.department,
        row.vehicleId,
        row.id,
      ];
      for (const col of visibleColumns) {
        const raw = row[col.id];
        if (raw !== undefined && raw !== null) parts.push(String(raw));
      }
      return parts.join(' ').toLowerCase().includes(query);
    },
    [visibleColumns]
  );

  const displayTableRows = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return tableRows;
    return tableRows.filter((row) => rowMatchesTableSearch(row, q));
  }, [tableRows, tableSearch, rowMatchesTableSearch]);

  const displayRowsByDepartment = useMemo(() => {
    if (!rowsByDepartment) return null;
    const q = tableSearch.trim().toLowerCase();
    if (!q) return rowsByDepartment;
    const filtered: Record<string, SuivieRow[]> = {};
    for (const [dept, rows] of Object.entries(rowsByDepartment)) {
      const matched = rows.filter((row) => rowMatchesTableSearch(row, q));
      if (matched.length > 0) filtered[dept] = matched;
    }
    return filtered;
  }, [rowsByDepartment, tableSearch, rowMatchesTableSearch]);

  const filteredVehiclesList = useMemo(() => {
    const q = vehicleSearch.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) => {
      const haystack = [
        v.name,
        v.id,
        v.matricule ?? '',
        v.imei ?? '',
        v.driver,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [vehicles, vehicleSearch]);

  useEffect(() => {
    setApplied({
      action: draftAction,
      vehicleIds: new Set(draftVehicles),
      departments: new Set(),
      startDate: draftStartDate,
      endDate: draftEndDate,
      alertTypes: new Set(draftAlertTypes),
    });
  }, [
    draftAction,
    draftVehicles,
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
    if (vCount === 0) return 'Sélectionner des véhicules';
    if (vCount === 1) {
      const v = vehicles.find((x) => x.id === [...draftVehicles][0]);
      return v?.matricule || v?.name || '1 véhicule';
    }
    return `${vCount} véhicules`;
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
    setOpenMenu(null);
  };

  const openActionMenuAt = (
    e: React.MouseEvent,
    rowId: string,
    vehicleId: string
  ) => {
    e.stopPropagation();
    if (openMenu?.rowId === rowId) {
      setOpenMenu(null);
      return;
    }
    const { x, y } = clampMenuPosition(e.clientX, e.clientY);
    setOpenMenu({ rowId, vehicleId, x, y });
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
    }${isGenerale ? ' cursor-pointer' : ''}`;

    return (
      <tr
        key={row.id}
        className={commonClasses}
        onMouseDown={(e) => {
          if (isGenerale) e.stopPropagation();
        }}
        onClick={(e) => {
          if (isGenerale) {
            openActionMenuAt(e, row.id, row.vehicleId);
          } else {
            selectRowVehicle(row);
          }
        }}
      >
        {visibleColumns.map((col) => {
          const raw = row[col.id];
          const value =
            raw === undefined || raw === null ? '—' : String(raw);
          return (
            <td key={col.id} className={cellClassFor(col.id, value)}>
              {renderCellContent(col.id, value, row)}
            </td>
          );
        })}
        {isGenerale && (
          <td className="px-3 py-2">
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                openActionMenuAt(e, row.id, row.vehicleId);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Actions véhicule"
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
                    Véhicules
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
                        draftVehicles.size > 0
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
                        className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[400px] w-full max-w-[min(360px,calc(100vw-2rem))]"
                      >
                        <div className="p-2 border-b border-slate-100">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Matricule, IMEI, nom…"
                              value={vehicleSearch}
                              onChange={(e) =>
                                setVehicleSearch(e.target.value)
                              }
                              className="w-full pl-7 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1.5 px-1">
                            <FilterBulkActions
                              onSelectAll={() =>
                                setDraftVehicles(
                                  new Set(
                                    filteredVehiclesList.map((v) => v.id)
                                  )
                                )
                              }
                              onClear={() => setDraftVehicles(new Set())}
                            />
                          </div>
                          <p className="mt-1 px-1 text-[10px] text-slate-500">
                            {draftVehicles.size} sélectionné
                            {draftVehicles.size === 1 ? '' : 's'}
                            {vehicleSearch.trim()
                              ? ` · ${filteredVehiclesList.length} résultat${filteredVehiclesList.length === 1 ? '' : 's'}`
                              : ''}
                          </p>
                        </div>
                        <div className="overflow-y-auto flex-1 p-1">
                          {filteredVehiclesList.length === 0 ? (
                            <p className="px-3 py-6 text-center text-xs text-slate-500">
                              Aucun véhicule trouvé
                            </p>
                          ) : (
                            filteredVehiclesList.map((vehicle) => (
                              <label
                                key={vehicle.id}
                                className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                              >
                                <div
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                    draftVehicles.has(vehicle.id)
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-slate-300 bg-white group-hover:border-blue-400'
                                  }`}
                                >
                                  {draftVehicles.has(vehicle.id) && (
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={draftVehicles.has(vehicle.id)}
                                  onChange={() => toggleVehicle(vehicle.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold text-slate-800 truncate">
                                    {vehicle.matricule || vehicle.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate font-mono">
                                    IMEI {vehicle.imei || '—'}
                                  </div>
                                  {vehicle.matricule && (
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {vehicle.name}
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))
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
                                        departments: new Set(),
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
                          <div className="p-1.5 border-b border-slate-100 flex justify-between gap-1.5">
                            <FilterBulkActions
                              onSelectAll={() =>
                                setDraftAlertTypes(new Set([...ALERT_TYPES]))
                              }
                              onClear={() => setDraftAlertTypes(new Set())}
                            />
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
            </div>
          </div>

          {activeAction === 'suivie_generale' && (
            <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={groupByDepartment}
                    onClick={() => setGroupByDepartment((v) => !v)}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      groupByDepartment ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        groupByDepartment ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-slate-700">
                    Classer par département
                  </span>
                </label>
                {groupByDepartment && (
                  <FilterBulkActions
                    onSelectAll={selectAllVisibleDepartments}
                    onClear={clearVisibleDepartments}
                  />
                )}
              </div>
              {groupByDepartment && (
                <div className="flex flex-wrap gap-1.5">
                  {SUIVIE_DEPARTMENTS.map((dept) => {
                    const selected = visibleDepartments.has(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleVisibleDepartment(dept)}
                        aria-pressed={selected}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          selected
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            selected ? 'bg-blue-500' : 'bg-slate-300'
                          }`}
                        />
                        {dept}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="shrink-0 border-b border-slate-200 bg-white px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Rechercher dans le tableau…"
                  className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
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
                        className="absolute top-full mt-2 right-0 w-72 max-h-80 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] flex flex-col overflow-hidden"
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
                  className="h-8 flex items-center justify-center gap-1.5 px-2.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  className="h-8 flex items-center justify-center gap-1.5 px-2.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className="flex-1 overflow-x-auto overflow-y-auto bg-white min-w-0"
            onScroll={() => {
              if (openMenu) setOpenMenu(null);
            }}
          >
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
                        sortDir={
                          sort?.columnId === col.id ? sort.dir : null
                        }
                        onSortClick={toggleSort}
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
                {displayTableRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Math.max(colCount, 1)}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      {tableSearch.trim()
                        ? 'Aucun résultat pour cette recherche dans le tableau.'
                        : activeAction === 'suivie_generale' &&
                            groupByDepartment &&
                            visibleDepartments.size === 0
                          ? 'Aucun département sélectionné. Activez au moins un département ci-dessus.'
                          : 'Aucun résultat pour ces filtres.'}
                    </td>
                  </tr>
                ) : activeAction === 'suivie_generale' &&
                  groupByDepartment &&
                  displayRowsByDepartment ? (
                  Object.entries(displayRowsByDepartment).map(([dept, rows]) => {
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
                  displayTableRows.map((row) => renderDataRow(row))
                )}
              </tbody>
            </table>
            </DndContext>
          </div>

          {typeof document !== 'undefined' &&
            createPortal(
              <AnimatePresence>
                {openMenu && (
                  <motion.div
                    key={openMenu.rowId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="action-menu fixed w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-[9999] overflow-hidden"
                    style={{ left: openMenu.x, top: openMenu.y }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {menuItems.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            handleMenuAction(item.label, openMenu.vehicleId)
                          }
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
                )}
              </AnimatePresence>,
              document.body
            )}

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
