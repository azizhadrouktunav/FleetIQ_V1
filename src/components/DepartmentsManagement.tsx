import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, ChevronDown } from 'lucide-react';
interface Department {
  id: string;
  name: string;
  type: 'simple' | 'groupe';
  level: 'racine' | 'branche';
  parentId?: string;
  vehicles: string[];
}
const MOCK_VEHICLES = [
'Fleet-001',
'Fleet-002',
'Fleet-003',
'Fleet-004',
'Fleet-005',
'Fleet-006',
'Fleet-007',
'Fleet-008',
'Fleet-009',
'Fleet-010',
'Fleet-011',
'Fleet-012',
'Fleet-013',
'Fleet-014',
'Fleet-015'];

const INITIAL_DEPARTMENTS: Department[] = [
{
  id: '1',
  name: 'Transport',
  type: 'groupe',
  level: 'racine',
  vehicles: ['Fleet-001', 'Fleet-002', 'Fleet-003']
},
{
  id: '2',
  name: 'Logistique',
  type: 'simple',
  level: 'branche',
  parentId: '1',
  vehicles: ['Fleet-004', 'Fleet-005']
},
{
  id: '3',
  name: 'Commercial',
  type: 'simple',
  level: 'racine',
  vehicles: ['Fleet-006']
},
{
  id: '4',
  name: 'Direction',
  type: 'groupe',
  level: 'racine',
  vehicles: ['Fleet-007', 'Fleet-008', 'Fleet-009', 'Fleet-010']
},
{
  id: '5',
  name: 'Technique',
  type: 'simple',
  level: 'branche',
  parentId: '4',
  vehicles: ['Fleet-011', 'Fleet-012']
}];

