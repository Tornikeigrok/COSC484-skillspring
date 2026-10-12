import {
  ERROR_STATUSES,
  STATUS_LABELS,
  SUCCESS_STATUSES,
  WARNING_STATUSES,
} from '../../constants/status';
import { Badge } from './Badge';

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      tone={
        SUCCESS_STATUSES.includes(status)
          ? 'success'
          : ERROR_STATUSES.includes(status)
            ? 'error'
            : WARNING_STATUSES.includes(status)
              ? 'warning'
              : 'neutral'
      }
    >
      {STATUS_LABELS[status] || status.replaceAll('_', ' ')}
    </Badge>
  );
}
