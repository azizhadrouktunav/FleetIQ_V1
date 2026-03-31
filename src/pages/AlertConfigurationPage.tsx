import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Settings,
  Bell,
  Mail,
  MessageSquare,
  Save,
  Building2,
  Car } from
'lucide-react';
import { AlertConfiguration } from '../components/AlertConfiguration';
import { DashboardAlertsContent } from '../components/DashboardAlertsContent';
import { AlertMailSmsContent } from '../components/AlertMailSmsContent';
// Mock departments with vehicles
const MOCK_DEPARTMENTS = [
{
  id: '1',
  name: 'test',
  vehicles: [
  {
    id: '1',
    name: '8127 TU 226',
    driver: 'Jean Dupont'
  },
  {
    id: '2',
    name: 'LATRACE',
    driver: 'Marie Martin'
  },
  {
    id: '3',
    name: 'TUNAV',
    driver: 'Pierre Durand'
  },
  {
    id: '4',
    name: 'DEmo2025',
    driver: 'Sophie Bernard'
  }]

},
{
  id: '2',
  name: 'Transport',
  vehicles: [
  {
    id: '5',
    name: 'Fleet-001',
    driver: 'Lucas Petit'
  },
  {
    id: '6',
    name: 'Fleet-002',
    driver: 'Emma Thomas'
  },
  {
    id: '7',
    name: 'Fleet-003',
    driver: 'Antoine Moreau'
  }]

},
{
  id: '3',
  name: 'Logistique',
  vehicles: [
  {
    id: '8',
    name: 'Fleet-004',
    driver: 'Camille Leroy'
  },
  {
    id: '9',
    name: 'Fleet-005',
    driver: 'Nicolas Simon'
  }]

},
{
  id: '4',
  name: 'Commercial',
  vehicles: [
  {
    id: '10',
    name: 'Fleet-006',
    driver: 'Julie Laurent'
  },
  {
    id: '11',
    name: 'Fleet-007',
    driver: 'Thomas Blanc'
  }]

}];

// Alert configuration sections
const ALERT_SECTIONS = [
{
  id: 'general',
  title: 'Général',
  alerts: [
  {
    id: 'door_state',
    label: 'État des portes'
  },
  {
    id: 'towing',
    label: 'Remorquage'
  },
  {
    id: 'rpm_exceeded',
    label: 'Dépassement RPM moteur de'
  },
  {
    id: 'contact_state',
    label: 'État de contact (on/off)'
  },
  {
    id: 'battery_disconnected',
    label: 'Batterie déconnectée'
  },
  {
    id: 'sos_button',
    label: 'Bouton SOS enfoncé'
  },
  {
    id: 'activation_command',
    label:
    "Recevez un accusé d'envoi de la commande d'activation et de désactivation d'arrêt à distance"
  }]

},
{
  id: 'temperature',
  title: 'Température',
  alerts: [
  {
    id: 'temp_exceeded',
    label: "Activer l'alerte de dépassement de température moteur"
  },
  {
    id: 'temp_range',
    label: 'Température'
  }]

},
{
  id: 'fuel',
  title: 'Carburant',
  alerts: [
  {
    id: 'fuel_drop',
    label: 'Chute brusque de carburant de'
  },
  {
    id: 'fuel_refill',
    label: 'Remplissage de carburant dépasse'
  },
  {
    id: 'fuel_consumption',
    label:
    'Dépassement de consommation de carburant par rapport à une consommation théorique égal à'
  }]

},
{
  id: 'speed',
  title: 'Vitesse',
  alerts: [
  {
    id: 'speed_exceeded',
    label: 'Dépassement de vitesse > à'
  },
  {
    id: 'speed_alarm',
    label: "Activer la sirène d'alarme en cas d'excès de vitesse"
  },
  {
    id: 'speed_increase',
    label: 'Dépassement de vitesse de +-'
  }]

},
{
  id: 'stop',
  title: 'Stop',
  alerts: [
  {
    id: 'long_stop',
    label: 'Stop de longue durée >'
  },
  {
    id: 'stop_no_position',
    label:
    "Générer l'alerte même si le véhicule n'envoie pas des positions au serveur"
  },
  {
    id: 'stop_period',
    label: 'Stop pour une période >'
  },
  {
    id: 'engine_running',
    label: 'Avec le moteur lancé?'
  }]

},
{
  id: 'driving',
  title: 'Conduite',
  alerts: [
  {
    id: 'aggressive_driving',
    label: 'Conduite agressive'
  },
  {
    id: 'acceleration',
    label: 'Accélération'
  },
  {
    id: 'braking',
    label: 'Freinage'
  },
  {
    id: 'driving_time',
    label: 'Dépassement de temps de conduite de'
  },
  {
    id: 'alarm_siren',
    label: "(Activer la sirène d'alarme)"
  }]

},
{
  id: 'geofencing',
  title: 'Géorepérage',
  alerts: [
  {
    id: 'trajectory_1',
    label: '1ère trajectoire',
    hasSubOptions: true
  },
  {
    id: 'trajectory_2',
    label: '2ème trajectoire',
    hasSubOptions: true
  }]

}];

