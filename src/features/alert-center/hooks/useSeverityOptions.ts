import type { AlertSeverity } from '@/types/alerts';
import type { SeverityOption } from '@/types/alert-config';
import { SEVERITY_CONFIG } from '@/design-system/severity';
import { useBuiltinSeverityOverrides } from '../hooks/useAlertQueries';

const BUILTIN_SEVERITIES: AlertSeverity[] = ['critical', 'warning', 'info'];

export function useSeverityOptions(): {
  options: SeverityOption[];
  isLoading: boolean;
} {
  const { data: overrides = [], isLoading: overridesLoading } = useBuiltinSeverityOverrides();

  const options: SeverityOption[] = BUILTIN_SEVERITIES.map((severity) => {
    const override = overrides.find((o) => o.severity === severity);
    const config = SEVERITY_CONFIG[severity];
    return {
      id: severity,
      label: override?.label ?? config.label,
      color: override?.color ?? defaultBuiltinColor(severity),
      isCustom: false,
    };
  });

  return { options, isLoading: overridesLoading };
}

function defaultBuiltinColor(severity: AlertSeverity): string {
  if (severity === 'critical') return '#e11d48';
  if (severity === 'warning') return '#d97706';
  return '#2563eb';
}

export function getSeverityLabel(
  severityId: string,
  options: SeverityOption[]
): string {
  return options.find((o) => o.id === severityId)?.label ?? severityId;
}
