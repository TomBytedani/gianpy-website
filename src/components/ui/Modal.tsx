'use client';

import { forwardRef, useEffect, useCallback, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
    (
        {
            className = '',
            isOpen,
            onClose,
            title,
            size = 'md',
            closeOnOverlayClick = true,
            closeOnEscape = true,
            showCloseButton = true,
            children,
            ...props
        },
        ref
    ) => {
        // Handle escape key
        const handleEscape = useCallback(
            (e: KeyboardEvent) => {
                if (e.key === 'Escape' && closeOnEscape) {
                    onClose();
                }
            },
            [closeOnEscape, onClose]
        );

        useEffect(() => {
            if (isOpen) {
                document.addEventListener('keydown', handleEscape);
                document.body.style.overflow = 'hidden';
            }

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = '';
            };
        }, [isOpen, handleEscape]);

        const sizes = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
            full: 'max-w-[90vw] max-h-[90vh]',
        };

        if (!isOpen) return null;

        const modalContent = (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-[var(--foreground)]/50 backdrop-blur-sm transition-opacity"
                    onClick={closeOnOverlayClick ? onClose : undefined}
                    aria-hidden="true"
                />

                {/* Modal Panel */}
                <div
                    ref={ref}
                    className={`
            relative w-full ${sizes[size]}
            bg-[var(--background)]
            border border-[var(--border)]
            rounded-[var(--radius-lg)]
            shadow-[var(--shadow-elevated)]
            animate-scale-in
            ${className}
          `}
                    {...props}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                            {title && (
                                <h2 id="modal-title" className="font-display text-xl text-[var(--foreground)]">
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="
                    ml-auto
                    p-1.5 rounded-[var(--radius-sm)]
                    text-[var(--muted)] hover:text-[var(--foreground)]
                    hover:bg-[var(--background-alt)]
                    transition-colors duration-[var(--transition-fast)]
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
                  "
                                    aria-label="Close modal"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 py-5">{children}</div>
                </div>
            </div>
        );

        // Render in portal for proper z-index stacking
        if (typeof window !== 'undefined') {
            return createPortal(modalContent, document.body);
        }

        return null;
    }
);

Modal.displayName = 'Modal';

// Modal Footer helper component
const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className = '', children, ...props }, ref) => (
        <div
            ref={ref}
            className={`
        flex items-center justify-end gap-3
        border-t border-[var(--border)]
        px-6 py-4
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    )
);

ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalFooter };
