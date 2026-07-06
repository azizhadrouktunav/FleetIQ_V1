import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { AlertScopeRef } from '@/types/alert-config';
import type { GeofenceAlertRule } from '@/types/alert-config';
import { ALERT_SCOPE_TYPE_LABELS } from '@/types/alert-config';
import {
  useDeleteGeofenceRule,
  useGeofenceRules,
  useSaveGeofenceRule,
} from '../../hooks/useAlertQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GeofenceRuleForm } from './GeofenceRuleForm';
import { Switch } from './Switch';

interface GeofencingAlertsSectionProps {
  selectedScopes: AlertScopeRef[];
}

export function GeofencingAlertsSection({ selectedScopes }: GeofencingAlertsSectionProps) {
  const { data: rules = [], isLoading } = useGeofenceRules();
  const saveRule = useSaveGeofenceRule();
  const deleteRule = useDeleteGeofenceRule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GeofenceAlertRule | undefined>();

  const filtered = selectedScopes.length
    ? rules.filter((r) =>
        selectedScopes.some(
          (s) => r.scopeType === s.scopeType && r.scopeIds.includes(s.scopeId)
        )
      )
    : rules;

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (rule: GeofenceAlertRule) => {
    setEditing(rule);
    setDialogOpen(true);
  };

  const handleSave = (rule: Omit<GeofenceAlertRule, 'id'> & { id?: string }) => {
    saveRule.mutate(rule, {
      onSuccess: () => {
        setDialogOpen(false);
        setEditing(undefined);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Règles geofence configurables — activation par zone et périmètre.
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter une règle
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
          {selectedScopes.length
            ? 'Aucune règle geofence pour la sélection actuelle.'
            : 'Aucune règle geofence. Ajoutez-en une ou sélectionnez un périmètre.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((rule) => (
            <div
              key={rule.id}
              className="p-3 rounded-lg border border-slate-200 bg-white dark:bg-slate-900 flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{rule.name}</p>
                  <Badge variant={rule.enabled ? 'success' : 'outline'} className="text-[10px]">
                    {rule.enabled ? 'Actif' : 'Inactif'}
                  </Badge>
                  <Badge variant="info" className="text-[10px]">
                    {rule.eventType === 'entry' ? 'Entrée' : rule.eventType === 'exit' ? 'Sortie' : 'Entrée/Sortie'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Zone : {rule.zoneLabel} · {ALERT_SCOPE_TYPE_LABELS[rule.scopeType]} ·{' '}
                  {rule.scopeIds.join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  Sévérité : {rule.severity} ·{' '}
                  {rule.activationType === 'permanent' ? 'Permanente' : 'Temporaire'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(enabled) => saveRule.mutate({ ...rule, enabled })}
                />
                <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule.mutate(rule.id)}
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Modifier la règle geofence' : 'Nouvelle règle geofence'}
            </DialogTitle>
          </DialogHeader>
          <GeofenceRuleForm
            initial={editing}
            onSubmit={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
