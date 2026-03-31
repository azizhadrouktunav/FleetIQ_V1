import React, { useEffect, useState, useRef } from 'react';
import {
  Mail,
  Phone,
  Pencil,
  Trash2,
  Bell,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Car,
  ChevronDown,
  Check } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Types
interface EmailContact {
  id: string;
  email: string;
  name: string;
  vehicleId: string;
}
interface PhoneContact {
  id: string;
  phone: string;
  name: string;
  vehicleId: string;
}
interface AlertConfigRow {
  type: string;
  startTime: string;
  endTime: string;
  active: boolean;
}
// Mock Vehicles
const MOCK_VEHICLES = [
{
  id: '1',
  matricule: '8125 TU 226 Skander Elj'
},
{
  id: '2',
  matricule: '8127 TU 226'
},
{
  id: '3',
  matricule: '8126 TU 226'
},
{
  id: '4',
  matricule: 'Tepee FM4200'
},
{
  id: '5',
  matricule: '8312 TU 193'
},
{
  id: '6',
  matricule: 'test ID 3210 tu 222'
},
{
  id: '7',
  matricule: 'TEST SOS'
},
{
  id: '8',
  matricule: 'TEST FMB120 + LVC200'
},
{
  id: '9',
  matricule: 'test gps'
},
{
  id: '10',
  matricule: 'Samiha ( Test CERT)'
}];

// Mock Data
const initialEmails: EmailContact[] = [
{
  id: '1',
  email: 'chawki.zorgui18@gamil.com',
  name: 'chawki zorgui',
  vehicleId: '1'
},
{
  id: '2',
  email: 'chawki.zorgui@tunav.com',
  name: 'chawki',
  vehicleId: '1'
},
{
  id: '3',
  email: 'skanderjiji@gmail.com',
  name: 'Skon gmail',
  vehicleId: '2'
},
{
  id: '4',
  email: 'hassen.krichen@tunav.com',
  name: 'Hassen',
  vehicleId: '3'
},
{
  id: '5',
  email: 'marwa.henchir@tunav.com',
  name: 'marwa',
  vehicleId: '4'
}];

const initialPhones: PhoneContact[] = [
{
  id: '1',
  phone: '95992522',
  name: 'Skon',
  vehicleId: '2'
},
{
  id: '2',
  phone: '92204405',
  name: 'zaidi',
  vehicleId: '1'
},
{
  id: '3',
  phone: '95999577',
  name: 'chawki',
  vehicleId: '1'
},
{
  id: '4',
  phone: '95457915',
  name: 'Atef',
  vehicleId: '5'
},
{
  id: '5',
  phone: '95457915',
  name: 'Atef',
  vehicleId: '3'
}];

const ALERT_TYPES = [
'Contact On/Off',
'Porte ouverte/fermée',
'SOS',
'Dépassement de vitesse',
'Tous les geofences',
"Entrée/Sortie de l'itinéraire",
'Stop',
'Alerte de température',
'Batterie débranchée',
'Alerte de carburant',
'Sortie/entrée du pays',
'Remorquage',
'Stop de longue durée',
'Conduite agressive',
'Alerte de parc'];

