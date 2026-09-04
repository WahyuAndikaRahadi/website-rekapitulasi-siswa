import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

// ─── TooltipProvider (no-op wrapper for compatibility) ───────────────────────

function TooltipProvider({ children, delayDuration: _d }: { children: React.ReactNode; delayDuration?: number }) {
    return <>{children}</>;
}

// ─── Context ────────────────────────────────────────────────────────────────

interface TooltipContextValue {
    open: boolean;
    setOpen: (v: boolean) => void;
    triggerRef: React.RefObject<HTMLElement | null>;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltipCtx() {
    const ctx = React.useContext(TooltipContext);
    if (!ctx) throw new Error('Tooltip components must be used within <Tooltip>');
    return ctx;
}

// ─── Root ────────────────────────────────────────────────────────────────────

function Tooltip({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLElement | null>(null);

    return (
        <TooltipContext.Provider value={{ open, setOpen, triggerRef }}>
            {children}
        </TooltipContext.Provider>
    );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

function TooltipTrigger({ children, asChild }: { children: React.ReactElement; asChild?: boolean }) {
    const { setOpen, triggerRef } = useTooltipCtx();
    const child = React.Children.only(children);

    return React.cloneElement(child, {
        ref: triggerRef,
        onMouseEnter: (e: React.MouseEvent) => {
            setOpen(true);
            child.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            setOpen(false);
            child.props.onMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent) => {
            setOpen(true);
            child.props.onFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
            setOpen(false);
            child.props.onBlur?.(e);
        },
    });
}

// ─── Content ─────────────────────────────────────────────────────────────────

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
    sideOffset?: number;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

function TooltipContent({ className, children, sideOffset = 6, side = 'top', ...props }: TooltipContentProps) {
    const { open, triggerRef } = useTooltipCtx();
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const contentEl = contentRef.current;
            const cw = contentEl?.offsetWidth ?? 0;
            const ch = contentEl?.offsetHeight ?? 0;

            let top = 0;
            let left = 0;

            if (side === 'top') {
                top = rect.top - ch - sideOffset + window.scrollY;
                left = rect.left + rect.width / 2 - cw / 2 + window.scrollX;
            } else if (side === 'bottom') {
                top = rect.bottom + sideOffset + window.scrollY;
                left = rect.left + rect.width / 2 - cw / 2 + window.scrollX;
            } else if (side === 'left') {
                top = rect.top + rect.height / 2 - ch / 2 + window.scrollY;
                left = rect.left - cw - sideOffset + window.scrollX;
            } else {
                top = rect.top + rect.height / 2 - ch / 2 + window.scrollY;
                left = rect.right + sideOffset + window.scrollX;
            }

            setPosition({ top, left });
        }
    }, [open, sideOffset, side, triggerRef]);

    if (!open || typeof window === 'undefined') return null;

    return createPortal(
        <div
            ref={contentRef}
            role="tooltip"
            className={cn(
                'fixed z-50 overflow-hidden rounded-md border border-border bg-foreground px-3 py-1.5 text-xs text-background shadow-md',
                'animate-in fade-in-0 zoom-in-95',
                className,
            )}
            style={{ top: position.top, left: position.left }}
            {...props}
        >
            {children}
        </div>,
        document.body,
    );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