export function AlertConfigurationPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(
    new Set(['1'])
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  const [enabledAlerts, setEnabledAlerts] = useState<Set<string>>(new Set());
  const [alertSettings, setAlertSettings] = useState<
    Record<
      string,
      {
        email: boolean;
        sms: boolean;
      }>>(

    {});
  const [expandedTrajectories, setExpandedTrajectories] = useState<Set<string>>(
    new Set()
  );
  const [hasChanges, setHasChanges] = useState(false);
  const toggleDepartment = (deptId: string) => {
    setExpandedDepartments((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };
  const selectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };
  const selectedVehicle =
  MOCK_DEPARTMENTS.flatMap((d) => d.vehicles).find(
    (v) => v.id === selectedVehicleId
  ) || null;
  const filteredDepartments = MOCK_DEPARTMENTS.map((dept) => ({
    ...dept,
    vehicles: dept.vehicles.filter(
      (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(
    (dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.vehicles.length > 0
  );
  const toggleAlert = (alertId: string) => {
    setEnabledAlerts((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
    setAlertSettings((prev) => ({
      ...prev,
      [alertId]: prev[alertId] || {
        email: false,
        sms: false
      }
    }));
    setHasChanges(true);
  };
  const toggleNotification = (alertId: string, type: 'email' | 'sms') => {
    setAlertSettings((prev) => ({
      ...prev,
      [alertId]: {
        ...prev[alertId],
        [type]: !prev[alertId]?.[type]
      }
    }));
    setHasChanges(true);
  };
  const toggleTrajectory = (alertId: string) => {
    setExpandedTrajectories((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };
  const handleSave = () => {
    setHasChanges(false);
  };
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardAlertsContent />;
      case 'configuration':
        return <AlertConfiguration />;
      case 'mail-sms':
        return <AlertMailSmsContent />;
      case 'alerts':
      default:
        return <AlertsContent />;
    }
  };
  return (
    <div className="h-full flex bg-slate-50">
      {/* Left Sidebar - Department & Vehicle Navigation */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Liste des véhicules
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            
          </div>
        </div>

        {/* Department & Vehicle List */}
        <div className="flex-1 overflow-y-auto">
          {filteredDepartments.map((department) => {
            const isExpanded = expandedDepartments.has(department.id);
            return (
              <div key={department.id} className="border-b border-slate-100">
                {/* Department Header */}
                <button
                  onClick={() => toggleDepartment(department.id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group">
                  
                  <div className="flex items-center gap-2">
                    {isExpanded ?
                    <ChevronDown className="w-4 h-4 text-slate-600" /> :

                    <ChevronRight className="w-4 h-4 text-slate-600" />
                    }
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      {department.name}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {department.vehicles.length}
                  </span>
                </button>

                {/* Vehicles List */}
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
                    className="overflow-hidden bg-slate-50">
                    
                      {department.vehicles.map((vehicle, index) => {
                      const isSelected = selectedVehicleId === vehicle.id;
                      return (
                        <motion.button
                          key={vehicle.id}
                          initial={{
                            opacity: 0,
                            x: -10
                          }}
                          animate={{
                            opacity: 1,
                            x: 0
                          }}
                          transition={{
                            delay: index * 0.05
                          }}
                          onClick={() => selectVehicle(vehicle.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 pl-12 text-left transition-all ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}>
                          
                            <Car
                            className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                          
                            <div className="flex-1 min-w-0">
                              <p
                              className={`text-sm font-medium truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                              
                                {vehicle.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {vehicle.driver}
                              </p>
                            </div>
                          </motion.button>);

                    })}
                    </motion.div>
                  }
                </AnimatePresence>
              </div>);

          })}
        </div>
      </div>

      {/* Right Panel - Alert Configuration */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedVehicle ?
        <>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">
                    Configuration d'alerte
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedVehicle.name} - {selectedVehicle.driver}
                  </p>
                </div>
                {hasChanges &&
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
              }
              </div>
            </div>

            {/* Alert Configuration Sections */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto space-y-4">
                {ALERT_SECTIONS.map((section, sectionIndex) =>
              <motion.div
                key={section.id}
                initial={{
                  opacity: 0,
                  y: 20
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: sectionIndex * 0.05
                }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                
                    {/* Section Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {section.title}
                      </h3>
                    </div>

                    {/* Section Alerts */}
                    <div className="p-4 space-y-3">
                      {section.alerts.map((alert, alertIndex) => {
                    const isEnabled = enabledAlerts.has(alert.id);
                    const settings = alertSettings[alert.id];
                    const isTrajectoryExpanded = expandedTrajectories.has(
                      alert.id
                    );
                    return (
                      <div key={alert.id}>
                            <motion.div
                          initial={{
                            opacity: 0,
                            x: -10
                          }}
                          animate={{
                            opacity: 1,
                            x: 0
                          }}
                          transition={{
                            delay: alertIndex * 0.02
                          }}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                          
                              <div className="flex items-center gap-3 flex-1">
                                {alert.hasSubOptions ?
                            <button
                              onClick={() => toggleTrajectory(alert.id)}
                              className="flex items-center gap-2">
                              
                                    {isTrajectoryExpanded ?
                              <ChevronDown className="w-4 h-4 text-slate-600" /> :

                              <ChevronRight className="w-4 h-4 text-slate-600" />
                              }
                                    <span className="text-sm font-semibold text-slate-800">
                                      {alert.label}
                                    </span>
                                  </button> :

                            <>
                                    <input
                                type="checkbox"
                                checked={isEnabled}
                                onChange={() => toggleAlert(alert.id)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer" />
                              
                                    <label className="text-sm text-slate-700 cursor-pointer flex-1">
                                      {alert.label}
                                    </label>
                                  </>
                            }
                              </div>

                              {isEnabled && !alert.hasSubOptions &&
                          <div className="flex items-center gap-2 ml-4">
                                  <button
                              onClick={() =>
                              toggleNotification(alert.id, 'email')
                              }
                              className={`p-2 rounded-lg transition-colors ${settings?.email ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                              title="Notification par email">
                              
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button
                              onClick={() =>
                              toggleNotification(alert.id, 'sms')
                              }
                              className={`p-2 rounded-lg transition-colors ${settings?.sms ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                              title="Notification par SMS">
                              
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                </div>
                          }
                            </motion.div>

                            {/* Trajectory Sub-Options */}
                            {alert.hasSubOptions && isTrajectoryExpanded &&
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0
                          }}
                          animate={{
                            opacity: 1,
                            height: 'auto'
                          }}
                          exit={{
                            opacity: 0,
                            height: 0
                          }}
                          className="ml-8 mt-3 space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                          
                                <div className="flex items-center gap-3">
                                  <input
                              type="checkbox"
                              id={`${alert.id}_around`}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                            
                                  <label
                              htmlFor={`${alert.id}_around`}
                              className="text-sm text-slate-700 flex-1">
                              
                                    Géorepérage autour de:
                                  </label>
                                  <input
                              type="number"
                              defaultValue="100"
                              className="w-20 px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            
                                  <span className="text-sm text-slate-600">
                                    m
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-slate-600 mb-1 block">
                                      Polygone
                                    </label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                      <option>polygone:</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-600 mb-1 block">
                                      Chaque
                                    </label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                      <option>Chaque</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm text-slate-700 mb-2 block">
                                    Sélectionnez l'intervalle de temps
                                  </label>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-xs text-slate-600 mb-1 block">
                                        à partir de
                                      </label>
                                      <input
                                  type="datetime-local"
                                  defaultValue="2020-12-10T00:00:00"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-600 mb-1 block">
                                        prend fin
                                      </label>
                                      <input
                                  type="datetime-local"
                                  defaultValue="2022-01-28T00:00:00"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm text-slate-700 mb-2 block">
                                    lors du passage à :
                                  </label>
                                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                    <option>
                                      l'extérieur ou à l'intérieur du zone
                                    </option>
                                  </select>
                                </div>
                              </motion.div>
                        }
                          </div>);

                  })}
                    </div>

                    {/* Section Footer Actions */}
                    <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                      <button className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                        Paramètres par défaut
                      </button>
                      <button className="text-sm text-slate-700 hover:text-slate-900 font-medium">
                        Envoyer les paramètres
                      </button>
                    </div>
                  </motion.div>
              )}
              </div>
            </div>
          </> :

        <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Settings
                className="w-12 h-12 text-slate-400"
                strokeWidth={1.5} />
              
              </div>
              <h2 className="text-2xl font-semibold text-slate-700 mb-2">
                Sélectionnez un véhicule
              </h2>
              <p className="text-slate-500">
                Choisissez un véhicule dans la liste pour configurer ses alertes
              </p>
            </div>
          </div>
        }
      </div>
    </div>);

}