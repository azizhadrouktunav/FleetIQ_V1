import { Flame, Fuel, Power, Timer, X } from 'lucide-react';
import type { Vehicle } from '@/types';
import { vehicleIcon3dMarkup } from '@/features/parc/vehicle-icons-3d';
import type { VehicleIconType } from '@/features/parc/vehicle-types';
import fleetiqCoverImg from '@/assets/vehicle-covers/fleetiq-cover.png';

function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type PopupInfo = {
  equipmentId: string;
  dateTime: string;
  mileage: string;
  horodatage: string;
  fuel: string;
  engineHours: string;
  engineTemp: string;
  chauffeur: string;
  vitesse: string;
  longitude: string;
  cardId: string;
  volume: string;
  temperature: string;
  battery: string;
  probeState: string;
  waterPresence: string;
  serialNumber: string;
  chipNumber: string;
  address: string;
};

function buildInfo(vehicle: Vehicle): PopupInfo {
  const isShowcase =
    vehicle.id === 'v-1001' || vehicle.matricule === '8125 TU 226';

  if (isShowcase) {
    return {
      equipmentId: '865677040581307',
      address: 'BEN HAMED DECO Ras Jebel Bizerte Tunisia',
      dateTime: '8/24/2026, 6:17:13 PM',
      mileage: '136334 Km',
      horodatage: '11 jours',
      fuel: '22,95 L',
      engineHours: '854:46:11',
      engineTemp: '0 °c',
      chauffeur: '__',
      vitesse: '0',
      longitude: '10.130183',
      cardId: '',
      volume: '0',
      temperature: '0',
      battery: '0',
      probeState: 'non connectée',
      waterPresence: "pas de présence d'eau",
      serialNumber: '',
      chipNumber: '93 761 380',
    };
  }

  const rand = seeded(`info-${vehicle.id}`);
  const mileage = Math.floor(10000 + rand() * 150000);
  const fuelL = (10 + rand() * 80).toFixed(2).replace('.', ',');
  const engineH = Math.floor(200 + rand() * 900);
  const engineM = Math.floor(rand() * 60);
  const engineS = Math.floor(rand() * 60);
  const days = Math.floor(rand() * 14) + 1;
  const chipA = Math.floor(10 + rand() * 89);
  const chipB = Math.floor(100 + rand() * 899);
  const chipC = Math.floor(100 + rand() * 899);
  const probes = ['non connectée', 'connectée', 'erreur'] as const;
  const water = ["pas de présence d'eau", "présence d'eau"] as const;

  return {
    equipmentId: String(Math.floor(8e14 + rand() * 1e14)),
    address: vehicle.location || '—',
    dateTime: new Date().toLocaleString('en-US'),
    mileage: `${mileage} Km`,
    horodatage: days === 1 ? '1 jour' : `${days} jours`,
    fuel: `${fuelL} L`,
    engineHours: `${engineH}:${String(engineM).padStart(2, '0')}:${String(engineS).padStart(2, '0')}`,
    engineTemp: `${Math.floor(rand() * 95)} °c`,
    chauffeur: vehicle.driver || '__',
    vitesse: String(vehicle.speed ?? 0),
    longitude: vehicle.coordinates?.[1]?.toFixed(6) ?? '—',
    cardId: rand() > 0.5 ? String(Math.floor(1000 + rand() * 9000)) : '',
    volume: String(Math.floor(rand() * 40)),
    temperature: String(Math.floor(rand() * 45)),
    battery: String(vehicle.batteryLevel ?? Math.floor(rand() * 100)),
    probeState: probes[Math.floor(rand() * probes.length)],
    waterPresence: water[Math.floor(rand() * water.length)],
    serialNumber: rand() > 0.4 ? `SN-${Math.floor(1e7 + rand() * 9e7)}` : '',
    chipNumber: `${chipA} ${chipB} ${chipC}`,
  };
}

