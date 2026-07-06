import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { BuiltinSeverityOverride } from '@/types/alert-config';
import type { AlertSeverity } from '@/types/alerts';
import { SEVERITY_CONFIG } from '@/design-system/severity';
import { SEVERITY_COLOR_PRESETS } from '../../mocks/mockCustomSeverities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const BUILTIN: AlertSeverity[] = ['critical', 'warning', 'info'];

function defaultBuiltinColor(severity: AlertSeverity): string {
  if (severity === 'critical') return SEVERITY_COLOR_PRESETS[0];
  if (severity === 'warning') return SEVERITY_COLOR_PRESETS[2];
  return SEVERITY_COLOR_PRESETS[3];
}

interface BuiltinSeverityListProps {
  getOverride: (severity: AlertSeverity) => BuiltinSeverityOverride;
  onUpdate: (severity: AlertSeverity, patch: Partial<BuiltinSeverityOverride>) => void;
}

export function BuiltinSeverityList({ getOverride, onUpdate }: BuiltinSeverityListProps) {
  const [editing, setEditing] = useState<AlertSeverity | null>(null);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftColor, setDraftColor] = useState(SEVERITY_COLOR_PRESETS[0]);

  const openEdit = (severity: AlertSeverity) => {
    const override = getOverride(severity);
    const defaultLabel = SEVERITY_CONFIG[severity].label;
    setDraftLabel(override.label ?? defaultLabel);
    setDraftColor(override.color ?? defaultBuiltinColor(severity));
    setEditing(severity);
  };

  const handleSave = () => {
    if (!editing) return;
    const defaultLabel = SEVERITY_CONFIG[editing].label;
    onUpdate(editing, {
      label: draftLabel.trim() === defaultLabel ? undefined : draftLabel.trim() || undefined,
      color: draftColor,
    });
    setEditing(null);
  };

  return (
    <>
      <ul className="space-y-2">
        {BUILTIN.map((severity) => {
          const override = getOverride(severity);
          const defaultLabel = SEVERITY_CONFIG[severity].label;
          const displayLabel = override.label ?? defaultLabel;
          const displayColor = override.color ?? defaultBuiltinColor(severity);

          return (
            <li
              key={severity}
              className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white border border-slate-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: displayColor }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{displayLabel}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{defaultLabel}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openEdit(severity)}
                title="Modifier"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </li>
          );
        })}
      </ul>

      <Dialog open={editing != null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Modifier — {editing ? SEVERITY_CONFIG[editing].label : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs">Nom affiché</Label>
              <Input
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder={editing ? SEVERITY_CONFIG[editing].label : ''}
                className="h-9 text-sm mt-1"
              />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Couleur</Label>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setDraftColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                      draftColor === color ? 'border-slate-900 ring-2 ring-offset-1 ring-slate-400' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button type="button" size="sm" onClick={handleSave}>
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
