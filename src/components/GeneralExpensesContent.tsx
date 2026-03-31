import React, { useEffect, useMemo, useState } from 'react';
import {
  Filter,
  ChevronDown,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Activity } from
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
  CartesianGrid,
  LineChart,
  Line } from
'recharts';
import { DateTimePicker } from './DateTimePicker';
import { TableFooter } from './TableFooter';
// --- Types ---
type FilterType =
'vehicule' |
'fournisseur' |
'categorie' |
'modele' |
'compte' |
'departement' |
'chauffeur';
type ExpenseCategory =
'Maintenance' |
'Coupons' |
'Pneus' |
'Location' |
'Documents' |
'Sinistres' |
'Fournisseurs';
interface Expense {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  entityType: FilterType;
  entityName: string;
}
interface ChartData {
  name: string;
  value: number;
  color?: string;
}
interface TimeSeriesData {
  date: string;
  amount: number;
}
// --- Constants & Mock Data ---
const FILTER_OPTIONS: {
  value: FilterType;
  label: string;
}[] = [
{
  value: 'vehicule',
  label: 'Véhicule'
},
{
  value: 'fournisseur',
  label: 'Fournisseur'
},
{
  value: 'categorie',
  label: 'Catégorie'
},
{
  value: 'modele',
  label: 'Modèle'
},
{
  value: 'compte',
  label: 'Compte'
},
{
  value: 'departement',
  label: 'Département'
},
{
  value: 'chauffeur',
  label: 'Chauffeur'
}];

const COLORS = [
'#0088FE',
'#00C49F',
'#FFBB28',
'#FF8042',
'#8884d8',
'#82ca9d',
'#ffc658',
'#00BCD4'];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
'Maintenance',
'Coupons',
'Pneus',
'Location',
'Documents',
'Sinistres',
'Fournisseurs'];

// Mock Data Generator
const generateMockData = (): Expense[] => {
  const data: Expense[] = [];
  const entities: Record<FilterType, string[]> = {
    vehicule: [
    '8125 TU 226',
    '8127 TU 226',
    '8126 TU 226',
    'Tepee FM4200',
    'Clio 5544'],

    fournisseur: ['Total Energies', 'Shell', 'Michelin', 'Renault Service'],
    categorie: ['Poids Lourd', 'Utilitaire', 'Commercial', 'Direction'],
    modele: ['Clio 5', 'Partner', 'Master', 'Berlingo'],
    compte: ['Compte Principal', 'Caisse', 'Carte Corporate'],
    departement: ['Logistique', 'Commercial', 'Direction', 'Technique'],
    chauffeur: [
    'Jean Dupont',
    'Marie Martin',
    'Pierre Durand',
    'Sophie Bernard']

  };
  const startDate = new Date('2025-01-01');
  for (let i = 0; i < 200; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 365));
    const filterType = Object.keys(entities)[
    Math.floor(Math.random() * Object.keys(entities).length)] as
    FilterType;
    const entityName =
    entities[filterType][
    Math.floor(Math.random() * entities[filterType].length)];

    data.push({
      id: `EXP-${i}`,
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 1000) + 50,
      category:
      EXPENSE_CATEGORIES[
      Math.floor(Math.random() * EXPENSE_CATEGORIES.length)],

      entityType: filterType,
      entityName: entityName
    });
  }
  return data.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};
