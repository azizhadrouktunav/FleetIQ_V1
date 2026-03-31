import React, { useEffect, useState, createElement } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MapView } from './components/MapView';
import { DataTable } from './components/DataTable';
import { ReportsContent } from './components/ReportsContent';
import { Dashboard } from './components/Dashboard';
import { ParcContent } from './components/ParcContent';
import { Vehicle, VehicleStatus } from './types';
import { VehicleListPanel } from './components/VehicleListPanel';
import { AlertsContent } from './components/AlertsContent';
import { AIChatPanel } from './components/AIChatPanel';
import { MessageSquare } from 'lucide-react';
import { SuivieFilterBar, SuivieAction } from './components/SuivieFilterBar';
import { SuivieGeneraleTable } from './components/SuivieGeneraleTable';
import { StopCirculationTable } from './components/StopCirculationTable';
import { TrajectoireTable } from './components/TrajectoireTable';
import { CommandesTable } from './components/CommandesTable';
import { DashboardAlertsContent } from './components/DashboardAlertsContent';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AccountsManagement } from './components/AccountsManagement';
import { DepartmentsManagement } from './components/DepartmentsManagement';
import { AlertConfigurationPage } from './pages/AlertConfigurationPage';
import { GestionSinistres } from './components/GestionSinistres';
import { AlertMailSmsContent } from './components/AlertMailSmsContent';
import { NotFoundPage } from './pages/NotFoundPage';
// Generate 50 mock vehicles
const generateMockVehicles = (): Vehicle[] => {
  const statuses: VehicleStatus[] = ['active', 'idle', 'offline'];
  const drivers = [
  'Jean Dupont',
  'Marie Martin',
  'Pierre Durand',
  'Sophie Bernard',
  'Lucas Petit',
  'Emma Thomas',
  'Antoine Moreau',
  'Camille Leroy',
  'Nicolas Simon',
  'Julie Laurent',
  'Thomas Blanc',
  'Sarah Girard',
  'Alexandre Roux',
  'Léa Fournier',
  'Maxime Bonnet',
  'Chloé Lambert'];

  const locations = [
  'Rue de Rivoli, Paris',
  'Avenue des Champs-Élysées',
  'Boulevard Haussmann',
  'Gare de Lyon',
  'Périphérique Nord',
  'Montmartre',
  'La Défense',
  'Bercy',
  'Nation',
  'République',
  'Bastille',
  'Opéra',
  'Châtelet',
  'Saint-Germain',
  'Marais',
  'Belleville',
  'Ménilmontant',
  'Oberkampf'];

  const vehicles: Vehicle[] = [];
  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const speed = status === 'active' ? Math.floor(Math.random() * 80) + 20 : 0;
    const batteryLevel =
    status === 'offline' ? 0 : Math.floor(Math.random() * 100);
    vehicles.push({
      id: `${i}`,
      name: `Fleet-${String(i).padStart(3, '0')}`,
      status,
      speed,
      location: locations[Math.floor(Math.random() * locations.length)],
      coordinates: [
      48.8566 + (Math.random() - 0.5) * 0.1,
      2.3522 + (Math.random() - 0.5) * 0.1],

      lastUpdate:
      status === 'active' ?
      "À l'instant" :
      status === 'idle' ?
      `Il y a ${Math.floor(Math.random() * 30)} min` :
      `Il y a ${Math.floor(Math.random() * 5) + 1}h`,
      driver: drivers[Math.floor(Math.random() * drivers.length)],
      batteryLevel
    });
  }
  return vehicles;
};
const MOCK_VEHICLES = generateMockVehicles();
// Mock alerts data (same as in Dashboard)
const recentAlerts = [
{
  id: 1,
  vehicle: 'Fleet-001',
  type: 'Excès de vitesse',
  message: '142 km/h détecté sur A1',
  time: 'Il y a 5 min',
  severity: 'critical',
  isRead: false
},
{
  id: 2,
  vehicle: 'Fleet-003',
  type: 'Niveau carburant bas',
  message: 'Carburant à 12%',
  time: 'Il y a 15 min',
  severity: 'warning',
  isRead: false
},
{
  id: 3,
  vehicle: 'Fleet-007',
  type: 'Maintenance requise',
  message: 'Révision dans 200 km',
  time: 'Il y a 1h',
  severity: 'info',
  isRead: true
},
{
  id: 4,
  vehicle: 'Fleet-002',
  type: 'Sortie de zone',
  message: 'Véhicule hors géofence',
  time: 'Il y a 2h',
  severity: 'warning',
  isRead: false
},
{
  id: 5,
  vehicle: 'Fleet-012',
  type: 'Arrêt prolongé',
  message: 'Arrêt depuis 3h',
  time: 'Il y a 3h',
  severity: 'info',
  isRead: true
}];

