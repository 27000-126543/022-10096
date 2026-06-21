import { cn } from '@/lib/utils';

export type StatusType =
  | 'draft'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'pending'
  | 'active'
  | 'revoked'
  | 'normal'
  | 'resign';

const statusConfig: Record<
  StatusType,
  { label: string; className: string; dotClassName: string }
> = {
  draft: {
    label: '草稿',
    className: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    dotClassName: 'bg-neutral-500',
  },
  reviewing: {
    label: '审核中',
    className: 'bg-warning-50 text-warning-700 border-warning-200',
    dotClassName: 'bg-warning-500 animate-pulse-soft',
  },
  approved: {
    label: '已通过',
    className: 'bg-success-50 text-success-700 border-success-200',
    dotClassName: 'bg-success-500',
  },
  rejected: {
    label: '已驳回',
    className: 'bg-danger-50 text-danger-700 border-danger-200',
    dotClassName: 'bg-danger-500',
  },
  published: {
    label: '已发布',
    className: 'bg-primary-50 text-primary-700 border-primary-200',
    dotClassName: 'bg-primary-500',
  },
  pending: {
    label: '待处理',
    className: 'bg-warning-50 text-warning-700 border-warning-200',
    dotClassName: 'bg-warning-500',
  },
  active: {
    label: '生效中',
    className: 'bg-success-50 text-success-700 border-success-200',
    dotClassName: 'bg-success-500',
  },
  revoked: {
    label: '已撤销',
    className: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    dotClassName: 'bg-neutral-500',
  },
  normal: {
    label: '正常',
    className: 'bg-success-50 text-success-700 border-success-200',
    dotClassName: 'bg-success-500',
  },
  resign: {
    label: '已离职',
    className: 'bg-danger-50 text-danger-700 border-danger-200',
    dotClassName: 'bg-danger-500',
  },
};

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, label, size = 'sm', className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-sm font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0', config.dotClassName)} />
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
