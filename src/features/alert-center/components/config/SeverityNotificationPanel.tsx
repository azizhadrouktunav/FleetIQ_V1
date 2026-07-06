import { useEffect, useState } from 'react';
import type {
  AlertConfigChannel,
  AlertRecipientRole,
  BuiltinSeverityOverride,
  SeverityLevelId,
  SeverityNotificationPolicy,
} from '@/types/alert-config';
import { ALERT_RECIPIENT_ROLE_LABELS } from '@/types/alert-config';
import {
  useNamedUsers,
  useSaveBuiltinSeverityOverrides,
  useSaveSeverityPolicies,
  useSeverityPolicies,
  useBuiltinSeverityOverrides,
} from '../../hooks/useAlertQueries';
import { useSeverityOptions } from '../../hooks/useSeverityOptions';
import { BuiltinSeverityList } from './BuiltinSeverityList';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AlertSeverity } from '@/types/alerts';

const ROLES: AlertRecipientRole[] = ['administrator', 'driver', 'fleet_manager', 'user'];
const CHANNELS: { id: AlertConfigChannel; label: string }[] = [
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push Notification' },
];

export function SeverityNotificationPanel() {
  const { data: policies = [], isLoading } = useSeverityPolicies();
  const { data: overrides = [] } = useBuiltinSeverityOverrides();
  const { data: namedUsers = [] } = useNamedUsers();
  const { options } = useSeverityOptions();
  const savePolicies = useSaveSeverityPolicies();
  const saveOverrides = useSaveBuiltinSeverityOverrides();
  const [localPolicies, setLocalPolicies] = useState<SeverityNotificationPolicy[]>([]);
  const [localOverrides, setLocalOverrides] = useState<BuiltinSeverityOverride[]>([]);

  useEffect(() => {
    if (policies.length) setLocalPolicies(policies);
  }, [policies]);

  useEffect(() => {
    setLocalOverrides(overrides);
  }, [overrides]);

  const getOverride = (severity: AlertSeverity) =>
    localOverrides.find((o) => o.severity === severity) ?? { severity };

  const updateOverride = (severity: AlertSeverity, patch: Partial<BuiltinSeverityOverride>) => {
    setLocalOverrides((prev) => {
      const existing = prev.find((o) => o.severity === severity);
      if (existing) {
        return prev.map((o) => (o.severity === severity ? { ...o, ...patch } : o));
      }
      return [...prev, { severity, ...patch }];
    });
  };

  const getPolicy = (severity: SeverityLevelId) =>
    localPolicies.find((p) => p.severity === severity) ?? {
      severity,
      roles: [],
      userIds: [],
      channels: [],
    };

  const updatePolicy = (severity: SeverityLevelId, patch: Partial<SeverityNotificationPolicy>) => {
    setLocalPolicies((prev) => {
      const existing = prev.find((p) => p.severity === severity);
      if (existing) {
        return prev.map((p) => (p.severity === severity ? { ...p, ...patch } : p));
      }
      return [...prev, { severity, roles: [], userIds: [], channels: [], ...patch }];
    });
  };

  const toggleRole = (severity: SeverityLevelId, role: AlertRecipientRole) => {
    const policy = getPolicy(severity);
    const roles = policy.roles.includes(role)
      ? policy.roles.filter((r) => r !== role)
      : [...policy.roles, role];
    updatePolicy(severity, { roles });
  };

  const toggleChannel = (severity: SeverityLevelId, channel: AlertConfigChannel) => {
    const policy = getPolicy(severity);
    const channels = policy.channels.includes(channel)
      ? policy.channels.filter((c) => c !== channel)
      : [...policy.channels, channel];
    updatePolicy(severity, { channels });
  };

  const toggleUser = (severity: SeverityLevelId, userId: string) => {
    const policy = getPolicy(severity);
    const userIds = policy.userIds.includes(userId)
      ? policy.userIds.filter((id) => id !== userId)
      : [...policy.userIds, userId];
    updatePolicy(severity, { userIds });
  };

  const handleSaveAll = () => {
    const allPolicies = options.map((opt) => getPolicy(opt.id));
    saveOverrides.mutate(localOverrides);
    savePolicies.mutate(allPolicies);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des niveaux d&apos;alerte...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Niveaux système</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cliquez sur modifier pour renommer ou changer la couleur d&apos;un niveau.
          </p>
        </div>
        <BuiltinSeverityList getOverride={getOverride} onUpdate={updateOverride} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Politiques de notification par niveau.
        </p>
        <Button
          size="sm"
          disabled={savePolicies.isPending || saveOverrides.isPending}
          onClick={handleSaveAll}
        >
          Enregistrer tout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {options.map((opt) => {
          const policy = getPolicy(opt.id);
          return (
            <Card key={opt.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: opt.color }}
                  />
                  {opt.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
                    Qui — Rôles
                  </p>
                  <div className="space-y-2">
                    {ROLES.map((role) => (
                      <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={policy.roles.includes(role)}
                          onCheckedChange={() => toggleRole(opt.id, role)}
                        />
                        {ALERT_RECIPIENT_ROLE_LABELS[role]}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
                    Qui — Utilisateurs
                  </p>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {namedUsers.map((user) => (
                      <label key={user.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={policy.userIds.includes(user.id)}
                          onCheckedChange={() => toggleUser(opt.id, user.id)}
                        />
                        <span className="truncate">{user.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">
                    Comment
                  </p>
                  <div className="space-y-2">
                    {CHANNELS.map(({ id, label }) => (
                      <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={policy.channels.includes(id)}
                          onCheckedChange={() => toggleChannel(opt.id, id)}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
