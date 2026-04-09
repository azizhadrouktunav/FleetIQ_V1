import React, { useEffect, useMemo, useState, Component } from 'react';
import {
  Filter,
  ChevronDown,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  X,
  Eye,
  CheckIcon,
  FileTextIcon } from
'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid } from
'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { DateTimePicker } from './DateTimePicker';
import { TableFooter } from './TableFooter';
// --- Types ---
type FilterType = 'Véhicule' | 'Catégorie' | 'Article' | 'Département';
type SubRubrique =
'Maintenance' |
'Carburant/Coupons' |
'Pneus' |
'Location/Emprunt' |
'Documents' |
'Sinistres' |
"Factures d'achat";
interface ExpenseItem {
  id: string;
  date: string;
  description: string;
  montant: number;
  reference: string;
  subRubrique: SubRubrique;
  vehicule?: string;
  departement?: string;
  article?: string;
  fournisseur?: string;
  categorie?: string;
}
interface ChartData {
  name: string;
  value: number;
}
// --- Constants & Mock Data ---
const FILTER_TYPES: FilterType[] = [
'Véhicule',
'Catégorie',
'Article',
'Département'];

const SUB_RUBRIQUES: SubRubrique[] = [
'Maintenance',
'Carburant/Coupons',
'Pneus',
'Location/Emprunt',
'Documents',
'Sinistres',
"Factures d'achat"];

const COLORS = [
'#0ea5e9',
'#06b6d4',
'#14b8a6',
'#10b981',
'#84cc16',
'#eab308',
'#f59e0b',
'#f97316'];

const VEHICLES = [
'8125 TU 226',
'8127 TU 226',
'8126 TU 226',
'Tepee FM4200',
'8312 TU 193'];

const DEPARTMENTS = [
'Transport',
'Logistique',
'Commercial',
'Direction',
'Technique'];

const ARTICLES = [
'Pneu Michelin 205/55 R16',
'Huile Moteur 5W30 5L',
'Filtre à Air',
'Plaquettes de frein'];

const CATEGORIES = ['Poids Lourd', 'Utilitaire', 'Commercial', 'Direction'];
const SUPPLIERS = [
'AutoParts Pro',
'ITALCAR S.A',
'Shell',
'Total Energies',
'Michelin'];

// Generate comprehensive mock data
const generateMockExpenses = (): ExpenseItem[] => {
  const expenses: ExpenseItem[] = [];
  let id = 1;
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');
  // Generate expenses for each sub-rubrique
  SUB_RUBRIQUES.forEach((subRubrique) => {
    // Generate 15-25 expenses per sub-rubrique
    const count = Math.floor(Math.random() * 11) + 15;
    for (let i = 0; i < count; i++) {
      const randomDate = new Date(
        startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
      );
      const vehicule = VEHICLES[Math.floor(Math.random() * VEHICLES.length)];
      const departement =
      DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
      const article = ARTICLES[Math.floor(Math.random() * ARTICLES.length)];
      const fournisseur =
      SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
      const categorie =
      CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      let description = '';
      let montant = 0;
      switch (subRubrique) {
        case 'Maintenance':
          description = [
          'Vidange périodique',
          'Révision complète',
          'Entretien moteur'][
          Math.floor(Math.random() * 3)];
          montant = Math.floor(Math.random() * 500) + 100;
          break;
        case 'Carburant/Coupons':
          description = [
          'Carte de remplissage',
          'Carnet de remplissage',
          'Alimentation'][
          Math.floor(Math.random() * 3)];
          montant = Math.floor(Math.random() * 300) + 50;
          break;
        case 'Pneus':
          description = [
          'Achat pneus',
          'Installation pneus',
          'Réparation pneu'][
          Math.floor(Math.random() * 3)];
          montant = Math.floor(Math.random() * 600) + 200;
          break;
        case 'Location/Emprunt':
          description = 'Location véhicule';
          montant = Math.floor(Math.random() * 400) + 150;
          break;
        case 'Documents':
          description = ['Assurance', 'Vignette', 'Contrôle technique'][
          Math.floor(Math.random() * 3)];

          montant = Math.floor(Math.random() * 800) + 200;
          break;
        case 'Sinistres':
          description = 'Réparation sinistre';
          montant = Math.floor(Math.random() * 2000) + 500;
          break;
        case "Factures d'achat":
          description = 'Facture fournisseur';
          montant = Math.floor(Math.random() * 1000) + 100;
          break;
      }
      expenses.push({
        id: `EXP-${String(id).padStart(4, '0')}`,
        date: randomDate.toISOString().split('T')[0],
        description,
        montant,
        reference: `REF-${String(id).padStart(5, '0')}`,
        subRubrique,
        vehicule,
        departement,
        article,
        fournisseur,
        categorie
      });
      id++;
    }
  });
  return expenses.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};
