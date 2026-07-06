import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AlertNotificationContact } from '@/types/alert-config';
import {
  useAlertContacts,
  useDeleteAlertContact,
  useSaveAlertContact,
} from '@/features/alert-center/hooks/useAlertQueries';
import { MOCK_DRIVERS } from '@/features/alert-center/mocks/mockNamedUsers';
import { getAlertTypeLabel } from '@/features/alert-center/constants/alert-taxonomy';
import { getAlertTypesForSection } from '@/features/alert-center/constants/alert-config-sections';
import type { AlertType } from '@/types/alerts';

const MOCK_VEHICLES = [
  { id: '1', matricule: '8125 TU 226 Skander Elj' },
  { id: '2', matricule: '8127 TU 226' },
  { id: '3', matricule: '8126 TU 226' },
  { id: '4', matricule: 'Tepee FM4200' },
  { id: '5', matricule: '8312 TU 193' },
  { id: '6', matricule: 'test ID 3210 tu 222' },
  { id: '7', matricule: 'TEST SOS' },
  { id: '8', matricule: 'TEST FMB120 + LVC200' },
  { id: '9', matricule: 'test gps' },
  { id: '10', matricule: 'Samiha ( Test CERT)' },
];

const ALERT_TYPES = [
  ...getAlertTypesForSection('dashboard'),
  ...getAlertTypesForSection('vehicle_management'),
  ...getAlertTypesForSection('geolocation'),
  ...getAlertTypesForSection('security'),
] as AlertType[];

interface AlertConfigRow {
  type: AlertType;
  startTime: string;
  endTime: string;
  active: boolean;
}

