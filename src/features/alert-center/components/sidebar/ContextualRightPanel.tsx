import { motion, AnimatePresence } from 'framer-motion';
import { FleetOverviewPanel } from './FleetOverviewPanel';
import { VehicleInspectorPanel } from './VehicleInspectorPanel';
import { useFleetOverview } from '../../hooks/useAlertQueries';

interface ContextualRightPanelProps {
  selectedVehicleId: string | null;
  selectedDate?: string;
  onBack: () => void;
  onSelectVehicle?: (vehicleId: string) => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onOpenSettings?: () => void;
}

export function ContextualRightPanel({
  selectedVehicleId,
  selectedDate,
  onBack,
  onSelectVehicle,
  onNavigateToVehicle,
  onOpenSettings,
}: ContextualRightPanelProps) {
  const { data: overview, isLoading: overviewLoading } = useFleetOverview();

  const handleOverviewVehicleClick = (id: string) => {
    onSelectVehicle?.(id);
    requestAnimationFrame(() => {
      document.getElementById(`vehicle-card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
      <AnimatePresence mode="wait">
        {selectedVehicleId ? (
          <motion.div
            key="inspector"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="h-full min-h-0 flex flex-col overflow-hidden"
          >
            <VehicleInspectorPanel
              vehicleId={selectedVehicleId}
              onBack={onBack}
              onNavigateToVehicle={onNavigateToVehicle}
              onOpenSettings={onOpenSettings}
            />
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
          >
            <FleetOverviewPanel
              data={overview}
              isLoading={overviewLoading}
              selectedDate={selectedDate}
              onVehicleClick={handleOverviewVehicleClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
