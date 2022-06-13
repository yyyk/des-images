import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';

const focusableElements =
  'a[href]:not(.disabled), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

interface ModalProps {
  children: ReactNode;
  open: boolean;
  disableClose?: boolean;
  actions?: ReactNode;
  'data-testid'?: string;
  onClose: () => void;
}

const Modal = ({ children, open, disableClose = false, actions, 'data-testid': dataTestId, onClose }: ModalProps) => {
  const { theme } = useThemeContext();
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef(null as null | HTMLDivElement);
  const lastActiveElementRef = useRef(null as null | Element);

  useEffectOnce(() => {
    let element = document.getElementById('modal');
    setWrapperElement(element ?? null);

    return () => {
      document.body.style.overflow = '';
    };
  });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  const handleClose = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (lastActiveElementRef?.current as HTMLElement)?.focus();
    document.body.style.overflow = '';
    onClose();
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    lastActiveElementRef.current = document.activeElement;
    (overlayRef?.current?.querySelectorAll(focusableElements)[0] as HTMLElement)?.focus();
    const closeOnEscapeKey = (e: KeyboardEvent) => {
      if (!open) {
        return;
      }
      switch (e?.key) {
        case 'Escape':
          handleClose(e);
          break;
        case 'Tab':
          {
            const elements = overlayRef?.current?.querySelectorAll(focusableElements) ?? [];
            const firstEl = elements[0] ?? null;
            const lastEl = elements[elements.length - 1] ?? null;
            if (document.activeElement === firstEl && e.shiftKey) {
              e.preventDefault();
              (lastEl as HTMLElement)?.focus();
            } else if (document.activeElement === lastEl && !e.shiftKey) {
              e.preventDefault();
              (firstEl as HTMLElement)?.focus();
            }
          }
          break;
        default:
      }
    };
    document.body.addEventListener('keydown', closeOnEscapeKey as any);
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeKey as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!disableClose && e.target && overlayRef?.current === e.target) {
      handleClose(e);
    }
  };

  if (wrapperElement === null) {
    return null;
  }

  return createPortal(
    <>
      <input type="checkbox" className="modal-toggle" checked={open} onChange={() => {}} disabled />
      <div
        ref={overlayRef}
        data-theme={theme}
        className={`modal ${!disableClose ? 'cursor-pointer' : ''}`}
        onClick={handleOverlayClick}
      >
        <div
          className={`modal-box prose relative flex flex-col flex-nowrap overflow-hidden cursor-default px-0 pt-10 ${
            actions ? 'pb-7' : 'pb-10'
          }`}
          aria-modal="true"
          data-testid={dataTestId}
        >
          <div className="h-full overflow-auto px-10 py-2">{children}</div>
          {actions && <div className="flex justify-end px-10 pt-4">{actions}</div>}
          <button
            className="btn btn-sm btn-circle btn-outline absolute right-2 top-2"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
      </div>
    </>,
    wrapperElement,
  );
};

export default Modal;