export function AlertMailSmsContent() {
  const { data: contacts = [], isLoading } = useAlertContacts();
  const saveContact = useSaveAlertContact();
  const deleteContact = useDeleteAlertContact();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    contact: '',
    name: '',
    driverId: '',
  });
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);
  const [selectedContactForAlerts, setSelectedContactForAlerts] =
    useState<AlertNotificationContact | null>(null);
  const [alertConfigRows, setAlertConfigRows] = useState<AlertConfigRow[]>([]);
  const [selectedVehiclesForAlert, setSelectedVehiclesForAlert] = useState<string[]>([]);
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsVehicleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emailContacts = useMemo(
    () => contacts.filter((c) => c.email),
    [contacts]
  );
  const phoneContacts = useMemo(
    () => contacts.filter((c) => c.phone),
    [contacts]
  );

  const handleOpenModal = (mode: 'add' | 'edit', item?: AlertNotificationContact) => {
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setEditingId(item.id);
      setFormData({
        contact: activeTab === 'email' ? item.email ?? '' : item.phone ?? '',
        name: item.name,
        driverId: item.driverId ?? '',
      });
    } else {
      setEditingId(null);
      setFormData({ contact: '', name: '', driverId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDriverSelect = (driverId: string) => {
    const driver = MOCK_DRIVERS.find((d) => d.id === driverId);
    if (!driver) return;
    setFormData({
      ...formData,
      driverId,
      name: `${driver.prenom} ${driver.nom}`,
      contact: activeTab === 'email' ? driver.email : driver.mobile,
    });
  };

  const handleSave = () => {
    const payload: Omit<AlertNotificationContact, 'id'> & { id?: string } = {
      id: editingId ?? undefined,
      name: formData.name,
      role: 'user',
      driverId: formData.driverId || undefined,
      vehicleIds: editingId
        ? contacts.find((c) => c.id === editingId)?.vehicleIds ?? []
        : [],
      ...(activeTab === 'email'
        ? { email: formData.contact, phone: undefined }
        : { phone: formData.contact, email: undefined }),
    };
    saveContact.mutate(payload, { onSuccess: handleCloseModal });
  };

  const handleDelete = (id: string) => {
    deleteContact.mutate(id);
  };

  const handleOpenAlertConfig = (contact: AlertNotificationContact) => {
    setSelectedContactForAlerts(contact);
    setSelectedVehiclesForAlert(contact.vehicleIds.length ? contact.vehicleIds : ['1']);
    setAlertConfigRows(
      ALERT_TYPES.slice(0, 12).map((type) => ({
        type,
        startTime: '00:00',
        endTime: '23:59',
        active: true,
      }))
    );
    setIsAlertConfigOpen(true);
  };

  const filteredEmails = emailContacts.filter(
    (e) =>
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPhones = phoneContacts.filter(
    (p) =>
      p.phone?.includes(searchTerm) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentData = activeTab === 'email' ? filteredEmails : filteredPhones;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = currentData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6">
      <div className="mb-6 flex flex-col gap-4">
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-64"
              />
            </div>
            <button
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'email' ? 'Ajouter un email' : 'Ajouter un numéro'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('email'); setCurrentPage(1); }}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'email' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Mail className="w-4 h-4" />
            <span>Adresse mail</span>
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {filteredEmails.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('phone'); setCurrentPage(1); }}
            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'phone' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Phone className="w-4 h-4" />
            <span>Numéro de téléphone</span>
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === 'phone' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {filteredPhones.length}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <p className="p-8 text-center text-gray-500">Chargement...</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {activeTab === 'email' ? 'Adresse mail' : 'Numéro de téléphone'}
                  </th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-8 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 text-sm text-gray-700">
                      {activeTab === 'email' ? item.email : item.phone}
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-700">{item.name}</td>
                    <td className="px-8 py-4 text-sm text-right space-x-4">
                      <button onClick={() => handleOpenModal('edit', item)} className="text-gray-500 hover:text-gray-800" title="Modifier">
                        <Pencil className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title="Supprimer">
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                      <button onClick={() => handleOpenAlertConfig(item)} className="text-blue-500 hover:text-blue-700" title="Configurer les alertes">
                        <Bell className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-gray-400">
                      <Car className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="font-medium text-gray-500">Aucun contact trouvé</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-6 bg-white">
          <span className="text-sm text-gray-500">
            {currentData.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, currentData.length)} sur {currentData.length}
          </span>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1 text-gray-400 disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1 text-gray-400 disabled:opacity-50">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-500 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">
                {modalMode === 'add' ? 'Ajouter' : 'Modifier'}{' '}
                {activeTab === 'email' ? 'une adresse mail' : 'un numéro portable'}
              </h2>
              <button onClick={handleCloseModal} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">Chauffeur (optionnel)</label>
                <select
                  value={formData.driverId}
                  onChange={(e) => handleDriverSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Sélectionner un chauffeur...</option>
                  {MOCK_DRIVERS.map((d) => (
                    <option key={d.id} value={d.id}>{d.prenom} {d.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type={activeTab === 'email' ? 'email' : 'tel'}
                  placeholder={activeTab === 'email' ? 'Adresse mail' : 'Numéro de téléphone'}
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={handleCloseModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button onClick={handleSave} disabled={saveContact.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isAlertConfigOpen && selectedContactForAlerts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="bg-blue-500 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-medium text-white">Configuration des alertes</h2>
                  <p className="text-sm text-blue-100">
                    {selectedContactForAlerts.name}
                  </p>
                </div>
                <button onClick={() => setIsAlertConfigOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="relative" ref={dropdownRef}>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Véhicules</label>
                  <button
                    type="button"
                    onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <span>{selectedVehiclesForAlert.length} véhicule(s) sélectionné(s)</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isVehicleDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isVehicleDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={vehicleSearchTerm}
                        onChange={(e) => setVehicleSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border-b text-sm"
                      />
                      {MOCK_VEHICLES.filter((v) =>
                        v.matricule.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
                      ).map((v) => (
                        <label key={v.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={selectedVehiclesForAlert.includes(v.id)}
                            onChange={() => {
                              setSelectedVehiclesForAlert((prev) =>
                                prev.includes(v.id) ? prev.filter((id) => id !== v.id) : [...prev, v.id]
                              );
                            }}
                          />
                          {v.matricule}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-gray-500 uppercase">
                      <th className="py-2">Type d&apos;alerte</th>
                      <th className="py-2">Début</th>
                      <th className="py-2">Fin</th>
                      <th className="py-2 text-center">Actif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alertConfigRows.map((row, idx) => (
                      <tr key={row.type} className="border-b border-gray-100">
                        <td className="py-2 pr-2">{getAlertTypeLabel(row.type)}</td>
                        <td className="py-2">
                          <input type="time" value={row.startTime} onChange={(e) => {
                            const next = [...alertConfigRows];
                            next[idx] = { ...row, startTime: e.target.value };
                            setAlertConfigRows(next);
                          }} className="border rounded px-2 py-1 text-xs" />
                        </td>
                        <td className="py-2">
                          <input type="time" value={row.endTime} onChange={(e) => {
                            const next = [...alertConfigRows];
                            next[idx] = { ...row, endTime: e.target.value };
                            setAlertConfigRows(next);
                          }} className="border rounded px-2 py-1 text-xs" />
                        </td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...alertConfigRows];
                              next[idx] = { ...row, active: !row.active };
                              setAlertConfigRows(next);
                            }}
                            className={`w-6 h-6 rounded border flex items-center justify-center mx-auto ${row.active ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}
                          >
                            {row.active && <Check className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t flex justify-end gap-2 shrink-0">
                <button onClick={() => setIsAlertConfigOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                  Fermer
                </button>
                <button
                  onClick={() => {
                    if (selectedContactForAlerts) {
                      saveContact.mutate({
                        ...selectedContactForAlerts,
                        vehicleIds: selectedVehiclesForAlert,
                      });
                    }
                    setIsAlertConfigOpen(false);
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
