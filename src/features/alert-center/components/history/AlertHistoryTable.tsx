import type { ReactNode } from 'react';
import type { AlertHistoryRow } from '../../api/alert-api';
import { Skeleton } from '@/components/ui/skeleton';

function formatHistoryDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

interface AlertHistoryTableProps {
  rows: AlertHistoryRow[];
  isLoading?: boolean;
  footer?: ReactNode;
}

export function AlertHistoryTable({ rows, isLoading, footer }: AlertHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0 && !footer) {
    return (
      <p className="text-sm text-muted-foreground text-center py-16 border border-dashed rounded-lg">
        Aucune alerte pour les filtres sélectionnés.
      </p>
    );
  }

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-16">
          Aucune alerte pour les filtres sélectionnés.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b text-left text-xs text-muted-foreground uppercase">
              <th className="py-3 px-4 font-medium">Date / Heure</th>
              <th className="py-3 px-4 font-medium">Véhicule</th>
              <th className="py-3 px-4 font-medium">Chauffeur</th>
              <th className="py-3 px-4 font-medium">Lieu ou zone</th>
              <th className="py-3 px-4 font-medium">Type d&apos;alerte</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              >
                <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                  {formatHistoryDateTime(row.createdAt)}
                </td>
                <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                  {row.vehicleName}
                </td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{row.driverName}</td>
                <td className="py-3 px-4 text-muted-foreground">{row.locationOrZone}</td>
                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{row.alertTypeLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {footer}
    </div>
  );
}
