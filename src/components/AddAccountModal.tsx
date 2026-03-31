import React, { useEffect, useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronRight,
  Check,
  ArrowRight,
  ArrowLeft } from
'lucide-react';
interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editingAccount?: any;
}
const ACCESS_PAGES = [
{
  id: 'tous',
  label: 'Tous',
  children: []
},
{
  id: 'administration',
  label: 'Administration',
  children: [
  {
    id: 'gestion_comptes',
    label: 'Gestion des comptes'
  },
  {
    id: 'gestion_departements',
    label: 'Gestion des départements'
  },
  {
    id: 'controle_unites',
    label: 'Contrôle des unités'
  },
  {
    id: 'parametrage_alertes',
    label: 'Paramétrage des alertes'
  },
  {
    id: 'envoi_alertes',
    label: 'Envoi des alertes par Mail/SMS'
  },
  {
    id: 'geofencing',
    label: 'Geofencing'
  },
  {
    id: 'gestion_emplacements',
    label: 'Gestion des emplacements'
  }]

},
{
  id: 'suivi',
  label: 'Suivi',
  children: []
},
{
  id: 'gestion_parc',
  label: 'Gestion de Parc',
  children: []
},
{
  id: 'surveillance_reservoirs',
  label: 'Surveillance des réservoirs',
  children: [
  {
    id: 'tableau_surveillance_reservoirs',
    label: 'Tableau de bord de surveillance des réservoirs'
  },
  {
    id: 'gestion_reservoirs',
    label: 'Gestion des réservoirs'
  }]

},
{
  id: 'surveillance_reservoirs_mobiles',
  label: 'Surveillance des réservoirs mobiles',
  children: [
  {
    id: 'tableau_surveillance_reservoirs_mobiles',
    label: 'Tableau de bord de surveillance des réservoirs'
  },
  {
    id: 'gestion_reservoirs_mobiles',
    label: 'Gestion des réservoirs'
  }]

},
{
  id: 'surveillance_pompes',
  label: 'Surveillance des pompes',
  children: [
  {
    id: 'tableau_pompes',
    label: 'Tableau de bord des pompes'
  },
  {
    id: 'gestion_pompes',
    label: 'Gestion des pompes'
  }]

}];

const DEPARTMENTS = [
'Transport',
'Logistique',
'Commercial',
'Direction',
'Technique'];

const STEPS = [
{
  id: 1,
  title: 'Informations générales',
  description: 'Login, prénom et nom'
},
{
  id: 2,
  title: 'Mot de passe',
  description: 'Définir le mot de passe'
},
{
  id: 3,
  title: 'Département/Spécialité',
  description: 'Choisir le périmètre'
},
{
  id: 4,
  title: "Pages d'accès",
  description: 'Définir les permissions'
}];

