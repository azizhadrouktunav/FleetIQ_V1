import { useState } from 'react';
import type { AlertType } from '@/types/alerts';
import { ALERT_CENTER_SECTIONS } from '../../constants/alert-config-sections';
import { AlertSectionPanel } from './AlertSectionPanel';
import { AlertVehiclesDialog } from './AlertVehiclesDialog';

interface GlobalAlertSectionsDashboardProps {
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
}

export function GlobalAlertSectionsDashboard({
  onNavigateToVehicle,
}: GlobalAlertSectionsDashboardProps) {
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectAlertType = (alertType: AlertType) => {
    setSelectedAlertType(alertType);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="p-4 lg:p-6 space-y-3">
        {ALERT_CENTER_SECTIONS.map((section, index) => (
          <AlertSectionPanel
            key={section.id}
            section={section}
            defaultOpen={index < 2}
            onSelectAlertType={handleSelectAlertType}
          />
        ))}
      </div>

      <AlertVehiclesDialog
        alertType={selectedAlertType}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onNavigateToVehicle={onNavigateToVehicle}
      />
    </>
  );
}
