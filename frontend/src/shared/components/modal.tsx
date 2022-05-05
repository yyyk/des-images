import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useThemeContext } from '../contexts/theme';

const focusableElements =
  'a[href]:not(.disabled), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

interface ModalProps {
  children: ReactNode;
  open: boolean;
  disableClose?: boolean;
  onClose: () => void;
}

const Modal = ({ children, open, disableClose = true, onClose }: ModalProps) => {
  const { theme } = useThemeContext();
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef(null as null | HTMLDivElement);
  const lastActiveElementRef = useRef(null as null | Element);

  useLayoutEffect(() => {
    let element = document.getElementById('modal');
    setWrapperElement(element ?? null);
  }, []);

  const handleClose = (e: MouseEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (lastActiveElementRef?.current as HTMLElement)?.focus();
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
          e.preventDefault();
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
    e.preventDefault();
    if (disableClose && e.target && overlayRef?.current === e.target) {
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
        className={`modal ${disableClose ? 'cursor-pointer' : ''}`}
        onClick={disableClose ? handleOverlayClick : undefined}
      >
        <div className="modal-box prose relative cursor-default px-10 py-12" aria-modal="true">
          <div>{children}</div>
          <button
            className="btn btn-sm btn-circle absolute right-2 top-2"
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