// Calculate unread alerts count
const unreadAlertsCount = recentAlerts.filter((a) => !a.isRead).length;
export function App() {
  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const [activeSection, setActiveSection] = useState('404');
  const [activeTab, setActiveTab] = useState('suivie');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isVehicleListCollapsed, setIsVehicleListCollapsed] = useState(false);
  const [isMonitoringCollapsed, setIsMonitoringCollapsed] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [hideBadges, setHideBadges] = useState(false);
  // Suivie Filter States
  const [suivieStartDate, setSuivieStartDate] = useState('');
  const [suivieEndDate, setSuivieEndDate] = useState('');
  const [suivieAction, setSuivieAction] =
  useState<SuivieAction>('suivie_generale');
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(
    new Set()
  );
  const [selectedDepartments, setSelectedDepartments] = useState<Set<string>>(
    new Set()
  );
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<Set<string>>(
    new Set()
  );
  // Inject Leaflet CSS
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicleId(vehicle.id);
  };
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Reset activeTab when switching to rapports section
    if (section === 'rapports') {
      setActiveTab('rapports');
    }
  };
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const handleToggleVehicleList = () => {
    setIsVehicleListCollapsed(!isVehicleListCollapsed);
  };
  const handleToggleMonitoring = () => {
    setIsMonitoringCollapsed(!isMonitoringCollapsed);
  };
  // Handler for navigating from Dashboard to vehicle on map
  const handleNavigateToVehicle = (
  vehicleId: string,
  coordinates: [number, number]) =>
  {
    // Switch to suivie section
    setActiveSection('suivie');
    setActiveTab('suivie');
    // Select the vehicle
    setSelectedVehicleId(vehicleId);
    // Center map on vehicle coordinates
    setMapCenter(coordinates);
  };
  // Determine sidebar mode based on active section
  const sidebarMode = activeSection === 'rapports' ? 'rapports' : 'monitoring';
  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return (
        <SignUpPage
          onSignUp={() => setIsAuthenticated(true)}
          onNavigateToLogin={() => setAuthPage('login')} />);


    }
    return (
      <LoginPage
        onLogin={() => setIsAuthenticated(true)}
        onNavigateToSignUp={() => setAuthPage('signup')} />);


  }
  // 404 Page - rendered without any navbar or sidebar
  if (activeSection === '404') {
    return (
      <NotFoundPage
        onNavigateToDashboard={() => setActiveSection('dashboard')}
        onNavigateToLogin={() => setIsAuthenticated(false)} />);


  }
  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Top Navigation */}
      <TopBar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        unreadAlertsCount={unreadAlertsCount}
        hideBadges={hideBadges}
        onToggleHideBadges={() => setHideBadges(!hideBadges)} />
      

      <div className="flex-1 relative overflow-hidden">
        {activeSection === 'dashboard' ?
        // Dashboard View
        <Dashboard
          vehicles={MOCK_VEHICLES}
          onNavigateToVehicle={handleNavigateToVehicle} /> :

        activeSection === 'parc' ?
        // Parc View
        <ParcContent /> :
        activeSection === 'gestion_sinistres' ?
        // Gestion Sinistres View
        <GestionSinistres vehicles={MOCK_VEHICLES} /> :
        activeSection === 'alertes' ?
        // Alertes View
        <AlertsContent
          vehicles={MOCK_VEHICLES}
          onNavigateToVehicle={handleNavigateToVehicle}
          hideBadges={hideBadges} /> :

        activeSection === 'administration' ?
        // Administration View
        <AccountsManagement /> :
        activeSection === 'departments' ?
        // Departments Management View
        <DepartmentsManagement /> :
        activeSection === 'alert_configuration' ?
        // Alert Configuration View
        <AlertConfigurationPage /> :
        activeSection === 'notifications' ?
        // Alert Mail/SMS Notifications View
        <AlertMailSmsContent /> :
        activeSection === '404' ?
        // 404 Not Found Page Preview
        <NotFoundPage
          onNavigateToDashboard={() => setActiveSection('dashboard')}
          onNavigateToLogin={() => setIsAuthenticated(false)} /> :

        activeSection === 'rapports' ?
        // Reports View - Original Layout
        <div className="flex h-full">
            <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mode={sidebarMode} />
          
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <ReportsContent activeTab={activeTab} />
            </div>
          </div> :

        // Suivie View - Original Layout WITHOUT Filter Bar at top
        <>
            {/* Full Screen Map Background */}
            <div className="absolute inset-0 z-0">
              <MapView
              vehicles={MOCK_VEHICLES}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={handleVehicleSelect}
              mapCenter={mapCenter}
              onMapCenterChange={() => setMapCenter(null)} />
            
            </div>

            {/* Left: Vehicle List Panel (Floating Overlay) - Now contains filter bar */}
            <div className="absolute left-0 top-0 bottom-0 z-30">
              <VehicleListPanel
              vehicles={MOCK_VEHICLES}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={handleVehicleSelect}
              isCollapsed={isVehicleListCollapsed}
              onToggleCollapse={handleToggleVehicleList} />
            
            </div>

            {/* Right: Monitoring Center Card (Floating Overlay) */}
            <div className="absolute right-4 bottom-4 z-50">
              <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              mode={sidebarMode}
              isCollapsed={isMonitoringCollapsed}
              onToggleCollapse={handleToggleMonitoring}
              position="floating-right" />
            
            </div>

            {/* AI Chat Button - Positioned above Monitoring Center */}
            {!isAIChatOpen &&
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="absolute right-4 bottom-[100px] group z-30">
            
                <div className="relative">
                  {/* Main button - no background */}
                  <div className="relative w-20 h-20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <img
                  src="/unnamed__8_-removebg-preview.png"
                  alt="Assistant TUNAVI"
                  className="w-full h-full object-contain drop-shadow-lg" />
                
                  </div>

                  {/* Badge indicator */}
                  <div className="absolute top-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                    Assistant TUNAVI
                    <div className="absolute top-full right-4 -mt-1">
                      <div className="border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                </div>
              </button>
          }

            {/* AI Chat Panel */}
            <AIChatPanel
            isOpen={isAIChatOpen}
            onClose={() => setIsAIChatOpen(false)} />
          
          </>
        }
      </div>
    </div>);

}