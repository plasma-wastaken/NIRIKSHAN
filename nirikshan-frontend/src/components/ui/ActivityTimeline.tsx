import React from 'react';
import { cn } from '../../utils/cn';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: 'default' | 'success' | 'warning' | 'error';
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const statusColors = {
  default: 'bg-surface-200 text-surface-600',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600'
};

const statusBorderColors = {
  default: 'border-surface-200',
  success: 'border-green-200',
  warning: 'border-yellow-200',
  error: 'border-red-200'
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, className }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className={cn("flow-root", className)}>
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => {
          const isLast = eventIdx === events.length - 1;
          const status = event.status || 'default';
          
          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-surface-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span
                      className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white',
                        statusColors[status]
                      )}
                    >
                      {event.icon ? (
                        <div className="h-4 w-4">{event.icon}</div>
                      ) : (
                        <div className={cn("h-2.5 w-2.5 rounded-full border-2", statusBorderColors[status], statusColors[status].split(' ')[0])} />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-surface-900 font-medium">
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="mt-0.5 text-sm text-surface-500">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-surface-500">
                      <time dateTime={event.timestamp}>
                        {new Date(event.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