export function AddAccountModal({
  isOpen,
  onClose,
  onSave,
  editingAccount
}: AddAccountModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    login: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    departmentType: 'all_fleet',
    selectedDepartments: [] as string[],
    specialty: '',
    accessPages: new Set<string>()
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['administration'])
  );
  useEffect(() => {
    if (editingAccount) {
      setFormData({
        login: editingAccount.login,
        firstName: editingAccount.firstName,
        lastName: editingAccount.lastName,
        password: '',
        confirmPassword: '',
        departmentType: 'all_fleet',
        selectedDepartments: [],
        specialty: editingAccount.specialty,
        accessPages: new Set<string>()
      });
    } else {
      setFormData({
        login: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
        departmentType: 'all_fleet',
        selectedDepartments: [],
        specialty: '',
        accessPages: new Set<string>()
      });
    }
    setCurrentStep(1);
  }, [editingAccount, isOpen]);
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.login && formData.firstName && formData.lastName);
      case 2:
        if (editingAccount) return true;
        return !!(
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword);

      case 3:
        if (formData.departmentType === 'specific_departments') {
          return formData.selectedDepartments.length > 0;
        }
        if (formData.departmentType === 'specialty') {
          return !!formData.specialty;
        }
        return true;
      case 4:
        return formData.accessPages.size > 0;
      default:
        return true;
    }
  };
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      alert('Veuillez remplir tous les champs requis');
    }
  };
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleSubmit = () => {
    if (!validateStep(4)) {
      alert("Veuillez sélectionner au moins une page d'accès");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    onSave(formData);
  };
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };
  const toggleAccessPage = (pageId: string) => {
    const newPages = new Set(formData.accessPages);
    if (newPages.has(pageId)) {
      newPages.delete(pageId);
    } else {
      newPages.add(pageId);
    }
    setFormData({
      ...formData,
      accessPages: newPages
    });
  };
  const toggleAllPages = () => {
    if (formData.accessPages.has('tous')) {
      setFormData({
        ...formData,
        accessPages: new Set()
      });
    } else {
      const allPages = new Set<string>(['tous']);
      ACCESS_PAGES.forEach((section) => {
        allPages.add(section.id);
        section.children.forEach((child) => allPages.add(child.id));
      });
      setFormData({
        ...formData,
        accessPages: allPages
      });
    }
  };
  const toggleDepartment = (dept: string) => {
    const newDepts = formData.selectedDepartments.includes(dept) ?
    formData.selectedDepartments.filter((d) => d !== dept) :
    [...formData.selectedDepartments, dept];
    setFormData({
      ...formData,
      selectedDepartments: newDepts
    });
  };
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        
        <motion.div
          initial={{
            scale: 0.9,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          exit={{
            scale: 0.9,
            opacity: 0
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingAccount ? 'Modifier le compte' : 'Ajouter un compte'}
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                Étape {currentStep} sur 4
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) =>
              <Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${currentStep > step.id ? 'bg-emerald-500 text-white' : currentStep === step.id ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                    
                      {currentStep > step.id ?
                    <Check className="w-5 h-5" /> :

                    step.id
                    }
                    </div>
                    <div className="mt-2 text-center">
                      <p
                      className={`text-xs font-semibold ${currentStep === step.id ? 'text-blue-600' : currentStep > step.id ? 'text-emerald-600' : 'text-slate-500'}`}>
                      
                        {step.title}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 &&
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  style={{
                    marginTop: '-30px'
                  }} />

                }
                </Fragment>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 &&
              <motion.div
                key="step1"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                transition={{
                  duration: 0.3
                }}
                className="space-y-4">
                
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Login *
                        </label>
                        <input
                        type="text"
                        required
                        value={formData.login}
                        onChange={(e) =>
                        setFormData({
                          ...formData,
                          login: e.target.value
                        })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nom d'utilisateur" />
                      
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Prénom *
                          </label>
                          <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value
                          })
                          }
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Prénom" />
                        
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Nom *
                          </label>
                          <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                          setFormData({
                            ...formData,
                            lastName: e.target.value
                          })
                          }
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nom" />
                        
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              }

              {currentStep === 2 &&
              <motion.div
                key="step2"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                transition={{
                  duration: 0.3
                }}
                className="space-y-4">
                
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      Mot de passe
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Mot de passe *
                        </label>
                        <input
                        type="password"
                        required={!editingAccount}
                        value={formData.password}
                        onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value
                        })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="••••••••" />
                      
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Répéter mot de passe *
                        </label>
                        <input
                        type="password"
                        required={!editingAccount}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value
                        })
                        }
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="••••••••" />
                      
                      </div>
                    </div>
                    {formData.password &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword &&
                  <p className="text-sm text-rose-600 mt-2 font-medium">
                          ⚠️ Les mots de passe ne correspondent pas
                        </p>
                  }
                  </div>
                </motion.div>
              }

              {currentStep === 3 &&
              <motion.div
                key="step3"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                transition={{
                  duration: 0.3
                }}
                className="space-y-4">
                
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      Département / Spécialité
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-colors">
                        <input
                        type="radio"
                        name="departmentType"
                        value="all_fleet"
                        checked={formData.departmentType === 'all_fleet'}
                        onChange={(e) =>
                        setFormData({
                          ...formData,
                          departmentType: e.target.value
                        })
                        }
                        className="w-5 h-5 text-emerald-600" />
                      
                        <span className="text-sm font-semibold text-slate-700">
                          Suivre toute la flotte
                        </span>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-colors">
                        <input
                        type="radio"
                        name="departmentType"
                        value="specific_departments"
                        checked={
                        formData.departmentType === 'specific_departments'
                        }
                        onChange={(e) =>
                        setFormData({
                          ...formData,
                          departmentType: e.target.value
                        })
                        }
                        className="w-5 h-5 text-emerald-600 mt-0.5" />
                      
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-slate-700 block mb-3">
                            Suivre uniquement les voitures de ces départements
                          </span>
                          {formData.departmentType ===
                        'specific_departments' &&
                        <div className="grid grid-cols-2 gap-2 mt-2">
                              {DEPARTMENTS.map((dept) =>
                          <label
                            key={dept}
                            className="flex items-center gap-2 text-sm text-slate-600 p-2 hover:bg-slate-50 rounded">
                            
                                  <input
                              type="checkbox"
                              checked={formData.selectedDepartments.includes(
                                dept
                              )}
                              onChange={() => toggleDepartment(dept)}
                              className="w-4 h-4 text-emerald-600 rounded" />
                            
                                  {dept}
                                </label>
                          )}
                            </div>
                        }
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 bg-white border-2 border-slate-200 rounded-lg cursor-pointer hover:border-emerald-400 transition-colors">
                        <input
                        type="radio"
                        name="departmentType"
                        value="specialty"
                        checked={formData.departmentType === 'specialty'}
                        onChange={(e) =>
                        setFormData({
                          ...formData,
                          departmentType: e.target.value
                        })
                        }
                        className="w-5 h-5 text-emerald-600 mt-0.5" />
                      
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-slate-700 block mb-3">
                            Spécialité
                          </span>
                          {formData.departmentType === 'specialty' &&
                        <input
                          type="text"
                          value={formData.specialty}
                          onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialty: e.target.value
                          })
                          }
                          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Entrez la spécialité" />

                        }
                        </div>
                      </label>
                    </div>
                  </div>
                </motion.div>
              }

              {currentStep === 4 &&
              <motion.div
                key="step4"
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                exit={{
                  opacity: 0,
                  x: -20
                }}
                transition={{
                  duration: 0.3
                }}
                className="space-y-4">
                
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        4
                      </div>
                      Les pages d'accès
                    </h3>
                    <div className="bg-white rounded-lg border-2 border-slate-200 max-h-96 overflow-y-auto">
                      {ACCESS_PAGES.map((section) =>
                    <div
                      key={section.id}
                      className="border-b border-slate-100 last:border-b-0">
                      
                          <div className="flex items-center gap-2 p-3 hover:bg-slate-50">
                            {section.children.length > 0 &&
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="p-0.5 hover:bg-slate-200 rounded transition-colors">
                          
                                {expandedSections.has(section.id) ?
                          <ChevronDown className="w-4 h-4 text-slate-600" /> :

                          <ChevronRight className="w-4 h-4 text-slate-600" />
                          }
                              </button>
                        }
                            <label className="flex items-center gap-2 flex-1 cursor-pointer">
                              <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.accessPages.has(section.id) ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              if (section.id === 'tous') {
                                toggleAllPages();
                              } else {
                                toggleAccessPage(section.id);
                              }
                            }}>
                            
                                {formData.accessPages.has(section.id) &&
                            <Check className="w-3.5 h-3.5 text-white" />
                            }
                              </div>
                              <span className="text-sm font-semibold text-slate-700">
                                {section.label}
                              </span>
                            </label>
                          </div>

                          {section.children.length > 0 &&
                      expandedSections.has(section.id) &&
                      <div className="pl-8 bg-slate-50">
                                {section.children.map((child) =>
                        <label
                          key={child.id}
                          className="flex items-center gap-2 p-2.5 hover:bg-slate-100 cursor-pointer">
                          
                                    <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.accessPages.has(child.id) ? 'bg-purple-600 border-purple-600' : 'border-slate-300 bg-white'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleAccessPage(child.id);
                            }}>
                            
                                      {formData.accessPages.has(child.id) &&
                            <Check className="w-3.5 h-3.5 text-white" />
                            }
                                    </div>
                                    <span className="text-sm text-slate-600">
                                      {child.label}
                                    </span>
                                  </label>
                        )}
                              </div>
                      }
                        </div>
                    )}
                    </div>
                  </div>
                </motion.div>
              }
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${currentStep === 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}>
              
              <ArrowLeft className="w-4 h-4" />
              Précédent
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 rounded-lg font-medium transition-colors">
                
                Annuler
              </button>

              {currentStep < 4 ?
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button> :

              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                
                  <Check className="w-4 h-4" />
                  {editingAccount ? 'Modifier' : 'Créer le compte'}
                </button>
              }
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>);

}