const MOCK_EXPENSES = generateMockExpenses();
// --- Helper Components ---
function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange





}: {label: string;options: string[];selected: string[];onChange: (selected: string[]) => void;}) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };
  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };
  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-600 mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 p-3 pr-10 shadow-sm text-left flex items-center justify-between">
        
        <span className="truncate">
          {selected.length === 0 ?
          `Sélectionner ${label.toLowerCase()}...` :
          selected.length === 1 ?
          selected[0] :
          `${selected.length} sélectionné(s)`}
        </span>
        <div className="flex items-center gap-2">
          {selected.length > 0 &&
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-cyan-500 rounded-full">
              {selected.length}
            </span>
          }
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          
        </div>
      </button>

      <AnimatePresence>
        {isOpen &&
        <>
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
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)} />
          
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
            className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            
              <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-2">
                <button
                type="button"
                onClick={toggleAll}
                className="w-full text-left px-3 py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors">
                
                  {selected.length === options.length ?
                'Tout désélectionner' :
                'Tout sélectionner'}
                </button>
              </div>
              <div className="p-2">
                {options.map((option) =>
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors">
                
                    <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(option) ? 'bg-cyan-500 border-cyan-500' : 'border-slate-300'}`}>
                  
                      {selected.includes(option) &&
                  <CheckIcon className="w-3 h-3 text-white" />
                  }
                    </div>
                    <span className="truncate">{option}</span>
                  </button>
              )}
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}
function ExpenseLinesModal({
  isOpen,
  onClose,
  title,
  subtitle,
  expenses






}: {isOpen: boolean;onClose: () => void;title: string;subtitle: string;expenses: ExpenseItem[];}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen]);
  if (!isOpen) return null;
  const totalItems = expenses.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = expenses.slice(
    startIndex,
    startIndex + itemsPerPage
  );
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="bg-[#0ea5e9] px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-sky-100 mt-1">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Date
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Référence
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    Description
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase text-right">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedExpenses.map((expense) =>
                <tr
                  key={expense.id}
                  className="hover:bg-slate-50 transition-colors">
                  
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">
                      {expense.reference}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">
                      {expense.description}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-800 text-right">
                      {expense.montant.toLocaleString('fr-TN')} DT
                    </td>
                  </tr>
                )}
                {paginatedExpenses.length === 0 &&
                <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Aucune dépense trouvée
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            onExportPdf={() => console.log('Export PDF - Detail')}
            onExportExcel={() => console.log('Export Excel - Detail')} />
          
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
function DrillDownModal({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  entityLabel,
  onViewDetails











}: {isOpen: boolean;onClose: () => void;title: string;subtitle: string;data: {name: string;total: number;}[];entityLabel: string;onViewDetails: (name: string) => void;}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen]);
  if (!isOpen) return null;
  const totalItems = data.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="bg-[#0ea5e9] px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-sky-100 mt-1">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                    {entityLabel}
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase text-right">
                    Total
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-600 uppercase text-center w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((item) =>
                <tr
                  key={item.name}
                  className="hover:bg-slate-50 transition-colors">
                  
                    <td className="py-3 px-4 text-sm font-medium text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-800 text-right">
                      {item.total.toLocaleString('fr-TN')} DT
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                      onClick={() => onViewDetails(item.name)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors inline-flex"
                      title={`Voir détails pour ${item.name}`}>
                      
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
                {paginatedData.length === 0 &&
                <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      Aucune donnée trouvée
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <TableFooter
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            onExportPdf={() => console.log('Export PDF')}
            onExportExcel={() => console.log('Export Excel')} />
          
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}
// --- Main Component ---
export function GeneralExpensesContent() {
  // Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedFilterType, setSelectedFilterType] =
  useState<FilterType>('Véhicule');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  // Results State
  const [hasFiltered, setHasFiltered] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Modals State
  const [expenseLinesModalOpen, setExpenseLinesModalOpen] = useState(false);
  const [expenseLinesTitle, setExpenseLinesTitle] = useState('');
  const [expenseLinesSubtitle, setExpenseLinesSubtitle] = useState('');
  const [expenseLinesData, setExpenseLinesData] = useState<ExpenseItem[]>([]);
  const [drillDownModalOpen, setDrillDownModalOpen] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownSubtitle, setDrillDownSubtitle] = useState('');
  const [drillDownData, setDrillDownData] = useState<
    {
      name: string;
      total: number;
    }[]>(
    []);
  const [drillDownType, setDrillDownType] = useState<'Article' | 'Véhicule'>(
    'Article'
  );
  const [drillDownParentEntity, setDrillDownParentEntity] = useState('');
  // Get available entities based on selected filter type
  const availableEntities = useMemo(() => {
    switch (selectedFilterType) {
      case 'Véhicule':
        return VEHICLES;
      case 'Département':
        return DEPARTMENTS;
      case 'Article':
        return ARTICLES;
      case 'Catégorie':
        return CATEGORIES;
      default:
        return [];
    }
  }, [selectedFilterType]);
  // Handle filter type change
  const handleFilterTypeChange = (type: FilterType) => {
    setSelectedFilterType(type);
    setSelectedEntities([]);
  };
  // Handle filter button click
  const handleFilter = () => {
    if (selectedEntities.length === 0) {
      return;
    }
    let filtered = MOCK_EXPENSES;
    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((item) => item.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((item) => item.date <= endDate);
    }
    // Filter by selected entities
    filtered = filtered.filter((item) => {
      switch (selectedFilterType) {
        case 'Véhicule':
          return item.vehicule && selectedEntities.includes(item.vehicule);
        case 'Département':
          return item.departement && selectedEntities.includes(item.departement);
        case 'Article':
          return item.article && selectedEntities.includes(item.article);
        case 'Catégorie':
          return item.categorie && selectedEntities.includes(item.categorie);
        default:
          return false;
      }
    });
    setFilteredExpenses(filtered);
    setHasFiltered(true);
    setCurrentPage(1);
  };
  // Calculate charts and table data
  const pieData = useMemo<ChartData[]>(() => {
    if (!hasFiltered) return [];
    const entityMap = new Map<string, number>();
    filteredExpenses.forEach((expense) => {
      let entityName = '';
      switch (selectedFilterType) {
        case 'Véhicule':
          entityName = expense.vehicule || '';
          break;
        case 'Département':
          entityName = expense.departement || '';
          break;
        case 'Article':
          entityName = expense.article || '';
          break;
        case 'Catégorie':
          entityName = expense.categorie || '';
          break;
      }
      if (entityName) {
        entityMap.set(
          entityName,
          (entityMap.get(entityName) || 0) + expense.montant
        );
      }
    });
    return Array.from(entityMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [hasFiltered, filteredExpenses, selectedFilterType]);
  const barData = useMemo<ChartData[]>(() => {
    if (!hasFiltered || selectedFilterType !== 'Véhicule') return [];
    const subRubriqueMap = new Map<string, number>();
    SUB_RUBRIQUES.forEach((sr) => subRubriqueMap.set(sr, 0));
    filteredExpenses.forEach((expense) => {
      subRubriqueMap.set(
        expense.subRubrique,
        (subRubriqueMap.get(expense.subRubrique) || 0) + expense.montant
      );
    });
    return Array.from(subRubriqueMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  }, [hasFiltered, filteredExpenses, selectedFilterType]);
  const tableData = useMemo<any[]>(() => {
    if (!hasFiltered) return [];
    if (selectedFilterType === 'Véhicule') {
      return SUB_RUBRIQUES.map((subRubrique) => {
        const row: any = {
          subRubrique
        };
        let total = 0;
        selectedEntities.forEach((entity) => {
          const sum = filteredExpenses.
          filter(
            (expense) =>
            expense.subRubrique === subRubrique &&
            expense.vehicule === entity
          ).
          reduce((acc, e) => acc + e.montant, 0);
          row[entity] = sum;
          total += sum;
        });
        row.Total = total;
        return row;
      });
    } else if (selectedFilterType === 'Article') {
      return selectedEntities.map((article) => {
        const total = filteredExpenses.
        filter((e) => e.article === article).
        reduce((acc, e) => acc + e.montant, 0);
        return {
          article,
          Total: total
        };
      });
    } else if (selectedFilterType === 'Catégorie') {
      return selectedEntities.map((categorie) => {
        const total = filteredExpenses.
        filter((e) => e.categorie === categorie).
        reduce((acc, e) => acc + e.montant, 0);
        return {
          categorie,
          Total: total
        };
      });
    } else if (selectedFilterType === 'Département') {
      return selectedEntities.map((departement) => {
        const total = filteredExpenses.
        filter((e) => e.departement === departement).
        reduce((acc, e) => acc + e.montant, 0);
        return {
          departement,
          Total: total
        };
      });
    }
    return [];
  }, [hasFiltered, filteredExpenses, selectedEntities, selectedFilterType]);
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.montant, 0);
  }, [filteredExpenses]);
  // --- Action Handlers ---
  const handleViewVehiculeSubRubrique = (subRubrique: SubRubrique) => {
    const expenses = filteredExpenses.filter(
      (e) =>
      e.subRubrique === subRubrique &&
      e.vehicule &&
      selectedEntities.includes(e.vehicule)
    );
    setExpenseLinesTitle(`Détails des dépenses`);
    setExpenseLinesSubtitle(`${subRubrique} - Véhicules sélectionnés`);
    setExpenseLinesData(expenses);
    setExpenseLinesModalOpen(true);
  };
  const handleViewArticle = (article: string) => {
    const expenses = filteredExpenses.filter(
      (e) => e.article === article && e.subRubrique === "Factures d'achat"
    );
    setExpenseLinesTitle(`Factures d'achat`);
    setExpenseLinesSubtitle(`Article: ${article}`);
    setExpenseLinesData(expenses);
    setExpenseLinesModalOpen(true);
  };
  const handleViewCategorie = (categorie: string) => {
    const catExpenses = filteredExpenses.filter(
      (e) => e.categorie === categorie
    );
    const articleMap = new Map<string, number>();
    catExpenses.forEach((e) => {
      if (e.article) {
        articleMap.set(e.article, (articleMap.get(e.article) || 0) + e.montant);
      }
    });
    const data = Array.from(articleMap.entries()).map(([name, total]) => ({
      name,
      total
    }));
    setDrillDownTitle(`Détails par catégorie`);
    setDrillDownSubtitle(`Catégorie: ${categorie}`);
    setDrillDownData(data);
    setDrillDownType('Article');
    setDrillDownParentEntity(categorie);
    setDrillDownModalOpen(true);
  };
  const handleViewDepartement = (departement: string) => {
    const depExpenses = filteredExpenses.filter(
      (e) => e.departement === departement
    );
    const vehiculeMap = new Map<string, number>();
    depExpenses.forEach((e) => {
      if (e.vehicule) {
        vehiculeMap.set(
          e.vehicule,
          (vehiculeMap.get(e.vehicule) || 0) + e.montant
        );
      }
    });
    const data = Array.from(vehiculeMap.entries()).map(([name, total]) => ({
      name,
      total
    }));
    setDrillDownTitle(`Détails par département`);
    setDrillDownSubtitle(`Département: ${departement}`);
    setDrillDownData(data);
    setDrillDownType('Véhicule');
    setDrillDownParentEntity(departement);
    setDrillDownModalOpen(true);
  };
  const handleDrillDownViewDetails = (name: string) => {
    if (drillDownType === 'Article') {
      const expenses = filteredExpenses.filter(
        (e) =>
        e.categorie === drillDownParentEntity &&
        e.article === name &&
        e.subRubrique === "Factures d'achat"
      );
      setExpenseLinesTitle(`Factures d'achat`);
      setExpenseLinesSubtitle(
        `Catégorie: ${drillDownParentEntity} - Article: ${name}`
      );
      setExpenseLinesData(expenses);
      setExpenseLinesModalOpen(true);
    } else if (drillDownType === 'Véhicule') {
      const expenses = filteredExpenses.filter(
        (e) => e.departement === drillDownParentEntity && e.vehicule === name
      );
      setExpenseLinesTitle(`Détails des dépenses`);
      setExpenseLinesSubtitle(
        `Département: ${drillDownParentEntity} - Véhicule: ${name}`
      );
      setExpenseLinesData(expenses);
      setExpenseLinesModalOpen(true);
    }
  };
  const totalItems = tableData.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTableData = tableData.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      <div className="p-6 max-w-7xl mx-auto w-full space-y-8">
        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Date Inputs */}
            <DateTimePicker
              label="Date début"
              value={startDate}
              onChange={setStartDate}
              placeholder="Sélectionner date début" />
            
            <DateTimePicker
              label="Date fin"
              value={endDate}
              onChange={setEndDate}
              placeholder="Sélectionner date fin" />
            

            {/* Filter Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Type</label>
              <div className="relative">
                <select
                  value={selectedFilterType}
                  onChange={(e) =>
                  handleFilterTypeChange(e.target.value as FilterType)
                  }
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3 pr-8 shadow-sm">
                  
                  {FILTER_TYPES.map((type) =>
                  <option key={type} value={type}>
                      {type}
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Multi-Select Entity Filter */}
            <MultiSelectDropdown
              label={selectedFilterType}
              options={availableEntities}
              selected={selectedEntities}
              onChange={setSelectedEntities} />
            
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleFilter}
              disabled={selectedEntities.length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
              
              <Filter className="w-5 h-5" />
              Filtrer
            </button>
          </div>
        </div>

        {/* Results Section */}
        {!hasFiltered ?
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <FileTextIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Aucun résultat à afficher
            </h3>
            <p className="text-slate-500 text-center max-w-md">
              Sélectionnez un type de filtre et au moins une entité, puis
              cliquez sur "Filtrer" pour afficher les dépenses générales.
            </p>
          </div> :

        <div className="space-y-6">
            {/* Total Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl text-slate-600 font-light">
                  Total dépenses :
                </h2>
                <span className="text-4xl font-bold text-slate-800">
                  {totalAmount.toLocaleString('fr-TN')}
                </span>
                <span className="text-xl text-slate-400 font-medium">DT</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div
            className={`grid grid-cols-1 ${selectedFilterType === 'Véhicule' ? 'lg:grid-cols-2' : ''} gap-6`}>
            
              {/* Pie Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <PieChartIcon className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-bold text-slate-700">
                    Répartition par {selectedFilterType.toLowerCase()}
                  </h3>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value">
                      
                        {pieData.map((entry, index) =>
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]} />

                      )}
                      </Pie>
                      <Tooltip
                      formatter={(value: number) => [
                      `${value.toLocaleString('fr-TN')} DT`,
                      'Montant']
                      }
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} />
                    
                      <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle" />
                    
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart - Only for Véhicule */}
              {selectedFilterType === 'Véhicule' &&
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChartIcon className="w-5 h-5 text-cyan-500" />
                    <h3 className="text-lg font-bold text-slate-700">
                      Dépenses par sous-rubrique
                    </h3>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                    layout="vertical"
                    data={barData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 120,
                      bottom: 5
                    }}>
                    
                        <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#e2e8f0" />
                    
                        <XAxis type="number" hide />
                        <YAxis
                      dataKey="name"
                      type="category"
                      width={110}
                      tick={{
                        fill: '#64748b',
                        fontSize: 12
                      }}
                      axisLine={false}
                      tickLine={false} />
                    
                        <Tooltip
                      cursor={{
                        fill: '#f1f5f9'
                      }}
                      formatter={(value: number) => [
                      `${value.toLocaleString('fr-TN')} DT`,
                      'Montant']
                      }
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} />
                    
                        <Bar
                      dataKey="value"
                      fill="#0ea5e9"
                      radius={[0, 4, 4, 0]}
                      barSize={20} />
                    
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
            }
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedFilterType === 'Véhicule' ?
                'Détails par sous-rubrique' :
                `Détails par ${selectedFilterType.toLowerCase()}`}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {selectedFilterType === 'Véhicule' ?
                    <>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase sticky left-0 bg-slate-50">
                            Sous-rubrique
                          </th>
                          {selectedEntities.map((entity) =>
                      <th
                        key={entity}
                        className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                        
                              {entity}
                            </th>
                      )}
                          <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                            Total
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase w-24">
                            Action
                          </th>
                        </> :

                    <>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                            {selectedFilterType}
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                            Total
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase w-24">
                            Action
                          </th>
                        </>
                    }
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedTableData.map((row, idx) =>
                  <tr key={idx} className="hover:bg-slate-50">
                        {selectedFilterType === 'Véhicule' ?
                    <>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800 sticky left-0 bg-white">
                              {row.subRubrique}
                            </td>
                            {selectedEntities.map((entity) =>
                      <td
                        key={entity}
                        className="px-6 py-4 text-sm text-slate-700 text-right">
                        
                                {(row[entity] as number || 0).toLocaleString(
                          'fr-TN'
                        )}{' '}
                                DT
                              </td>
                      )}
                            <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                              {(row.Total as number || 0).toLocaleString(
                          'fr-TN'
                        )}{' '}
                              DT
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                          onClick={() =>
                          handleViewVehiculeSubRubrique(row.subRubrique)
                          }
                          className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors inline-flex"
                          title={`Voir détails pour ${row.subRubrique}`}>
                          
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </> :
                    selectedFilterType === 'Article' ?
                    <>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                              {row.article}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                              {(row.Total as number || 0).toLocaleString(
                          'fr-TN'
                        )}{' '}
                              DT
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                          onClick={() => handleViewArticle(row.article)}
                          className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors inline-flex"
                          title={`Voir factures pour ${row.article}`}>
                          
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </> :
                    selectedFilterType === 'Catégorie' ?
                    <>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                              {row.categorie}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                              {(row.Total as number || 0).toLocaleString(
                          'fr-TN'
                        )}{' '}
                              DT
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                          onClick={() =>
                          handleViewCategorie(row.categorie)
                          }
                          className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors inline-flex"
                          title={`Voir articles pour ${row.categorie}`}>
                          
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </> :

                    <>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                              {row.departement}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-800 text-right">
                              {(row.Total as number || 0).toLocaleString(
                          'fr-TN'
                        )}{' '}
                              DT
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                          onClick={() =>
                          handleViewDepartement(row.departement)
                          }
                          className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors inline-flex"
                          title={`Voir véhicules pour ${row.departement}`}>
                          
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                    }
                      </tr>
                  )}
                    {paginatedTableData.length === 0 &&
                  <tr>
                        <td
                      colSpan={
                      selectedFilterType === 'Véhicule' ?
                      selectedEntities.length + 3 :
                      3
                      }
                      className="px-6 py-8 text-center text-slate-500">
                      
                          Aucune dépense trouvée
                        </td>
                      </tr>
                  }
                  </tbody>
                </table>
              </div>
              <TableFooter
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(val) => {
                setItemsPerPage(val);
                setCurrentPage(1);
              }}
              onExportPdf={() => console.log('Export PDF Expenses')}
              onExportExcel={() => console.log('Export Excel Expenses')} />
            
            </div>
          </div>
        }
      </div>

      {/* Modals */}
      <ExpenseLinesModal
        isOpen={expenseLinesModalOpen}
        onClose={() => setExpenseLinesModalOpen(false)}
        title={expenseLinesTitle}
        subtitle={expenseLinesSubtitle}
        expenses={expenseLinesData} />
      

      <DrillDownModal
        isOpen={drillDownModalOpen}
        onClose={() => setDrillDownModalOpen(false)}
        title={drillDownTitle}
        subtitle={drillDownSubtitle}
        data={drillDownData}
        entityLabel={drillDownType}
        onViewDetails={handleDrillDownViewDetails} />
      
    </div>);

}