import { useEffect, useState } from 'react';
import type { Vehicle } from '@/types';
import type {
  AssignmentScope,
  GeofenceAlertType,
} from '@/types/map-overlays';
import { emptyAssignment } from '@/types/map-overlays';
import { GeoAssignmentFields } from '@/components/GeoAssignmentFields';
import { MapSidePanel } from '@/components/MapSidePanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';

interface BulkZoneAssignPanelProps {
  open: boolean;
  zoneCount: number;
  vehicles: Vehicle[];
  onApply: (assignment: AssignmentScope, alertType: GeofenceAlertType) => void;
  onCancel: () => void;
}

export function BulkZoneAssignPanel({
  open,
  zoneCount,
  vehicles,
  onApply,
  onCancel,
}: BulkZoneAssignPanelProps) {
  const [assignment, setAssignment] = useState<AssignmentScope>(emptyAssignment());
  const [alertType, setAlertType] = useState<GeofenceAlertType>('les_deux');
  const [assignmentError, setAssignmentError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setAssignment(emptyAssignment());
      setAlertType('les_deux');
      setAssignmentError(undefined);
    }
  }, [open, zoneCount]);

  if (!open || zoneCount === 0) return null;

  const handleApply = () => {
    if (assignment.ids.length === 0) {
      setAssignmentError(
        assignment.mode === 'vehicle'
          ? 'Sélectionnez au moins un véhicule.'
          : 'Sélectionnez au moins un département.'
      );
      return;
    }
    onApply(assignment, alertType);
  };

  return (
    <MapSidePanel>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Retour à la gestion"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-indigo-50 text-indigo-600">
          <Users className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-slate-800 truncate">
            Affecter {zoneCount} zone{zoneCount > 1 ? 's' : ''}
          </h2>
          <p className="text-[11px] text-slate-500 truncate">
            Affectation groupée
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Les véhicules sélectionnés seront affectés à toutes les zones
          cochées.
        </p>

        <GeoAssignmentFields
          assignment={assignment}
          onAssignmentChange={(next) => {
            setAssignment(next);
            if (next.ids.length > 0) setAssignmentError(undefined);
          }}
          alertType={alertType}
          onAlertTypeChange={setAlertType}
          vehicles={vehicles}
          assignmentError={assignmentError}
        />
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="button" className="flex-1" onClick={handleApply}>
          Appliquer
        </Button>
      </div>
    </MapSidePanel>
  );
}