function IconAvatar3d({
  iconType,
  size = 56,
}: {
  iconType?: VehicleIconType;
  size?: number;
}) {
  return (
    <div
      className="rounded-full border-[3px] border-white shadow-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-b from-sky-100 to-blue-50 overflow-hidden"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{
        __html: vehicleIcon3dMarkup(iconType, Math.round(size * 0.78)),
      }}
    />
  );
}

function VehicleTypeCover() {
  return (
    <div className="w-[40%] min-w-[130px] max-w-[170px] flex-shrink-0 relative overflow-hidden bg-sky-100">
      <img
        src={fleetiqCoverImg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/25 via-transparent to-blue-950/30" />
    </div>
  );
}

interface VehicleMapInfoCardProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function VehicleMapInfoCard({
  vehicle,
  onClose,
}: VehicleMapInfoCardProps) {
  const info = buildInfo(vehicle);
  const title = vehicle.matricule || vehicle.name;

  const rows: { label: string; value: string }[] = [
    { label: 'Adresse', value: info.address },
    { label: 'Date / heure', value: info.dateTime },
    { label: 'Kilométrage', value: info.mileage },
    { label: 'Horodatage', value: info.horodatage },
    { label: 'Niveau du carburant', value: info.fuel },
    { label: 'Heures moteur', value: info.engineHours },
    { label: 'Température moteur', value: info.engineTemp },
    { label: 'Chauffeur', value: info.chauffeur },
    { label: 'Vitesse', value: info.vitesse },
    { label: 'Longitude', value: info.longitude },
    { label: 'Identifiant de carte', value: info.cardId },
    { label: 'Volume', value: info.volume },
    { label: 'Temperature', value: info.temperature },
    { label: 'Niveau de batterie', value: info.battery },
    { label: 'Etat de la sonde', value: info.probeState },
    { label: "Présence d'eau", value: info.waterPresence },
    { label: 'Numéro de série', value: info.serialNumber },
    { label: 'Numéro de puce', value: info.chipNumber },
  ];

  return (
    <div className="w-[460px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex">
      <VehicleTypeCover />

      <div className="flex-1 min-w-0 relative pl-8 pr-3 py-3.5">
        <div className="absolute -left-7 top-5 z-10">
          <IconAvatar3d iconType={vehicle.iconType} size={56} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pt-0.5 mb-3 pr-6">
          <h3 className="text-[17px] font-bold text-slate-900 truncate leading-tight">
            {title}
          </h3>
          <div className="mt-1.5 mb-1.5 h-px w-full max-w-[140px] bg-blue-500" />
          <p className="text-xs font-semibold text-blue-600 truncate">
            {info.equipmentId}
          </p>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-start justify-between gap-3 text-[12px] leading-snug"
            >
              <span className="font-bold text-slate-800 shrink-0">
                {row.label}
              </span>
              <span className="text-slate-600 text-right break-words min-w-0">
                {row.value || '\u00a0'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 px-1">
          <span className="w-9 h-9 rounded-full bg-slate-400 shadow-sm flex items-center justify-center text-[12px] font-bold text-white">
            0
          </span>
          <span
            className={`w-9 h-9 rounded-full shadow-sm flex items-center justify-center ${
              vehicle.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            <Power className="w-4 h-4 text-white" />
          </span>
          <span className="w-9 h-9 rounded-full bg-emerald-500 shadow-sm flex items-center justify-center">
            <Fuel className="w-4 h-4 text-white" />
          </span>
          <span className="w-9 h-9 rounded-full bg-slate-400 shadow-sm flex items-center justify-center">
            <Timer className="w-4 h-4 text-white" />
          </span>
          <span className="w-9 h-9 rounded-full bg-sky-400 shadow-sm flex items-center justify-center">
            <Flame className="w-4 h-4 text-white" />
          </span>
        </div>
      </div>
    </div>
  );
}
