import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getSeverityConfig } from '@/design-system/severity';
import type { TimelineEvent } from '@/types/alerts';
import { groupTimelineByDay } from '../../mocks/mockTimeline';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTypeIcon } from '../shared/AlertTypeIcon';

interface EventTimelineProps {
  events?: TimelineEvent[];
  isLoading?: boolean;
  initialLimit?: number;
}

export function EventTimeline({ events, isLoading, initialLimit }: EventTimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!events?.length) {
    return <p className="text-sm text-muted-foreground p-4">Aucun événement dans l&apos;historique</p>;
  }

  const hasLimit = initialLimit != null && initialLimit > 0;
  const canExpand = hasLimit && events.length > initialLimit;
  const visibleEvents =
    canExpand && !expanded ? events.slice(0, initialLimit) : events;
  const hiddenCount = canExpand ? events.length - initialLimit : 0;

  const grouped = groupTimelineByDay(visibleEvents);

  return (
    <div>
      <div
        className={cn(
          'py-2 space-y-6',
          canExpand && !expanded && 'max-h-[280px] overflow-hidden'
        )}
      >
        {grouped.map(({ day, events: dayEvents }) => (
          <div key={day}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">{day}</h4>
            <div className="relative pl-6 space-y-0">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200" />
              {dayEvents.map((event, idx) => {
                const config = getSeverityConfig(event.severity);
                const isLast = idx === dayEvents.length - 1;
                return (
                  <div key={event.id} className="relative pb-6">
                    <div
                      className={cn(
                        'absolute -left-3.5 w-3 h-3 rounded-full ring-2 ring-white',
                        config.dotColor
                      )}
                    />
                    {!isLast && (
                      <div className="absolute left-[-7px] top-3 text-slate-300 text-[10px]">↓</div>
                    )}
                    <div className="flex-1 min-w-0 ml-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-semibold text-slate-700">{event.time}</span>
                        <AlertTypeIcon alertType={event.type} severity={event.severity} size="sm" />
                        <Badge variant={event.severity === 'critical' ? 'critical' : event.severity === 'warning' ? 'high' : 'info'} className="text-[10px] h-5">
                          {event.severity === 'critical' ? 'Critique' : event.severity === 'warning' ? 'Avertissement' : 'Info'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{event.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      {event.notifiedUser && (
                        <p className="text-[10px] text-slate-400 mt-1">Notifié : {event.notifiedUser}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {canExpand && (
        <div className="flex justify-center pt-1 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <ChevronDown
              className={cn('w-3.5 h-3.5 mr-1 transition-transform', expanded && 'rotate-180')}
            />
            {expanded ? 'Voir moins' : `Voir plus (${hiddenCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}