interface DeptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Department, 'id'>) => void;
  editingDept?: Department | null;
  departments: Department[];
}
function DepartmentModal({
  isOpen,
  onClose,
  onSave,
  editingDept,
  departments
}: DeptModalProps) {
  const [name, setName] = useState(editingDept?.name || '');
  const [nameError, setNameError] = useState(false);
  const [type, setType] = useState<'simple' | 'groupe'>(
    editingDept?.type || 'simple'
  );
  const [level, setLevel] = useState<'racine' | 'branche'>(
    editingDept?.level || 'racine'
  );
  const [parentId, setParentId] = useState(editingDept?.parentId || '');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(
    editingDept?.vehicles || []
  );
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setName(editingDept?.name || '');
      setNameError(false);
      setType(editingDept?.type || 'simple');
      setLevel(editingDept?.level || 'racine');
      setParentId(editingDept?.parentId || '');
      setSelectedVehicles(editingDept?.vehicles || []);
    }
  }, [isOpen, editingDept]);
  const handleSave = () => {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    onSave({
      name,
      type,
      level,
      parentId: level === 'branche' ? parentId : undefined,
      vehicles: selectedVehicles
    });
    onClose();
  };
  const toggleVehicle = (v: string) => {
    setSelectedVehicles((prev) =>
    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };
  const availableParents = departments.filter((d) => d.id !== editingDept?.id);
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
            y: 10
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.95,
            opacity: 0,
            y: 10
          }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
          
          {/* Header */}
          <div className="bg-sky-500 px-5 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {editingDept ?
              'Mise à jour du département' :
              'Ajouter un département'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-sky-100 transition-colors">
              
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Nom */}
            <div>
              <div
                className={`border rounded-lg px-3 pt-2 pb-2 transition-colors ${nameError ? 'border-red-500' : 'border-slate-300 focus-within:border-sky-500'}`}>
                
                <label className="block text-xs text-slate-500 mb-1">Nom</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(false);
                  }}
                  className="w-full text-sm text-slate-800 focus:outline-none"
                  placeholder="" />
                
              </div>
              {nameError &&
              <p className="text-xs text-red-500 mt-1">Please type name</p>
              }
            </div>

            {/* Type département */}
            <div>
              <p className="text-sm text-slate-700 mb-2">
                Choisir le type département
              </p>
              <div className="space-y-2">
                {(['simple', 'groupe'] as const).map((t) =>
                <label
                  key={t}
                  className="flex items-center gap-3 cursor-pointer">
                  
                    <div
                    onClick={() => setType(t)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${type === t ? 'border-sky-500' : 'border-slate-300'}`}>
                    
                      {type === t &&
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    }
                    </div>
                    <span className="text-sm text-slate-700 capitalize">
                      {t === 'simple' ? 'Simple' : 'Groupe'}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Niveau département */}
            <div>
              <p className="text-sm text-slate-700 mb-2">
                Choisir le niveau département
              </p>
              <div className="space-y-2">
                {(['racine', 'branche'] as const).map((l) =>
                <label
                  key={l}
                  className="flex items-center gap-3 cursor-pointer">
                  
                    <div
                    onClick={() => setLevel(l)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${level === l ? 'border-sky-500' : 'border-slate-300'}`}>
                    
                      {level === l &&
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    }
                    </div>
                    <span className="text-sm text-slate-700 capitalize">
                      {l === 'racine' ? 'Racine' : 'Branche'}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Parent département (si Branche) */}
            {level === 'branche' &&
            <div>
                <div className="border border-slate-300 rounded-lg px-3 pt-2 pb-2 focus-within:border-sky-500 transition-colors">
                  <label className="block text-xs text-slate-500 mb-1">
                    Département
                  </label>
                  <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full text-sm text-slate-800 focus:outline-none bg-transparent">
                  
                    <option value="">Sélectionner...</option>
                    {availableParents.map((d) =>
                  <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                  )}
                  </select>
                </div>
              </div>
            }

            {/* Véhicules */}
            <div className="relative">
              <div className="border border-slate-300 rounded-lg px-3 pt-2 pb-2 focus-within:border-sky-500 transition-colors">
                <label className="block text-xs text-slate-500 mb-1">
                  Véhicules
                </label>
                <button
                  type="button"
                  onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
                  className="w-full flex items-center justify-between text-sm text-slate-700 focus:outline-none">
                  
                  <span className="truncate">
                    {selectedVehicles.length === 0 ?
                    'Sélectionner des véhicules...' :
                    `${selectedVehicles.length} véhicule(s) sélectionné(s)`}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${showVehicleDropdown ? 'rotate-180' : ''}`} />
                  
                </button>
              </div>
              {showVehicleDropdown &&
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-10 max-h-40 overflow-y-auto">
                  {MOCK_VEHICLES.map((v) =>
                <label
                  key={v}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer">
                  
                      <input
                    type="checkbox"
                    checked={selectedVehicles.includes(v)}
                    onChange={() => toggleVehicle(v)}
                    className="w-3.5 h-3.5 text-sky-500 rounded" />
                  
                      <span className="text-sm text-slate-700">{v}</span>
                    </label>
                )}
                </div>
              }
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 flex justify-end">
            <button
              onClick={handleSave}
              className={`text-sm font-bold transition-colors ${name.trim() ? 'text-slate-800 hover:text-sky-600' : 'text-slate-400 cursor-not-allowed'}`}>
              
              {editingDept ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
export function DepartmentsManagement() {
  const [departments, setDepartments] =
  useState<Department[]>(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const filtered = departments.filter((d) =>
  d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSave = (data: Omit<Department, 'id'>) => {
    if (editingDept) {
      setDepartments((prev) =>
      prev.map((d) =>
      d.id === editingDept.id ?
      {
        ...d,
        ...data
      } :
      d
      )
      );
    } else {
      setDepartments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...data
      }]
      );
    }
    setEditingDept(null);
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    }
  };
  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    return departments.find((d) => d.id === parentId)?.name || null;
  };
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestion des Départements
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gérez les départements et leurs véhicules associés
            </p>
          </div>
          <button
            onClick={() => {
              setEditingDept(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
            
            <Plus className="w-4 h-4" />
            Ajouter un département
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">
              {departments.length}
            </p>
          </div>
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <span className="text-sky-600 font-bold text-sm">#</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Groupes</p>
            <p className="text-3xl font-bold text-sky-600 mt-1">
              {departments.filter((d) => d.type === 'groupe').length}
            </p>
          </div>
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <span className="text-sky-600 font-bold text-sm">G</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Véhicules assignés
            </p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {new Set(departments.flatMap((d) => d.vehicles)).size}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-sm">V</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un département..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400" />
              
            </div>
          </div>

          {/* Table content */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Département
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Véhicules
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ?
                <tr>
                    <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-slate-400 text-sm">
                    
                      Aucun département trouvé
                    </td>
                  </tr> :

                filtered.map((dept, idx) =>
                <motion.tr
                  key={dept.id}
                  initial={{
                    opacity: 0,
                    y: 4
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    delay: idx * 0.03
                  }}
                  className="hover:bg-slate-50 transition-colors">
                  
                      {/* Département */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${dept.type === 'groupe' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                        
                            {dept.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {dept.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${dept.type === 'groupe' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                            
                                {dept.type === 'groupe' ? 'Groupe' : 'Simple'}
                              </span>
                              <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${dept.level === 'racine' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            
                                {dept.level === 'racine' ?
                            'Racine' :
                            `Branche${getParentName(dept.parentId) ? ` → ${getParentName(dept.parentId)}` : ''}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Véhicules */}
                      <td className="px-6 py-4">
                        {dept.vehicles.length === 0 ?
                    <span className="text-xs text-slate-400 italic">
                            Aucun véhicule
                          </span> :

                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {dept.vehicles.slice(0, 4).map((v) =>
                      <span
                        key={v}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        
                                {v}
                              </span>
                      )}
                            {dept.vehicles.length > 4 &&
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                                +{dept.vehicles.length - 4}
                              </span>
                      }
                          </div>
                    }
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                        onClick={() => {
                          setEditingDept(dept);
                          setShowModal(true);
                        }}
                        className="p-1.5 rounded text-sky-500 hover:bg-sky-50 transition-colors"
                        title="Modifier">
                        
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Supprimer">
                        
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DepartmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDept(null);
        }}
        onSave={handleSave}
        editingDept={editingDept}
        departments={departments} />
      
    </div>);

}