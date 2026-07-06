import { useState } from 'react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSectionId } from '../../constants/alert-config-sections';
import { ALERT_CENTER_SECTIONS } from '../../constants/alert-config-sections';
import { AlertSectionPanel } from './AlertSectionPanel';
import { SectionAlertVehiclesDialog } from './SectionAlertVehiclesDialog';

interface GlobalAlertSectionsDashboardProps {
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
}

export function GlobalAlertSectionsDashboard({
  onNavigateToVehicle,
}: GlobalAlertSectionsDashboardProps) {
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<AlertCenterSectionId | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectAlertType = (alertType: AlertType, sectionId: AlertCenterSectionId) => {
    setSelectedAlertType(alertType);
    setSelectedSectionId(sectionId);
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

      <SectionAlertVehiclesDialog
        alertType={selectedAlertType}
        sectionId={selectedSectionId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onNavigateToVehicle={onNavigateToVehicle}
      />
    </>
  );
}