const MOCK_DATA = generateMockData();
// --- Helper Functions ---
const getAvailableEntities = (type: FilterType): string[] => {
  const entities = new Set<string>();
  MOCK_DATA.forEach((item) => {
    if (item.entityType === type) {
      entities.add(item.entityName);
    }
  });
  if (entities.size === 0) {
    if (type === 'vehicule')
    return ['8125 TU 226', '8127 TU 226', '8126 TU 226', 'Tepee FM4200'];
    if (type === 'fournisseur') return ['Total Energies', 'Shell', 'Michelin'];
    return ['Option 1', 'Option 2', 'Option 3'];
  }
  return Array.from(entities).sort();
};
export function GeneralExpensesContent() {
  // Filter State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedFilterType, setSelectedFilterType] =
  useState<FilterType>('vehicule');
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  // Results State - Show results by default
  const [totalAmount, setTotalAmount] = useState(0);
  const [pieData, setPieData] = useState<ChartData[]>([]);
  const [barData, setBarData] = useState<ChartData[]>([]);
  const [lineData, setLineData] = useState<TimeSeriesData[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // Derived options for the second dropdown
  const entityOptions = useMemo(
    () => getAvailableEntities(selectedFilterType),
    [selectedFilterType]
  );
  // Initialize with data on mount
  useEffect(() => {
    calculateStats();
  }, []);
  const calculateStats = () => {
    // Filter logic
    let filtered = MOCK_DATA;
    if (startDate) {
      filtered = filtered.filter((item) => item.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((item) => item.date <= endDate);
    }
    filtered = filtered.filter((item) => item.entityType === selectedFilterType);
    if (selectedEntity && selectedEntity !== 'all') {
      filtered = filtered.filter((item) => item.entityName === selectedEntity);
    }
    // 1. Total Amount
    const total = filtered.reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(total);
    // 2. Pie Chart Data (Distribution by Entity Name)
    const pieMap = new Map<string, number>();
    filtered.forEach((item) => {
      const current = pieMap.get(item.entityName) || 0;
      pieMap.set(item.entityName, current + item.amount);
    });
    const pieChartData: ChartData[] = Array.from(pieMap.entries()).map(
      ([name, value]) => ({
        name,
        value
      })
    );
    setPieData(pieChartData);
    // 3. Bar Chart Data (Distribution by Category/Sub-rubrique)
    const barMap = new Map<string, number>();
    EXPENSE_CATEGORIES.forEach((cat) => barMap.set(cat, 0));
    filtered.forEach((item) => {
      const current = barMap.get(item.category) || 0;
      barMap.set(item.category, current + item.amount);
    });
    const barChartData: ChartData[] = Array.from(barMap.entries()).map(
      ([name, value]) => ({
        name,
        value
      })
    );
    setBarData(barChartData);
    // 4. Line Chart Data (Evolution over time)
    const lineMap = new Map<string, number>();
    filtered.forEach((item) => {
      const current = lineMap.get(item.date) || 0;
      lineMap.set(item.date, current + item.amount);
    });
    const lineChartData: TimeSeriesData[] = Array.from(lineMap.entries()).
    sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()).
    map(([date, amount]) => ({
      date,
      amount
    }));
    setLineData(lineChartData);
    setFilteredExpenses(filtered);
    setCurrentPage(1);
  };
  const handleFilter = () => {
    calculateStats();
  };
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(
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
                  onChange={(e) => {
                    setSelectedFilterType(e.target.value as FilterType);
                    setSelectedEntity('');
                  }}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3 pr-8 shadow-sm">
                  
                  {FILTER_OPTIONS.map((opt) =>
                  <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Dynamic Entity Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                {FILTER_OPTIONS.find((o) => o.value === selectedFilterType)?.
                label || 'Filtre'}
              </label>
              <div className="relative">
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-3 pr-8 shadow-sm">
                  
                  <option value="">
                    Tous les{' '}
                    {FILTER_OPTIONS.find(
                      (o) => o.value === selectedFilterType
                    )?.label.toLowerCase()}
                    s
                  </option>
                  {entityOptions.map((entity, idx) =>
                  <option key={idx} value={entity}>
                      {entity}
                    </option>
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleFilter}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
              
              <Filter className="w-5 h-5" />
              Filtrer
            </button>
          </div>
        </div>

        {/* Results Section - Always visible */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-bold text-slate-700">
                  Répartition par{' '}
                  {FILTER_OPTIONS.find(
                    (o) => o.value === selectedFilterType
                  )?.label.toLowerCase()}
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
                      formatter={(value: number) => [`${value} DT`, 'Montant']}
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

            {/* Bar Chart */}
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
                      left: 40,
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
                      width={100}
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
                      formatter={(value: number) => [`${value} DT`, 'Montant']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} />
                    
                    <Bar
                      dataKey="value"
                      fill="#93C5FD"
                      radius={[0, 4, 4, 0]}
                      barSize={20} />
                    
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-cyan-500" />
              <h3 className="text-lg font-bold text-slate-700">
                Évolution des dépenses
              </h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lineData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }}>
                  
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0" />
                  
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                    new Date(value).toLocaleDateString('fr-FR', {
                      month: 'short',
                      day: 'numeric'
                    })
                    } />
                  
                  <YAxis
                    tick={{
                      fill: '#64748b',
                      fontSize: 12
                    }}
                    tickLine={false}
                    axisLine={false} />
                  
                  <Tooltip
                    formatter={(value: number) => [`${value} DT`, 'Montant']}
                    labelFormatter={(label) =>
                    new Date(label).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    }
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }} />
                  
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: '#3b82f6',
                      strokeWidth: 0
                    }}
                    activeDot={{
                      r: 6
                    }} />
                  
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Détails des dépenses
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Entité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedExpenses.map((expense) =>
                  <tr key={expense.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {expense.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(expense.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">
                            {expense.entityName}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">
                            {expense.entityType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">
                        {expense.amount.toLocaleString('fr-TN')} DT
                      </td>
                    </tr>
                  )}
                  {paginatedExpenses.length === 0 &&
                  <tr>
                      <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500">
                      
                        Aucune dépense trouvée pour ces critères
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
              onItemsPerPageChange={setItemsPerPage}
              onExportPdf={() => console.log('Export PDF Expenses')}
              onExportExcel={() => console.log('Export Excel Expenses')} />
            
          </div>
        </div>
      </div>
    </div>);

}