export function AlertMailSmsContent() {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [emails, setEmails] = useState<EmailContact[]>(initialEmails);
  const [phones, setPhones] = useState<PhoneContact[]>(initialPhones);
  const [searchTerm, setSearchTerm] = useState('');
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    contact: '',
    name: ''
  });
  // Alert Config Modal state
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);
  const [selectedContactForAlerts, setSelectedContactForAlerts] =
  useState<any>(null);
  const [alertConfigRows, setAlertConfigRows] = useState<AlertConfigRow[]>([]);
  const [selectedVehiclesForAlert, setSelectedVehiclesForAlert] = useState<
    string[]>(
    []);
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node))
      {
        setIsVehicleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Handlers
  const handleOpenModal = (mode: 'add' | 'edit', item?: any) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setEditingId(item.id);
      setFormData({
        contact: activeTab === 'email' ? item.email : item.phone,
        name: item.name
      });
    } else {
      setEditingId(null);
      setFormData({
        contact: '',
        name: ''
      });
    }
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      contact: '',
      name: ''
    });
    setEditingId(null);
  };
  const handleSave = () => {
    if (!formData.contact || !formData.name) return;
    if (activeTab === 'email') {
      if (modalMode === 'add') {
        setEmails([
        ...emails,
        {
          id: Date.now().toString(),
          email: formData.contact,
          name: formData.name,
          vehicleId: '1'
        }]
        );
      } else {
        setEmails(
          emails.map((e) =>
          e.id === editingId ?
          {
            ...e,
            email: formData.contact,
            name: formData.name
          } :
          e
          )
        );
      }
    } else {
      if (modalMode === 'add') {
        setPhones([
        ...phones,
        {
          id: Date.now().toString(),
          phone: formData.contact,
          name: formData.name,
          vehicleId: '1'
        }]
        );
      } else {
        setPhones(
          phones.map((p) =>
          p.id === editingId ?
          {
            ...p,
            phone: formData.contact,
            name: formData.name
          } :
          p
          )
        );
      }
    }
    handleCloseModal();
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      if (activeTab === 'email') {
        setEmails(emails.filter((e) => e.id !== id));
      } else {
        setPhones(phones.filter((p) => p.id !== id));
      }
    }
  };
  const handleOpenAlertConfig = (contact: any) => {
    setSelectedContactForAlerts(contact);
    setAlertConfigRows(
      ALERT_TYPES.map((type) => ({
        type,
        startTime: '',
        endTime: '',
        active: false
      }))
    );
    setSelectedVehiclesForAlert([]);
    setIsAlertConfigOpen(true);
  };
  const handleCloseAlertConfig = () => {
    setIsAlertConfigOpen(false);
    setSelectedContactForAlerts(null);
    setVehicleSearchTerm('');
  };
  const handleToggleVehicle = (vehicleId: string) => {
    setSelectedVehiclesForAlert((prev) => {
      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId);
      } else {
        return [...prev, vehicleId];
      }
    });
  };
  const handleToggleAllVehicles = () => {
    if (selectedVehiclesForAlert.length === MOCK_VEHICLES.length) {
      setSelectedVehiclesForAlert([]);
    } else {
      setSelectedVehiclesForAlert(MOCK_VEHICLES.map((v) => v.id));
    }
  };
  const handleUpdateAlertRow = (
  index: number,
  field: keyof AlertConfigRow,
  value: any) =>
  {
    const newRows = [...alertConfigRows];
    newRows[index] = {
      ...newRows[index],
      [field]: value
    };
    setAlertConfigRows(newRows);
  };
  // Filtering logic
  const filteredEmails = emails.filter((e) => {
    const matchesSearch = searchTerm ?
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) :
    true;
    return matchesSearch;
  });
  const filteredPhones = phones.filter((p) => {
    const matchesSearch = searchTerm ?
    p.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) :
    true;
    return matchesSearch;
  });
  // Pagination logic
  const currentData = activeTab === 'email' ? filteredEmails : filteredPhones;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);
  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Top row: Title + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Bell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Envoi des alertes par Mail/SMS
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-64" />
              
            </div>
            <button
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              
              <Plus className="w-4 h-4" />
              {activeTab === 'email' ? 'Ajouter un email' : 'Ajouter un numéro'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('email');
              setCurrentPage(1);
            }}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'email' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            
            <Mail className="w-4 h-4" />
            <span>Adresse mail</span>
            <span
              className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              
              {filteredEmails.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('phone');
              setCurrentPage(1);
            }}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'phone' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            
            <Phone className="w-4 h-4" />
            <span>Numéro de téléphone</span>
            <span
              className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'phone' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              
              {filteredPhones.length}
            </span>
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {activeTab === 'email' ?
                  'Adresse mail' :
                  'Numéro de téléphone'}
                </th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item: any) =>
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                
                  <td className="px-8 py-4 text-sm text-gray-700">
                    {activeTab === 'email' ? item.email : item.phone}
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-700">
                    {item.name}
                  </td>
                  <td className="px-8 py-4 text-sm text-right space-x-4">
                    <button
                    onClick={() => handleOpenModal('edit', item)}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                    title="Modifier">
                    
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Supprimer">
                    
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                    onClick={() => handleOpenAlertConfig(item)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Configurer les alertes">
                    
                      <Bell className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )}
              {paginatedData.length === 0 &&
              <tr>
                  <td
                  colSpan={3}
                  className="px-8 py-12 text-center text-gray-400">
                  
                    <div className="flex flex-col items-center gap-2">
                      <Car className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-500">
                        Aucun contact trouvé
                      </p>
                      <p className="text-sm">
                        Ajoutez un contact pour commencer.
                      </p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-6 bg-white">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border-b border-gray-300 py-1 pr-4 focus:outline-none focus:border-blue-500 bg-transparent text-gray-700">
              
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <span className="text-sm text-gray-500">
            {currentData.length > 0 ? startIndex + 1 : 0} -{' '}
            {Math.min(startIndex + itemsPerPage, currentData.length)} of{' '}
            {currentData.length}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
              
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">
                {modalMode === 'add' ? 'Ajouter' : 'Modifier'}{' '}
                {activeTab === 'email' ?
              'une adresse mail' :
              'un numéro portable'}
              </h2>
              <button
              onClick={handleCloseModal}
              className="text-white/80 hover:text-white transition-colors">
              
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                  type={activeTab === 'email' ? 'email' : 'tel'}
                  placeholder={
                  activeTab === 'email' ?
                  'Adresse mail' :
                  'Numéro de téléphone'
                  }
                  value={formData.contact}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    contact: e.target.value
                  })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                
                </div>
                <div>
                  <input
                  type="text"
                  placeholder="Nom"
                  value={formData.name}
                  onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value
                  })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
              onClick={handleSave}
              disabled={!formData.contact || !formData.name}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      }

      {/* Alert Configuration Modal */}
      <AnimatePresence>
        {isAlertConfigOpen && selectedContactForAlerts &&
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
            
              {/* Header */}
              <div className="bg-blue-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Configuration des alertes
                  </h2>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {selectedContactForAlerts.name} (
                    {activeTab === 'email' ?
                  selectedContactForAlerts.email :
                  selectedContactForAlerts.phone}
                    )
                  </p>
                </div>
                <button
                onClick={handleCloseAlertConfig}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {/* Vehicle Multi-Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Sélectionner les véhicules
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                    onClick={() =>
                    setIsVehicleDropdownOpen(!isVehicleDropdownOpen)
                    }
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-left">
                    
                      <span className="text-gray-700 truncate pr-4">
                        {selectedVehiclesForAlert.length === 0 ?
                      'Aucun véhicule sélectionné' :
                      selectedVehiclesForAlert.length ===
                      MOCK_VEHICLES.length ?
                      'Tous les véhicules' :
                      `${selectedVehiclesForAlert.length} véhicule(s) sélectionné(s)`}
                      </span>
                      <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${isVehicleDropdownOpen ? 'rotate-180' : ''}`} />
                    
                    </button>

                    <AnimatePresence>
                      {isVehicleDropdownOpen &&
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -10
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                      exit={{
                        opacity: 0,
                        y: -10
                      }}
                      transition={{
                        duration: 0.15
                      }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col">
                      
                          {/* Search input */}
                          <div className="p-2 border-b border-gray-100 flex-shrink-0">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                              <input
                            type="text"
                            placeholder="Rechercher un véhicule..."
                            value={vehicleSearchTerm}
                            onChange={(e) =>
                            setVehicleSearchTerm(e.target.value)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                          
                            </div>
                          </div>
                          {/* Options list */}
                          <div className="overflow-y-auto flex-1">
                            {!vehicleSearchTerm &&
                        <div
                          onClick={handleToggleAllVehicles}
                          className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                          
                                <div
                            className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${selectedVehiclesForAlert.length === MOCK_VEHICLES.length ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            
                                  {selectedVehiclesForAlert.length ===
                            MOCK_VEHICLES.length &&
                            <Check className="w-3 h-3 text-white" />
                            }
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                  Tous les véhicules
                                </span>
                              </div>
                        }
                            {MOCK_VEHICLES.filter((v) =>
                        v.matricule.
                        toLowerCase().
                        includes(vehicleSearchTerm.toLowerCase())
                        ).map((v) =>
                        <div
                          key={v.id}
                          onClick={() => handleToggleVehicle(v.id)}
                          className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                          
                                <div
                            className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${selectedVehiclesForAlert.includes(v.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                            
                                  {selectedVehiclesForAlert.includes(v.id) &&
                            <Check className="w-3 h-3 text-white" />
                            }
                                </div>
                                <span className="text-sm text-gray-700">
                                  {v.matricule}
                                </span>
                              </div>
                        )}
                            {MOCK_VEHICLES.filter((v) =>
                        v.matricule.
                        toLowerCase().
                        includes(vehicleSearchTerm.toLowerCase())
                        ).length === 0 &&
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                Aucun véhicule trouvé
                              </div>
                        }
                          </div>
                        </motion.div>
                    }
                    </AnimatePresence>
                  </div>
                </div>

                {/* Alerts Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">
                          Type alerte
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                          Heure début
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                          Heure fin
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {alertConfigRows.map((row, index) =>
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors">
                      
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <button
                            onClick={() =>
                            handleUpdateAlertRow(
                              index,
                              'active',
                              !row.active
                            )
                            }
                            className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0 ${row.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                            
                                <motion.div
                              className="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm"
                              initial={false}
                              animate={{
                                x: row.active ? 20 : 2
                              }}
                              transition={{
                                type: 'spring',
                                stiffness: 500,
                                damping: 30
                              }} />
                            
                              </button>
                              <span
                            className={`text-sm font-medium transition-colors duration-200 ${row.active ? 'text-gray-800' : 'text-gray-400'}`}>
                            
                                {row.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) =>
                          handleUpdateAlertRow(
                            index,
                            'startTime',
                            e.target.value
                          )
                          }
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                          </td>
                          <td className="px-6 py-3">
                            <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) =>
                          handleUpdateAlertRow(
                            index,
                            'endTime',
                            e.target.value
                          )
                          }
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                <button
                onClick={handleCloseAlertConfig}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                
                  Annuler
                </button>
                <button
                onClick={handleCloseAlertConfig}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}