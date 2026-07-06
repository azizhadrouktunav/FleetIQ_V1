import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Vehicle } from '@/types';
import type { AlertScopeRef } from '@/types/alert-config';
import { ScopeSelectorPanel } from '@/features/alert-center/components/config/ScopeSelectorPanel';
import { AlertConfigSectionsPanel } from '@/features/alert-center/components/config/AlertConfigSectionsPanel';
import { Button } from '@/components/ui/button';

interface AlertConfigurationPageProps {
  vehicles?: Vehicle[];
  onBack?: () => void;
}

export function AlertConfigurationPage({ vehicles = [], onBack }: AlertConfigurationPageProps) {
  const [selectedScopes, setSelectedScopes] = useState<AlertScopeRef[]>([]);

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Paramétrage des alertes
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configurez les alertes par véhicule, groupe ou département
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        <aside className="w-[280px] shrink-0 min-h-0">
          <ScopeSelectorPanel
            vehicles={vehicles}
            selectedScopes={selectedScopes}
            onSelectionChange={setSelectedScopes}
          />
        </aside>
        <main className="flex-1 min-w-0 min-h-0 bg-slate-50 dark:bg-slate-950">
          <AlertConfigSectionsPanel selectedScopes={selectedScopes} vehicles={vehicles} />
        </main>
      </div>
    </div>
  );
}
