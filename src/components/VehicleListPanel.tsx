import React, { useEffect, useState, useRef, Fragment } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
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
  X,
  ChevronDown,
  ChevronUp,
  Bell,
  Car,
  Play,
  Package,
  List,
  Clock,
  Wrench,
  Hand,
  Calendar,
  Layers,
  AlertTriangle,
  Check } from
'lucide-react';
import { Vehicle } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { DateTimePicker } from './DateTimePicker';
interface VehicleListPanelProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}
// Types d'alertes disponibles
const ALERT_TYPES = [
'Toutes les alertes',
'Dépassement de vitesse',
'Tous les geofences',
'Sortie/entrée du pays',
"Entrée/Sortie de l'itineraire",
'Remorquage',
'Batterie débranchée',
'Message reçue',
'Alerte de température',
'Alerte de carburant',
'Conduite agressive',
'SOS',
'Taxi libre/occupé',
'Contact On/Off',
'Malle ouverte/fermée',
'Capot ouvert/fermé',
'Porte ouverte/fermée',
'Alerte de maintenance',
'Stop',
'Signal GPS détecté/perdu',
'Stop de longue durée',
'Dépassement temps de conduite',
'Identification du conducteur',
'Alerte de parc',
'Photo reçue',
'Enlèvement',
'Inconnu'];

type SuivieAction =
'suivie_generale' |
'alertes' |
'stop_circulation' |
'trajectoire' |
'commandes';
const ACTIONS: {
  id: SuivieAction;
  label: string;
}[] = [
{
  id: 'suivie_generale',
  label: 'Suivi général'
},
{
  id: 'alertes',
  label: 'Alertes'
},
{
  id: 'stop_circulation',
  label: 'Stop & Circulation'
},
{
  id: 'trajectoire',
  label: 'Trajectoire'
},
{
  id: 'commandes',
  label: 'Commandes'
}];

const DEPARTMENTS = [
'Transport',
'Logistique',
'Commercial',
'Direction',
'Technique'];

