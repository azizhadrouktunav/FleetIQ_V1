import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Minus,
  Maximize,
  Navigation,
  Map as MapIcon,
  Globe,
  Layers,
  Eye,
  Droplet,
  Users,
  MapPin,
  Route,
  Code,
  Building } from
'lucide-react';
export function MapControls() {
  const [showLayersMenu, setShowLayersMenu] = useState(false);
  const [showClusterMenu, setShowClusterMenu] = useState(false);
  const [showRichMenu, setShowRichMenu] = useState(false);
  const layersRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const richRef = useRef<HTMLDivElement>(null);
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      layersRef.current &&
      !layersRef.current.contains(event.target as Node))
      {
        setShowLayersMenu(false);
      }
      if (
      clusterRef.current &&
      !clusterRef.current.contains(event.target as Node))
      {
        setShowClusterMenu(false);
      }
      if (richRef.current && !richRef.current.contains(event.target as Node)) {
        setShowRichMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <>
      {/* Bottom Center Controls - Four Main Icons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 bg-white/95 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-slate-200">
        {/* Delete Layers Icon */}
        <button
          className="bg-white hover:bg-rose-50 rounded-xl p-3 shadow-sm border border-slate-200 transition-all hover:scale-105 active:scale-95 group"
          title="Supprimer des couches">
          
          <Droplet className="w-5 h-5 text-slate-700 group-hover:text-rose-600 transition-colors" />
        </button>

        {/* Map Layers Icon with Dropdown */}
        <div className="relative" ref={layersRef}>
          <button
            onClick={() => {
              setShowLayersMenu(!showLayersMenu);
              setShowClusterMenu(false);
              setShowRichMenu(false);
            }}
            className={`bg-white hover:bg-blue-50 rounded-xl p-3 shadow-sm border transition-all hover:scale-105 active:scale-95 ${showLayersMenu ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
            title="Couches de carte">
            
            <Layers className="w-5 h-5 text-slate-700" />
          </button>

          {showLayersMenu &&
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">
                  Couches de carte
                </h3>
              </div>
              <div className="p-2">
                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                
                  <span className="text-sm text-slate-700">
                    Véhicules actifs
                  </span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                
                  <span className="text-sm text-slate-700">Trajectoires</span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                
                  <span className="text-sm text-slate-700">Géofences</span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                
                  <span className="text-sm text-slate-700">
                    Points d'intérêt
                  </span>
                </label>
              </div>
            </div>
          }
        </div>

        {/* Clustering Icon with Dropdown */}
        <div className="relative" ref={clusterRef}>
          <button
            onClick={() => {
              setShowClusterMenu(!showClusterMenu);
              setShowLayersMenu(false);
              setShowRichMenu(false);
            }}
            className={`bg-white hover:bg-blue-50 rounded-xl p-3 shadow-sm border transition-all hover:scale-105 active:scale-95 ${showClusterMenu ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
            title="Regroupement">
            
            <Eye className="w-5 h-5 text-slate-700" />
          </button>

          {showClusterMenu &&
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">
                  Options de regroupement
                </h3>
              </div>
              <div className="p-2">
                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                
                  <span className="text-sm text-slate-700">
                    Regrouper les véhicules en secteurs
                  </span>
                </label>
                <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                
                  <span className="text-sm text-slate-700">
                    Regrouper les emplacements en secteurs
                  </span>
                </label>
              </div>
            </div>
          }
        </div>

        {/* Rich Features Icon with Dropdown */}
        <div className="relative" ref={richRef}>
          <button
            onClick={() => {
              setShowRichMenu(!showRichMenu);
              setShowLayersMenu(false);
              setShowClusterMenu(false);
            }}
            className={`bg-white hover:bg-blue-50 rounded-xl p-3 shadow-sm border transition-all hover:scale-105 active:scale-95 ${showRichMenu ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
            title="Fonctionnalités riches">
            
            <Users className="w-5 h-5 text-slate-700" />
          </button>

          {showRichMenu &&
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800">
                  Fonctionnalités
                </h3>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">
                    Ajouter géorepérage
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">
                    Ajouter un itinéraire
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700 flex items-center justify-between flex-1">
                    Opérations géographique
                    <span className="text-slate-400">›</span>
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                  <Building className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">
                    Gestion des emplacements
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                  <Code className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">
                    Gestion des polygones
                  </span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-left">
                  <Route className="w-4 h-4 text-slate-600" />
                  <span className="text-sm text-slate-700">
                    Gestion des routes
                  </span>
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      {/* Left Side Controls - Zoom & Navigation */}
      <div className="absolute bottom-24 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col border border-slate-200">
          <button className="p-2.5 hover:bg-slate-50 text-slate-600 border-b border-slate-100 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-slate-50 text-slate-600 transition-colors">
            <Minus className="w-5 h-5" />
          </button>
        </div>

        <button className="bg-white p-2.5 rounded-lg shadow-lg hover:bg-slate-50 text-slate-600 transition-colors border border-slate-200">
          <Maximize className="w-5 h-5" />
        </button>

        <button className="bg-white p-2.5 rounded-lg shadow-lg hover:bg-slate-50 text-slate-600 transition-colors border border-slate-200">
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Top Right Toggle - Map/Satellite */}
      <div className="absolute top-4 right-4 z-[400] bg-white rounded-lg shadow-lg p-1 flex border border-slate-200">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm font-medium transition-colors">
          <MapIcon className="w-4 h-4" />
          <span>Carte</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors">
          <Globe className="w-4 h-4" />
          <span>Satellite</span>
        </button>
      </div>

      {/* Bottom Right Badges */}
      <div className="absolute bottom-4 right-4 z-[400] flex gap-2">
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-medium text-slate-600 border border-slate-200">
          Zoom: 12x
        </div>
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-medium text-slate-600 border border-slate-200">
          Véhicules: 55
        </div>
      </div>
    </>);

}