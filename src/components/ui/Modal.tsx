import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = '520px',
  closable = true,
  maskClosable = true,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, closable, onClose]);

  if (!open) return null;

  const handleMaskClick = () => {
    if (maskClosable && closable) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-[1px] animate-fade-in"
        onClick={handleMaskClick}
      />
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{ width }}
        className={cn(
          'relative bg-white rounded-sm shadow-lg w-full max-w-[90vw] max-h-[85vh] flex flex-col overflow-hidden animate-fade-in',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary-700 text-white px-5 py-3.5 flex items-center flex-shrink-0">
          <h3 className="text-base font-semibold flex-1 truncate pr-4">{title}</h3>
          {closable && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-sm flex items-center justify-center hover:bg-primary-600/80 transition-colors flex-shrink-0"
              aria-label="关闭"
            >
              <X size={17} strokeWidth={1.8} />
            </button>
          )}
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1 text-sm text-neutral-700 leading-relaxed">
          {children}
        </div>

        {footer && (
          <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-end space-x-2 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