export function VehicleListPanel({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  isCollapsed = false,
  onToggleCollapse
}: VehicleListPanelProps) {
  const [width, setWidth] = useState(800);
  const [isResizing, setIsResizing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showDepartmentPopup, setShowDepartmentPopup] = useState(false);
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(
    new Set()
  );
  // Filter states
  const [suivieStartDate, setSuivieStartDate] = useState('');
  const [suivieEndDate, setSuivieEndDate] = useState('');
  const [suivieAction, setSuivieAction] =
  useState<SuivieAction>('suivie_generale');
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set()
  );
  const [selectedDepartmentsFilter, setSelectedDepartmentsFilter] = useState<
    Set<string>>(
    new Set());
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<Set<string>>(
    new Set()
  );
  // Dropdown states
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [isAlertDropdownOpen, setIsAlertDropdownOpen] = useState(false);
  const [vehicleTab, setVehicleTab] = useState<'vehicles' | 'departments'>(
    'vehicles'
  );
  const [vehicleSearch, setVehicleSearch] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const alertDropdownRef = useRef<HTMLDivElement>(null);
  const departments = ['DEmo2025', 'LATRACE', 'test', 'TUNAV'];
  // Initialize dates
  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };
    setSuivieStartDate(formatDate(start));
    setSuivieEndDate(formatDate(now));
  }, []);
  // Group vehicles by department (mock implementation)
  const getVehiclesByDepartment = () => {
    const grouped: {
      [key: string]: Vehicle[];
    } = {};
    departments.forEach((dept, idx) => {
      const deptVehicles = vehicles.filter(
        (_, vIdx) => vIdx % departments.length === idx
      );
      if (deptVehicles.length > 0) {
        grouped[dept] = deptVehicles;
      }
    });
    return grouped;
  };
  const vehiclesByDepartment = getVehiclesByDepartment();
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 600 && newWidth <= 1200) {
        setWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openMenuId && !(e.target as Element).closest('.action-menu')) {
        setOpenMenuId(null);
      }
      if (
      vehicleDropdownRef.current &&
      !vehicleDropdownRef.current.contains(e.target as Node))
      {
        setIsVehicleDropdownOpen(false);
      }
      if (
      actionDropdownRef.current &&
      !actionDropdownRef.current.contains(e.target as Node))
      {
        setIsActionDropdownOpen(false);
      }
      if (
      alertDropdownRef.current &&
      !alertDropdownRef.current.contains(e.target as Node))
      {
        setIsAlertDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);
  const menuItems = [
  {
    icon: MapPin,
    label: 'Afficher sur la carte'
  },
  {
    icon: Route,
    label: 'Afficher trajectoire'
  },
  {
    icon: StopCircle,
    label: 'Afficher Stop/Circulation'
  },
  {
    icon: FileText,
    label: 'Afficher le rapport détaillé'
  },
  {
    icon: Zap,
    label: 'Afficher les excès de vitesse'
  },
  {
    icon: Navigation,
    label: 'Demande position actuelle'
  },
  {
    icon: Power,
    label: 'Arrêt à distance(AAD)'
  },
  {
    icon: Settings,
    label: 'Paramétrage des alertes'
  }];

  const handleMenuAction = (action: string, vehicleId: string) => {
    console.log(`Action: ${action} for vehicle ${vehicleId}`);
    setOpenMenuId(null);
  };
  const toggleDepartmentCollapse = (dept: string) => {
    setCollapsedDepartments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dept)) {
        newSet.delete(dept);
      } else {
        newSet.add(dept);
      }
      return newSet;
    });
  };
  const filteredDepartments =
  selectedDepartments.length === 0 ?
  Object.keys(vehiclesByDepartment) :
  selectedDepartments.filter((dept) => vehiclesByDepartment[dept]);
  // Get table columns based on active action
  const getTableColumns = () => {
    switch (suivieAction) {
      case 'suivie_generale':
        return [
        'Véhicule',
        'Heures de moteur',
        'Date / heure',
        'Horodatage',
        'Chauffeur',
        'Actions'];

      case 'alertes':
        return [
        'Véhicule',
        'Date',
        "Type d'alerte",
        'Adresse',
        'Vitesse',
        'Kilométrage',
        'N° Châssis'];

      case 'stop_circulation':
        return [
        'État',
        'Matricule',
        'Emplacement',
        'Distance',
        'Période',
        'Date début',
        'Vitesse moy'];

      case 'trajectoire':
        return [
        'Stop/Circulation',
        'Matricule',
        'Emplacement',
        'Distance',
        'Période',
        'Vitesse',
        'Date début',
        'Niveau carburant'];

      case 'commandes':
        return ['Véhicule', 'Commande', 'État', 'Date', 'Résultat'];
      default:
        return [];
    }
  };
  // Generate mock horodatage
  const getHorodatage = (status: string) => {
    if (status === 'active') {
      const minutes = Math.floor(Math.random() * 60);
      return minutes === 0 ? '1 h' : `${minutes} mn`;
    } else if (status === 'idle') {
      return `${Math.floor(Math.random() * 12) + 1} h`;
    } else {
      return `${Math.floor(Math.random() * 48) + 12} h`;
    }
  };
  const filteredVehiclesList = vehicles.filter(
    (v) =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.id.toLowerCase().includes(vehicleSearch.toLowerCase())
  );
  const toggleVehicle = (id: string) => {
    const newSet = new Set(selectedVehicles);
    if (newSet.has(id)) newSet.delete(id);else
    newSet.add(id);
    setSelectedVehicles(newSet);
  };
  const toggleDepartment = (dept: string) => {
    const newSet = new Set(selectedDepartmentsFilter);
    if (newSet.has(dept)) newSet.delete(dept);else
    newSet.add(dept);
    setSelectedDepartmentsFilter(newSet);
  };
  const toggleAlertType = (type: string) => {
    const newSet = new Set(selectedAlertTypes);
    if (newSet.has(type)) newSet.delete(type);else
    newSet.add(type);
    setSelectedAlertTypes(newSet);
  };
  const selectAllVehicles = () => {
    setSelectedVehicles(new Set(vehicles.map((v) => v.id)));
  };
  const deselectAllVehicles = () => {
    setSelectedVehicles(new Set());
  };
  const selectAllDepartments = () => {
    setSelectedDepartmentsFilter(new Set(DEPARTMENTS));
  };
  const deselectAllDepartments = () => {
    setSelectedDepartmentsFilter(new Set());
  };
  const getVehicleButtonText = () => {
    const vCount = selectedVehicles.size;
    const dCount = selectedDepartmentsFilter.size;
    if (vCount === 0 && dCount === 0) return 'Sélectionner véhicules';
    const parts = [];
    if (vCount > 0) parts.push(`${vCount} véh.`);
    if (dCount > 0) parts.push(`${dCount} dép.`);
    return parts.join(', ');
  };
  // Render table row based on action type
  const renderTableRow = (vehicle: Vehicle, index: number) => {
    const engineHours = `${Math.floor(Math.random() * 3000) + 300}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    const horodatage = getHorodatage(vehicle.status);
    const statusColor =
    vehicle.status === 'active' ?
    'bg-emerald-500' :
    vehicle.status === 'idle' ?
    'bg-amber-500' :
    'bg-rose-500';
    const commonClasses = `transition-colors border-b border-slate-100 ${selectedVehicleId === vehicle.id ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`;
    switch (suivieAction) {
      case 'suivie_generale':
        return (
          <tr key={vehicle.id} className={commonClasses}>
            <td
              className="px-3 py-2 cursor-pointer"
              onClick={() => onSelectVehicle(vehicle)}>
              
              <span className="text-xs font-medium text-slate-700">
                {vehicle.name}
              </span>
            </td>
            <td
              className="px-3 py-2 text-xs text-slate-600 font-mono cursor-pointer"
              onClick={() => onSelectVehicle(vehicle)}>
              
              {engineHours}
            </td>
            <td
              className="px-3 py-2 text-xs text-slate-600 cursor-pointer"
              onClick={() => onSelectVehicle(vehicle)}>
              
              {new Date().toLocaleDateString('fr-FR')}{' '}
              {new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </td>
            <td
              className="px-3 py-2 cursor-pointer"
              onClick={() => onSelectVehicle(vehicle)}>
              
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded-full ${statusColor} flex items-center justify-center`}>
                  
                  <Clock className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700">
                  {horodatage}
                </span>
              </div>
            </td>
            <td
              className="px-3 py-2 text-xs text-slate-700 cursor-pointer"
              onClick={() => onSelectVehicle(vehicle)}>
              
              {vehicle.driver || '—'}
            </td>
            <td className="px-3 py-2">
              <div className="relative action-menu">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === vehicle.id ? null : vehicle.id);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  
                  <MoreVertical className="w-4 h-4 text-slate-600" />
                </button>
                {openMenuId === vehicle.id &&
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: -10
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -10
                  }}
                  transition={{
                    duration: 0.15
                  }}
                  className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50 overflow-hidden">
                  
                    {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                        handleMenuAction(item.label, vehicle.id)
                        }
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left group">
                        
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                          <span className="text-sm text-slate-700 group-hover:text-slate-900">
                            {item.label}
                          </span>
                        </button>);

                  })}
                  </motion.div>
                }
              </div>
            </td>
          </tr>);

      case 'alertes':
        return (
          <tr
            key={vehicle.id}
            className={commonClasses}
            onClick={() => onSelectVehicle(vehicle)}>
            
            <td className="px-3 py-2 text-xs font-medium text-slate-700">
              {vehicle.name}
            </td>
            <td className="px-3 py-2 text-xs text-slate-600">
              {new Date().toLocaleDateString('fr-FR')}
            </td>
            <td className="px-3 py-2 text-xs text-rose-600 font-medium">
              Dépassement de vitesse
            </td>
            <td className="px-3 py-2 text-xs text-slate-600 max-w-[150px] truncate">
              {vehicle.location}
            </td>
            <td className="px-3 py-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                {vehicle.speed} km/h
              </span>
            </td>
            <td className="px-3 py-2 text-xs text-slate-700">
              {Math.floor(Math.random() * 50000) + 10000} km
            </td>
            <td className="px-3 py-2 text-xs text-slate-600 font-mono">
              VIN{String(1000 + index).padStart(4, '0')}
            </td>
          </tr>);

      case 'stop_circulation':
        return (
          <tr
            key={vehicle.id}
            className={commonClasses}
            onClick={() => onSelectVehicle(vehicle)}>
            
            <td className="px-3 py-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${vehicle.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                
                {vehicle.status === 'active' ? 'Circulation' : 'Stop'}
              </span>
            </td>
            <td className="px-3 py-2 text-xs font-medium text-slate-700">
              {vehicle.name}
            </td>
            <td className="px-3 py-2 text-xs text-slate-600 max-w-[150px] truncate">
              {vehicle.location}
            </td>
            <td className="px-3 py-2 text-xs text-slate-700">
              {Math.floor(Math.random() * 500) + 100} km
            </td>
            <td className="px-3 py-2 text-xs text-slate-600">
              {Math.floor(Math.random() * 120) + 30} min
            </td>
            <td className="px-3 py-2 text-xs text-slate-600">
              {new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
            <td className="px-3 py-2 text-xs text-slate-700">
              {Math.floor(Math.random() * 40) + 40} km/h
            </td>
          </tr>);

      case 'trajectoire':
        return (
          <tr
            key={vehicle.id}
            className={commonClasses}
            onClick={() => onSelectVehicle(vehicle)}>
            
            <td className="px-3 py-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${vehicle.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                
                {vehicle.status === 'active' ? 'Circulation' : 'Stop'}
              </span>
            </td>
            <td className="px-3 py-2 text-xs font-medium text-slate-700">
              {vehicle.name}
            </td>
            <td className="px-3 py-2 text-xs text-slate-600 max-w-[150px] truncate">
              {vehicle.location}
            </td>
            <td className="px-3 py-2 text-xs text-slate-700">
              {Math.floor(Math.random() * 500) + 100} km
            </td>
            <td className="px-3 py-2 text-xs text-slate-600">
              {Math.floor(Math.random() * 120) + 30} min
            </td>
            <td className="px-3 py-2 text-xs text-slate-700">
              {vehicle.speed} km/h
            </td>
            <td className="px-3 py-2 text-xs text-slate-600">
              {new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </td>
            <td className="px-3 py-2 text-xs text-slate-700">
              {Math.floor(Math.random() * 100)}%
            </td>
          </tr>);

      case 'commandes':
        return (
          <tr
            key={vehicle.id}
            className={commonClasses}
            onClick={() => onSelectVehicle(vehicle)}>
            
            <td className="px-3 py-2 text-xs font-medium text-slate-700">
              {vehicle.name}
            </td>
            <td className="px-3 py-2 text-xs text-slate-600">
              Demande position
            </td>
            <td className="px-3 py-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Exécutée
              </span>
            </td>
            <td className="px-3 py-2 text-xs text-slate-600">
              {new Date().toLocaleDateString('fr-FR')}
            </td>
            <td className="px-3 py-2 text-xs text-emerald-600 font-medium">
              Succès
            </td>
          </tr>);

      default:
        return null;
    }
  };
  return (
    <div
      ref={panelRef}
      style={{
        width: isCollapsed ? '0px' : `${width}px`
      }}
      className="h-full flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/50 flex-shrink-0 relative transition-all duration-300 shadow-2xl">
      
      {/* Collapse Toggle Button */}
      {onToggleCollapse &&
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-6 h-12 bg-white/95 backdrop-blur-sm hover:bg-white border border-slate-200 rounded-r-lg flex items-center justify-center transition-colors shadow-lg">
        
          {isCollapsed ?
        <ChevronRight className="w-4 h-4 text-slate-600" /> :

        <ChevronLeft className="w-4 h-4 text-slate-600" />
        }
        </button>
      }

      {!isCollapsed &&
      <>
          {/* Filter Bar - Two Lines Design */}
          <div className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
            {/* First Line: Main Filters */}
            <div className="px-4 pt-4 pb-3">
              <div className="grid grid-cols-12 gap-3 items-end">
                {/* Vehicle/Department Selection - 4 cols */}
                <div className="col-span-4 relative" ref={vehicleDropdownRef}>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-blue-600" />
                    Véhicules / Départements
                  </label>
                  <button
                  onClick={() =>
                  setIsVehicleDropdownOpen(!isVehicleDropdownOpen)
                  }
                  className="w-full flex items-center justify-between bg-white border-2 border-slate-200 hover:border-blue-400 rounded-lg px-3 py-2 text-sm transition-all shadow-sm hover:shadow-md">
                  
                    <span
                    className={`truncate ${selectedVehicles.size > 0 || selectedDepartmentsFilter.size > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    
                      {getVehicleButtonText()}
                    </span>
                    <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isVehicleDropdownOpen ? 'rotate-180' : ''}`} />
                  
                  </button>

                  <AnimatePresence>
                    {isVehicleDropdownOpen &&
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    exit={{
                      opacity: 0,
                      y: 5
                    }}
                    className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[400px] w-[320px]">
                    
                        <div className="flex border-b border-slate-100">
                          <button
                        onClick={() => setVehicleTab('vehicles')}
                        className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${vehicleTab === 'vehicles' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                        
                            Véhicules ({selectedVehicles.size})
                          </button>
                          <button
                        onClick={() => setVehicleTab('departments')}
                        className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${vehicleTab === 'departments' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                        
                            Départements ({selectedDepartmentsFilter.size})
                          </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col">
                          {vehicleTab === 'vehicles' ?
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
                              className="w-full pl-7 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
                            
                                </div>
                                <div className="flex items-center justify-between mt-1.5 px-1">
                                  <button
                              onClick={selectAllVehicles}
                              className="text-[9px] text-blue-600 hover:underline font-medium">
                              
                                    Tout
                                  </button>
                                  <button
                              onClick={deselectAllVehicles}
                              className="text-[9px] text-slate-500 hover:underline">
                              
                                    Rien
                                  </button>
                                </div>
                              </div>
                              <div className="overflow-y-auto flex-1 p-1">
                                {filteredVehiclesList.map((vehicle) =>
                          <label
                            key={vehicle.id}
                            className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                            
                                    <div
                              className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${selectedVehicles.has(vehicle.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                              
                                      {selectedVehicles.has(vehicle.id) &&
                              <Check className="w-2 h-2 text-white" />
                              }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-medium text-slate-700 truncate">
                                        {vehicle.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 truncate">
                                        {vehicle.driver}
                                      </div>
                                    </div>
                                  </label>
                          )}
                              </div>
                            </> :

                      <div className="flex-1 overflow-y-auto p-1">
                              <div className="flex items-center justify-between mb-1.5 px-2 pt-1">
                                <button
                            onClick={selectAllDepartments}
                            className="text-[9px] text-blue-600 hover:underline font-medium">
                            
                                  Tout
                                </button>
                                <button
                            onClick={deselectAllDepartments}
                            className="text-[9px] text-slate-500 hover:underline">
                            
                                  Rien
                                </button>
                              </div>
                              {DEPARTMENTS.map((dept) =>
                        <label
                          key={dept}
                          className="flex items-center gap-2 px-2 py-2 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors">
                          
                                  <div
                            className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${selectedDepartmentsFilter.has(dept) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                            
                                    {selectedDepartmentsFilter.has(dept) &&
                            <Check className="w-2 h-2 text-white" />
                            }
                                  </div>
                                  <span className="text-xs font-medium text-slate-700">
                                    {dept}
                                  </span>
                                </label>
                        )}
                            </div>
                      }
                        </div>
                      </motion.div>
                  }
                  </AnimatePresence>
                </div>

                {/* Date Range - 4 cols total (2 each) */}
                <div className="col-span-3">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Date début
                  </label>
                  <DateTimePicker
                  value={suivieStartDate}
                  onChange={setSuivieStartDate}
                  placeholder="Début" />
                
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Date fin
                  </label>
                  <DateTimePicker
                  value={suivieEndDate}
                  onChange={setSuivieEndDate}
                  placeholder="Fin" />
                
                </div>
              </div>
            </div>

            {/* Second Line: Action + Alert Types (if needed) + Export Buttons + Apply */}
            <div className="px-4 pb-3 flex items-end gap-3">
              {/* Action Selection */}
              <div className="w-64 relative" ref={actionDropdownRef}>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Action
                </label>
                <button
                onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                className="w-full flex items-center justify-between bg-white border-2 border-slate-200 hover:border-blue-400 rounded-lg px-3 py-2 text-sm transition-all shadow-sm hover:shadow-md">
                
                  <span className="text-slate-900 font-medium truncate">
                    {ACTIONS.find((a) => a.id === suivieAction)?.label}
                  </span>
                  <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isActionDropdownOpen ? 'rotate-180' : ''}`} />
                
                </button>

                <AnimatePresence>
                  {isActionDropdownOpen &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 5
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: 5
                  }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  
                      <div className="p-1">
                        {ACTIONS.map((action) =>
                    <button
                      key={action.id}
                      onClick={() => {
                        setSuivieAction(action.id);
                        setIsActionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${suivieAction === action.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                      
                            {action.label}
                          </button>
                    )}
                      </div>
                    </motion.div>
                }
                </AnimatePresence>
              </div>

              {/* Alert Types - Conditional */}
              {suivieAction === 'alertes' &&
            <div className="flex-1 relative" ref={alertDropdownRef}>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Types d'alerte
                  </label>
                  <button
                onClick={() => setIsAlertDropdownOpen(!isAlertDropdownOpen)}
                className="w-full flex items-center justify-between bg-white border-2 border-slate-200 hover:border-blue-400 rounded-lg px-3 py-2 text-sm transition-all shadow-sm hover:shadow-md">
                
                    <span className="truncate text-slate-700 font-medium">
                      {selectedAlertTypes.size === 0 ?
                  'Tous les types' :
                  `${selectedAlertTypes.size} type(s) sélectionné(s)`}
                    </span>
                    <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${isAlertDropdownOpen ? 'rotate-180' : ''}`} />
                
                  </button>

                  <AnimatePresence>
                    {isAlertDropdownOpen &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 5
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: 5
                  }}
                  className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden w-[220px] max-h-[280px] flex flex-col">
                  
                        <div className="p-1.5 border-b border-slate-100 flex justify-between">
                          <button
                      onClick={() =>
                      setSelectedAlertTypes(new Set(ALERT_TYPES))
                      }
                      className="text-[9px] text-blue-600 hover:underline font-medium">
                      
                            Tout
                          </button>
                          <button
                      onClick={() => setSelectedAlertTypes(new Set())}
                      className="text-[9px] text-slate-500 hover:underline">
                      
                            Rien
                          </button>
                        </div>
                        <div className="overflow-y-auto p-1">
                          {ALERT_TYPES.map((type) =>
                    <label
                      key={type}
                      className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-slate-50 rounded cursor-pointer">
                      
                              <input
                        type="checkbox"
                        checked={selectedAlertTypes.has(type)}
                        onChange={() => toggleAlertType(type)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3 h-3" />
                      
                              <span className="text-[11px] text-slate-700">
                                {type}
                              </span>
                            </label>
                    )}
                        </div>
                      </motion.div>
                }
                  </AnimatePresence>
                </div>
            }

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Export Buttons */}
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>

              {/* Apply Button */}
              <button
              onClick={() => console.log('Filters applied')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm">
              
                <Filter className="w-4 h-4" />
                Appliquer
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-blue-600 sticky top-0 z-10">
                <tr>
                  {getTableColumns().map((column) =>
                <th
                  key={column}
                  className="px-3 py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-700 whitespace-nowrap">
                  
                      {column}
                    </th>
                )}
                </tr>
              </thead>
              <tbody>
                {suivieAction === 'suivie_generale' ?
              // Suivi général with department grouping
              filteredDepartments.map((dept) => {
                const deptVehicles = vehiclesByDepartment[dept];
                const isCollapsedDept = collapsedDepartments.has(dept);
                return (
                  <Fragment key={dept}>
                          <tr className="bg-blue-100">
                            <td
                        colSpan={getTableColumns().length}
                        className="px-3 py-2">
                        
                              <button
                          onClick={() => toggleDepartmentCollapse(dept)}
                          className="w-full flex items-center justify-between hover:bg-blue-150 transition-colors">
                          
                                <div className="flex items-center gap-2">
                                  {isCollapsedDept ?
                            <ChevronRight className="w-4 h-4 text-blue-700" /> :

                            <ChevronDown className="w-4 h-4 text-blue-700" />
                            }
                                  <span className="text-sm font-semibold text-blue-700">
                                    Département: {dept}
                                  </span>
                                </div>
                              </button>
                            </td>
                          </tr>
                          {!isCollapsedDept &&
                    deptVehicles.map((vehicle, index) =>
                    renderTableRow(vehicle, index)
                    )}
                        </Fragment>);

              }) :
              // Other actions without department grouping
              vehicles.
              slice(0, 20).
              map((vehicle, index) => renderTableRow(vehicle, index))}
              </tbody>
            </table>
          </div>

          {/* Resize Handle */}
          <div
          onMouseDown={() => setIsResizing(true)}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors group">
          
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-12 bg-slate-300 group-hover:bg-blue-500 transition-colors rounded-l" />
          </div>
        </>
      }
    </div>);

}