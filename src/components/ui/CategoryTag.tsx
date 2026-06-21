import { cn } from '@/lib/utils';

export type CategoryType = 'injection' | 'skin' | 'plastic' | 'antiaging';

const categoryConfig: Record<
  CategoryType,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  injection: {
    label: '注射类',
    bgColor: 'bg-[#7B4B94]/10',
    textColor: 'text-[#7B4B94]',
    borderColor: 'border-[#7B4B94]/30',
  },
  skin: {
    label: '皮肤类',
    bgColor: 'bg-[#2D7DD2]/10',
    textColor: 'text-[#2D7DD2]',
    borderColor: 'border-[#2D7DD2]/30',
  },
  plastic: {
    label: '整形类',
    bgColor: 'bg-[#2E7D5B]/10',
    textColor: 'text-[#2E7D5B]',
    borderColor: 'border-[#2E7D5B]/30',
  },
  antiaging: {
    label: '抗衰类',
    bgColor: 'bg-[#B8860B]/10',
    textColor: 'text-[#B8860B]',
    borderColor: 'border-[#B8860B]/30',
  },
};

export interface CategoryTagProps {
  category: CategoryType;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function CategoryTag({ category, label, size = 'sm', className }: CategoryTagProps) {
  const config = categoryConfig[category];
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-sm font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0',
          category === 'injection' && 'bg-[#7B4B94]',
          category === 'skin' && 'bg-[#2D7DD2]',
          category === 'plastic' && 'bg-[#2E7D5B]',
          category === 'antiaging' && 'bg-[#B8860B]'
        )}
      />
      {displayLabel}
    </span>
  );
}

export default CategoryTag;
