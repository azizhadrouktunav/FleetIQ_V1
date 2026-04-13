import React, { useEffect, useState } from 'react';
import {
  Users,
  Car,
  Wrench,
  FileText,
  AlertCircle,
  MapPin,
  Calendar,
  Ticket,
  Gauge,
  ShoppingCart,
  CreditCard,
  Server,
  Package,
  Receipt,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Filter,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
  Settings,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Menu,
  X } from
'lucide-react';
import { useFilterManager } from '../hooks/useFilterManager';
import { FilterManager } from './FilterManager';
import { SaveFilterModal } from './SaveFilterModal';
import { GeneralExpensesContent } from './GeneralExpensesContent';
import { GestionSinistresContent } from './GestionSinistres';
import { GestionArticlesStock } from './GestionArticlesStock';
import { AddEditChauffeurModal, ChauffeurData } from './AddEditChauffeurModal';
import { SuppliersContent } from './GestionFournisseurs';
import { ClientsContent } from './GestionClients';
import { TableFooter } from './TableFooter';
import { GestionPneus } from './GestionPneus';
import { GestionDocuments } from './GestionDocuments';
import { GestionMaintenance } from './GestionMaintenance';
import { GestionCoupons } from './GestionCoupons';
import { GestionMissions } from './GestionMissions';
import { GestionFactures } from './GestionFactures';
import { GestionLocations } from './GestionLocations';
import { AnimatePresence, motion } from 'framer-motion';
function FloatingLabelInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  className = '',
  disabled = false








}: {label: string;value: string | number;onChange: (v: string) => void;type?: string;required?: boolean;className?: string;disabled?: boolean;}) {
  return (
    <div className={`relative ${className}`}>
      <label className="absolute -top-2.5 left-3 bg-white px-1 text-[11px] text-slate-500 font-medium z-10">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 bg-white ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
        required={required} />
      
    </div>);

}
function FuelPriceSettingsModal({
  isOpen,
  onClose,
  currentPrice,
  onSave





}: {isOpen: boolean;onClose: () => void;currentPrice: number;onSave: (price: number) => void;}) {
  const [price, setPrice] = useState(currentPrice.toString());
  useEffect(() => {
    if (isOpen) {
      setPrice(currentPrice.toString());
    }
  }, [isOpen, currentPrice]);
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        exit={{
          opacity: 0
        }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 20
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
          
          <div className="bg-[#0ea5e9] px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              
              <XCircle className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6">
            <FloatingLabelInput
              label="Prix carburant par litre (TND)"
              type="number"
              value={price}
              onChange={setPrice}
              required />
            
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
              
              Annuler
            </button>
            <button
              onClick={() => {
                const parsed = parseFloat(price);
                if (!isNaN(parsed) && parsed > 0) {
                  onSave(parsed);
                  onClose();
                }
              }}
              className="px-6 py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
              
              Enregistrer
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
export function ParcContent() {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(2.525);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['exploitation', 'suivi', 'stocks', 'statistique'])
  );
  const filterManager = useFilterManager(
    `parc_filters_${selectedMenu || 'default'}`
  );
  useEffect(() => {
    if (selectedMenu) {
      const defaultFilter = filterManager.getDefaultFilter();
      if (defaultFilter) {
        setSearchTerm(defaultFilter.vehicles[0] || '');
        setDateDebut(defaultFilter.dateDebut);
        setDateFin(defaultFilter.dateFin);
      }
    }
  }, [selectedMenu]);
  const handleSaveFilter = () => {
    filterManager.saveFilter({
      vehicles: searchTerm ? [searchTerm] : [],
      dateDebut,
      dateFin
    });
  };
  const handleApplyFilter = (filter: any) => {
    setSearchTerm(filter.vehicles[0] || '');
    setDateDebut(filter.dateDebut);
    setDateFin(filter.dateFin);
  };
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };
  const parcMenuGroups = [
  {
    id: 'exploitation',
    label: 'Exploitation du parc',
    items: [
    {
      id: 'clients',
      icon: CreditCard,
      label: 'Gestion des clients'
    },
    {
      id: 'drivers',
      icon: Users,
      label: 'Gestion de chauffeurs'
    },
    {
      id: 'vehicles',
      icon: Car,
      label: 'Gestion de véhicules'
    },
    {
      id: 'rental',
      icon: MapPin,
      label: 'Emprunt et location'
    }]

  },
  {
    id: 'suivi',
    label: 'Suivi opérationnel',
    items: [
    {
      id: 'maintenance',
      icon: Wrench,
      label: 'Gestion de maintenance'
    },
    {
      id: 'tires',
      icon: Gauge,
      label: 'Gestion des pneus'
    },
    {
      id: 'incidents',
      icon: AlertCircle,
      label: 'Gestion des sinistres'
    },
    {
      id: 'missions',
      icon: Calendar,
      label: 'Gestion des visites/missions'
    },
    {
      id: 'coupons',
      icon: Ticket,
      label: 'Gestion des coupons'
    },
    {
      id: 'documents',
      icon: FileText,
      label: 'Gestion de documents'
    }]

  },
  {
    id: 'stocks',
    label: 'Stocks Achats',
    items: [
    {
      id: 'suppliers',
      icon: ShoppingCart,
      label: 'Gestion des fournisseurs'
    },
    {
      id: 'inventory',
      icon: Server,
      label: 'Gestion des articles et du stock'
    },
    {
      id: 'invoices',
      icon: Package,
      label: 'Gestion Pièces commerciales'
    }]

  },
  {
    id: 'statistique',
    label: 'Statistique',
    items: [
    {
      id: 'expenses',
      icon: Receipt,
      label: 'Dépenses générales'
    }]

  }];

  const renderContent = () => {
    if (!selectedMenu) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-200 rounded-2xl mb-6">
              <Car className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-semibold text-slate-700 mb-2">
              Gestion du Parc
            </h1>
            <p className="text-slate-500">
              Sélectionnez une option dans le menu pour commencer
            </p>
          </div>
        </div>);

    }
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {renderMenuContent(selectedMenu)}
        </div>
      </div>);

  };
  const renderMenuContent = (menuId: string) => {
    switch (menuId) {
      case 'drivers':
        return <DriversContent />;
      case 'vehicles':
        return <VehiclesContent />;
      case 'maintenance':
        return <GestionMaintenance />;
      case 'documents':
        return <GestionDocuments />;
      case 'expenses':
        return <GeneralExpensesContent />;
      case 'incidents':
        return <GestionSinistresContent />;
      case 'inventory':
        return <GestionArticlesStock />;
      case 'suppliers':
        return <SuppliersContent />;
      case 'clients':
        return <ClientsContent />;
      case 'tires':
        return <GestionPneus />;
      case 'coupons':
        return <GestionCoupons />;
      case 'missions':
        return <GestionMissions fuelPricePerLiter={fuelPricePerLiter} />;
      case 'invoices':
        return <GestionFactures />;
      case 'rental':
        return <GestionLocations />;
      default:
        return (
          <PlaceholderContent
            icon={
            parcMenuGroups.
            find((group) => group.items.find((item) => item.id === menuId))?.
            items.find((item) => item.id === menuId)?.icon || Car
            }
            title={
            parcMenuGroups.
            find((group) => group.items.find((item) => item.id === menuId))?.
            items.find((item) => item.id === menuId)?.label || ''
            }
            description="Contenu à venir" />);


    }
  };
  return (
    <div className="flex h-full relative">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen &&
        <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" />

        }
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen &&
        <motion.div
          initial={{
            x: -256
          }}
          animate={{
            x: 0
          }}
          exit={{
            x: -256
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 200
          }}
          className="w-64 bg-slate-800 flex flex-col flex-shrink-0 text-slate-200 font-sans fixed lg:relative h-full z-50 lg:z-auto">
          
            <div className="p-4 pt-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-slate-300" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Gestion du Parc
                </h2>
              </div>
              <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-700 rounded transition-colors">
              
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {parcMenuGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              return (
                <div key={group.id}>
                    <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left group">
                    
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {group.label}
                      </span>
                      <motion.div
                      animate={{
                        rotate: isExpanded ? 180 : 0
                      }}
                      transition={{
                        duration: 0.2
                      }}>
                      
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded &&
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0
                      }}
                      animate={{
                        height: 'auto',
                        opacity: 1
                      }}
                      exit={{
                        height: 0,
                        opacity: 0
                      }}
                      transition={{
                        duration: 0.2
                      }}
                      className="overflow-hidden">
                      
                          {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = selectedMenu === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSelectedMenu(item.id);
                              if (window.innerWidth < 1024) {
                                setIsSidebarOpen(false);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left group ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-slate-300'}`}>
                            
                                <Icon
                              className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                            
                                <span
                              className={`text-sm ${isActive ? 'text-white font-medium' : 'group-hover:text-white'}`}>
                              
                                  {item.label}
                                </span>
                              </button>);

                      })}
                        </motion.div>
                    }
                    </AnimatePresence>
                  </div>);

            })}
            </div>

            <div className="p-4 border-t border-slate-700">
              <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left group hover:bg-slate-700 text-slate-300 rounded-lg">
              
                <Settings className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-slate-200" />
                <span className="text-sm group-hover:text-white">
                  Paramètres
                </span>
              </button>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Toggle Button */}
      {!isSidebarOpen &&
      <motion.button
        initial={{
          x: -50,
          opacity: 0
        }}
        animate={{
          x: 0,
          opacity: 1
        }}
        onClick={() => setIsSidebarOpen(true)}
        className="fixed lg:absolute left-4 top-4 z-30 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors">
        
          <Menu className="w-5 h-5" />
        </motion.button>
      }

      <div className="flex-1 bg-slate-50 overflow-hidden">
        {renderContent()}
      </div>

      <FuelPriceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentPrice={fuelPricePerLiter}
        onSave={setFuelPricePerLiter} />
      
    </div>);

}
// Drivers Management Content
function DriversContent() {
  const [showModal, setShowModal] = useState(false);
  const [editingChauffeur, setEditingChauffeur] =
  useState<ChauffeurData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [drivers, setDrivers] = useState<ChauffeurData[]>([
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    etat: 'Actif',
    departement: 'Transport',
    codePersonnel: 'CP-001',
    email: 'jean.dupont@email.com',
    mobile: '06 12 34 56 78',
    numeroCIN: '12345678',
    numeroPermis: 'B123456',
    vehiculeUtil: 'Fleet-001',
    numeroCarteFermeture: '',
    numeroCarteOuverture: '',
    dateNaissance: '1980-05-15',
    lieuNaissance: 'Paris',
    adresse: '123 Rue de la Paix'
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Marie',
    etat: 'Actif',
    departement: 'Logistique',
    codePersonnel: 'CP-002',
    email: 'marie.martin@email.com',
    mobile: '06 23 45 67 89',
    numeroCIN: '87654321',
    numeroPermis: 'B234567',
    vehiculeUtil: 'Fleet-002',
    numeroCarteFermeture: '',
    numeroCarteOuverture: '',
    dateNaissance: '1985-08-22',
    lieuNaissance: 'Lyon',
    adresse: '45 Avenue Jean Jaurès'
  },
  {
    id: '3',
    nom: 'Durand',
    prenom: 'Pierre',
    etat: 'Inactif',
    departement: 'Commercial',
    codePersonnel: 'CP-003',
    email: 'pierre.durand@email.com',
    mobile: '06 34 56 70 90',
    numeroCIN: '11223344',
    numeroPermis: 'B345678',
    vehiculeUtil: 'Aucun',
    numeroCarteFermeture: '',
    numeroCarteOuverture: '',
    dateNaissance: '1990-11-10',
    lieuNaissance: 'Marseille',
    adresse: '78 Boulevard des Anglais'
  },
  {
    id: '4',
    nom: 'Bernard',
    prenom: 'Sophie',
    etat: 'Actif',
    departement: 'Transport',
    codePersonnel: 'CP-004',
    email: 'sophie.bernard@email.com',
    mobile: '06 45 67 89 01',
    numeroCIN: '44332211',
    numeroPermis: 'B456789',
    vehiculeUtil: 'Fleet-003',
    numeroCarteFermeture: '',
    numeroCarteOuverture: '',
    dateNaissance: '1988-03-05',
    lieuNaissance: 'Bordeaux',
    adresse: '12 Place de la Bourse'
  }]
  );
  const departments = [
  'Transport',
  'Logistique',
  'Commercial',
  'Direction',
  'Technique'];

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      driver.nom.toLowerCase().includes(term) ||
      driver.prenom.toLowerCase().includes(term) ||
      driver.email.toLowerCase().includes(term) ||
      driver.departement.toLowerCase().includes(term) ||
      driver.codePersonnel.toLowerCase().includes(term) ||
      driver.numeroCIN.toLowerCase().includes(term) ||
      driver.numeroPermis.toLowerCase().includes(term));

  });
  const totalItems = filteredDrivers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDrivers = filteredDrivers.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const handleSaveChauffeur = (data: ChauffeurData) => {
    if (editingChauffeur) {
      setDrivers(drivers.map((d) => d.id === data.id ? data : d));
    } else {
      setDrivers([
      ...drivers,
      {
        ...data,
        id: Date.now().toString()
      }]
      );
    }
    setShowModal(false);
    setEditingChauffeur(null);
  };
  const handleDeleteChauffeur = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      setDrivers(drivers.filter((d) => d.id !== id));
    }
  };
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des Chauffeurs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez vos chauffeurs et leurs informations
            </p>
          </div>
          <button
            onClick={() => {
              setEditingChauffeur(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            
            <Plus className="w-4 h-4" />
            Ajouter un chauffeur
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Chauffeurs
                </p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {drivers.length}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Actifs</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {drivers.filter((d) => d.etat === 'Actif').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Inactifs</p>
                <p className="text-3xl font-bold text-slate-600 mt-2">
                  {drivers.filter((d) => d.etat === 'Inactif').length}
                </p>
              </div>
              <XCircle className="w-10 h-10 text-slate-400" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher un chauffeur..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              
            </div>
            <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <Filter className="w-4 h-4" />
              Filtrer
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Etat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Code Personnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    N° de mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    N° de CIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    <div className="flex items-center gap-1">
                      N° de permis
                      <ArrowUp className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Véhicule util
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase sticky right-0 bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDrivers.map((driver) =>
                <tr key={driver.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {driver.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.prenom}
                    </td>
                    <td className="px-6 py-4">
                      <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${driver.etat === 'Actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      
                        {driver.etat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.departement}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.codePersonnel}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.mobile}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {driver.numeroCIN}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                      {driver.numeroPermis}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {driver.vehiculeUtil}
                    </td>
                    <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2">
                        <button
                        onClick={() => {
                          setEditingChauffeur(driver);
                          setShowModal(true);
                        }}
                        className="p-1 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                        title="Modifier">
                        
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() =>
                        driver.id && handleDeleteChauffeur(driver.id)
                        }
                        className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                        title="Supprimer">
                        
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onExportPdf={() => console.log('Export PDF Drivers')}
            onExportExcel={() => console.log('Export Excel Drivers')} />
          
        </div>
      </div>
      <AddEditChauffeurModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingChauffeur(null);
        }}
        onSave={handleSaveChauffeur}
        chauffeur={editingChauffeur}
        departments={departments} />
      
    </div>);

}
// Vehicles Management Content
function VehiclesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const vehicles = [
  {
    id: 'Fleet-001',
    brand: 'Renault',
    model: 'Master',
    year: 2022,
    plate: 'AB-123-CD',
    mileage: 45230,
    status: 'active'
  },
  {
    id: 'Fleet-002',
    brand: 'Peugeot',
    model: 'Partner',
    year: 2021,
    plate: 'EF-456-GH',
    mileage: 67890,
    status: 'maintenance'
  },
  {
    id: 'Fleet-003',
    brand: 'Citroën',
    model: 'Berlingo',
    year: 2023,
    plate: 'IJ-789-KL',
    mileage: 12450,
    status: 'active'
  },
  {
    id: 'Fleet-004',
    brand: 'Mercedes',
    model: 'Sprinter',
    year: 2020,
    plate: 'MN-012-OP',
    mileage: 98340,
    status: 'inactive'
  }];

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      vehicle.id.toLowerCase().includes(term) ||
      vehicle.brand.toLowerCase().includes(term) ||
      vehicle.model.toLowerCase().includes(term) ||
      vehicle.plate.toLowerCase().includes(term));

  });
  const totalItems = filteredVehicles.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des Véhicules
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez votre flotte de véhicules
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Ajouter un véhicule
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Rechercher un véhicule..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <Filter className="w-4 h-4" />
                Filtrer
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    ID Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Marque/Modèle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Année
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Plaque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Kilométrage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedVehicles.map((vehicle) =>
                <tr key={vehicle.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {vehicle.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {vehicle.brand}
                        </p>
                        <p className="text-xs text-slate-500">
                          {vehicle.model}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {vehicle.year}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-800">
                      {vehicle.plate}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {vehicle.mileage.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4">
                      <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${vehicle.status === 'active' ? 'bg-emerald-100 text-emerald-700' : vehicle.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      
                        {vehicle.status === 'active' ?
                      'Actif' :
                      vehicle.status === 'maintenance' ?
                      'Maintenance' :
                      'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-blue-50 rounded text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-rose-50 rounded text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onExportPdf={() => console.log('Export PDF Vehicles')}
            onExportExcel={() => console.log('Export Excel Vehicles')} />
          
        </div>
      </div>
    </div>);

}
// Maintenance Content
function MaintenanceContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const maintenances = [
  {
    id: 1,
    vehicle: 'Fleet-002',
    type: 'Révision complète',
    date: '2024-01-15',
    status: 'en_cours',
    cost: 450
  },
  {
    id: 2,
    vehicle: 'Fleet-001',
    type: 'Changement pneus',
    date: '2024-01-20',
    status: 'planifie',
    cost: 320
  },
  {
    id: 3,
    vehicle: 'Fleet-004',
    type: 'Vidange',
    date: '2024-01-10',
    status: 'termine',
    cost: 85
  },
  {
    id: 4,
    vehicle: 'Fleet-003',
    type: 'Contrôle technique',
    date: '2024-01-25',
    status: 'planifie',
    cost: 70
  }];

  const filteredMaintenances = maintenances.filter((maintenance) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      maintenance.vehicle.toLowerCase().includes(term) ||
      maintenance.type.toLowerCase().includes(term) ||
      maintenance.date.toLowerCase().includes(term));

  });
  const totalItems = filteredMaintenances.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaintenances = filteredMaintenances.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion de Maintenance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Planifiez et suivez les maintenances
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Planifier maintenance
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">En cours</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {maintenances.filter((m) => m.status === 'en_cours').length}
                </p>
              </div>
              <Wrench className="w-10 h-10 text-amber-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Planifiées</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {maintenances.filter((m) => m.status === 'planifie').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Coût total</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {maintenances.reduce((sum, m) => sum + m.cost, 0)}€
                </p>
              </div>
              <Euro className="w-10 h-10 text-slate-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Planning de maintenance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Coût
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMaintenances.map((maintenance) =>
                <tr key={maintenance.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {maintenance.vehicle}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">
                      {maintenance.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {maintenance.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {maintenance.cost}€
                    </td>
                    <td className="px-6 py-4">
                      <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${maintenance.status === 'termine' ? 'bg-emerald-100 text-emerald-700' : maintenance.status === 'en_cours' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      
                        {maintenance.status === 'termine' ?
                      'Terminé' :
                      maintenance.status === 'en_cours' ?
                      'En cours' :
                      'Planifié'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-blue-50 rounded text-blue-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-rose-50 rounded text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            onExportPdf={() => console.log('Export PDF Maintenance')}
            onExportExcel={() => console.log('Export Excel Maintenance')} />
          
        </div>
      </div>
    </div>);

}
// Placeholder content for sections not yet implemented
function PlaceholderContent({
  icon: Icon,
  title,
  description




}: {icon: any;title: string;description: string;}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-2xl mb-6">
          <Icon className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-700 mb-2">{title}</h1>
        <p className="text-slate-500">{description}</p>
        <button className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors mx-auto">
          <Plus className="w-4 h-4" />
          Commencer
        </button>
      </div>
    </div>);

}