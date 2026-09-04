'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

// ─── Context ────────────────────────────────────────────────────────────────

interface DialogContextValue {
    open: boolean;
    onClose: () => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
    const ctx = React.useContext(DialogContext);
    if (!ctx) throw new Error('Dialog components must be used within <Dialog>');
    return ctx;
}

// ─── Root ────────────────────────────────────────────────────────────────────

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <DialogContext.Provider value={{ open, onClose: () => onOpenChange(false) }}>
            {children}
        </DialogContext.Provider>
    );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

interface DialogTriggerProps {
    children: React.ReactElement;
    asChild?: boolean;
}

function DialogTrigger({ children }: DialogTriggerProps) {
    return children;
}

// ─── Content ─────────────────────────────────────────────────────────────────

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, onClose } = useDialog();

        // Close on Escape
        React.useEffect(() => {
            const handler = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            if (open) {
                document.addEventListener('keydown', handler);
                // Prevent body scroll
                document.body.style.overflow = 'hidden';
            }
            return () => {
                document.removeEventListener('keydown', handler);
                document.body.style.overflow = '';
            };
        }, [open, onClose]);

        if (typeof window === 'undefined') return null;

        return createPortal(
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            onClick={onClose}
                            aria-hidden="true"
                        />
                        {/* Panel */}
                        <motion.div
                            ref={ref}
                            role="dialog"
                            aria-modal="true"
                            className={cn(
                                'fixed left-1/2 top-1/2 z-50 w-full max-w-lg',
                                '-translate-x-1/2 -translate-y-1/2',
                                'rounded-xl border border-border bg-card p-6 shadow-xl',
                                className,
                            )}
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
                            {...(props as React.HTMLAttributes<HTMLDivElement>)}
                        >
                            {children}
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                aria-label="Tutup"
                            >
                                <X className="size-4" />
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>,
            document.body,
        );
    },
);
DialogContent.displayName = 'DialogContent';

// ─── Sub-components ──────────────────────────────────────────────────────────

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mb-4 flex flex-col space-y-1.5', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight text-foreground', className)} {...props} />
    ),
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
    ),
);
DialogDescription.displayName = 'DialogDescription';

// Named re-exports for compatibility
const DialogClose = ({ children, ...props }: React.HTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode }) => {
    const { onClose } = useDialog();
    return (
        <button onClick={onClose} {...props}>
            {children}
        </button>
    );
};
DialogClose.displayName = 'DialogClose';

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
};
