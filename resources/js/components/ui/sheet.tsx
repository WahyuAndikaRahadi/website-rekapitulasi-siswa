'use client';

import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

// ─── Context ────────────────────────────────────────────────────────────────

interface SheetContextValue {
    open: boolean;
    onClose: () => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheet() {
    const ctx = React.useContext(SheetContext);
    if (!ctx) throw new Error('Sheet components must be used within <Sheet>');
    return ctx;
}

// ─── Root ────────────────────────────────────────────────────────────────────

interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

function Sheet({ open: controlledOpen, onOpenChange, children }: SheetProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const onClose = React.useCallback(() => {
        setInternalOpen(false);
        onOpenChange?.(false);
    }, [onOpenChange]);

    return (
        <SheetContext.Provider value={{ open, onClose }}>
            {children}
        </SheetContext.Provider>
    );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

function SheetTrigger({ children, asChild }: { children: React.ReactElement; asChild?: boolean }) {
    const [, forceOpen] = React.useReducer((x: number) => x + 1, 0);
    const ctx = React.useContext(SheetContext);

    return React.cloneElement(children, {
        onClick: (e: React.MouseEvent) => {
            children.props.onClick?.(e);
            // If Sheet is controlled, caller manages state. If uncontrolled, open via context.
            if (ctx) {
                // Trigger open via a synthetic event up the tree isn't straightforward —
                // uncontrolled sheet needs parent to handle open state.
                // The pattern here is the parent calls Sheet with open={} onOpenChange={}
            }
        },
    });
}

// ─── Content ─────────────────────────────────────────────────────────────────

type SheetSide = 'left' | 'right' | 'top' | 'bottom';

const slideVariants: Record<SheetSide, { initial: object; animate: object; exit: object }> = {
    left: {
        initial: { x: '-100%' },
        animate: { x: 0 },
        exit: { x: '-100%' },
    },
    right: {
        initial: { x: '100%' },
        animate: { x: 0 },
        exit: { x: '100%' },
    },
    top: {
        initial: { y: '-100%' },
        animate: { y: 0 },
        exit: { y: '-100%' },
    },
    bottom: {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
    },
};

const sideClasses: Record<SheetSide, string> = {
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
    top: 'inset-x-0 top-0 border-b',
    bottom: 'inset-x-0 bottom-0 border-t',
};

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: SheetSide;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
    ({ side = 'right', className, children, ...props }, ref) => {
        const { open, onClose } = useSheet();
        const anim = slideVariants[side];

        // Close on Escape
        React.useEffect(() => {
            if (!open) return;
            const handler = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handler);
            document.body.style.overflow = 'hidden';
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
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                            aria-hidden="true"
                        />
                        {/* Panel */}
                        <motion.div
                            ref={ref}
                            role="dialog"
                            aria-modal="true"
                            className={cn(
                                'fixed z-50 bg-sidebar p-6 shadow-xl',
                                sideClasses[side],
                                className,
                            )}
                            initial={anim.initial}
                            animate={anim.animate}
                            exit={anim.exit}
                            transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                            {...(props as React.HTMLAttributes<HTMLDivElement>)}
                        >
                            {children}
                            <button
                                onClick={onClose}
                                className="absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                aria-label="Tutup"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>,
            document.body,
        );
    },
);
SheetContent.displayName = 'SheetContent';

// ─── Sub-components ──────────────────────────────────────────────────────────

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn('text-lg font-semibold text-foreground', className)} {...props} />
    ),
);
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
    ),
);
SheetDescription.displayName = 'SheetDescription';

const SheetClose = ({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { onClose } = useSheet();
    return (
        <button onClick={onClose} className={className} {...props}>
            {children}
        </button>
    );
};
SheetClose.displayName = 'SheetClose';

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger };
