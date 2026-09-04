'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronRight, Circle } from 'lucide-react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

// ─── Context ────────────────────────────────────────────────────────────────

interface DropdownContextValue {
    open: boolean;
    setOpen: (v: boolean) => void;
    triggerRef: React.RefObject<HTMLElement | null>;
    align?: 'start' | 'end' | 'center';
    side?: 'bottom' | 'top' | 'left' | 'right';
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdown() {
    const ctx = React.useContext(DropdownContext);
    if (!ctx) throw new Error('DropdownMenu components must be used within <DropdownMenu>');
    return ctx;
}

// ─── Root ────────────────────────────────────────────────────────────────────

interface DropdownMenuProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLElement | null>(null);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = React.useCallback(
        (v: boolean) => {
            setInternalOpen(v);
            onOpenChange?.(v);
        },
        [onOpenChange],
    );

    return (
        <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
            {children}
        </DropdownContext.Provider>
    );
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

interface DropdownMenuTriggerProps {
    children: React.ReactElement;
    asChild?: boolean;
}

function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
    const { open, setOpen, triggerRef } = useDropdown();

    const child = React.Children.only(children);
    return React.cloneElement(child, {
        ref: triggerRef,
        onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            setOpen(!open);
            child.props.onClick?.(e);
        },
        'data-state': open ? 'open' : 'closed',
        'aria-expanded': open,
        'aria-haspopup': 'menu',
    });
}

// ─── Content ─────────────────────────────────────────────────────────────────

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: 'start' | 'end' | 'center';
    side?: 'bottom' | 'top';
    sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
    ({ className, children, align = 'start', side = 'bottom', sideOffset = 4, ...props }, ref) => {
        const { open, setOpen, triggerRef } = useDropdown();
        const contentRef = React.useRef<HTMLDivElement>(null);
        const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

        // Merge refs
        const mergedRef = (node: HTMLDivElement | null) => {
            (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        };

        // Calculate position relative to trigger
        React.useEffect(() => {
            if (open && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                const left =
                    align === 'end'
                        ? rect.right - (contentRef.current?.offsetWidth ?? rect.width)
                        : align === 'center'
                          ? rect.left + rect.width / 2 - (contentRef.current?.offsetWidth ?? rect.width) / 2
                          : rect.left;
                const top =
                    side === 'top'
                        ? rect.top - (contentRef.current?.offsetHeight ?? 0) - sideOffset + window.scrollY
                        : rect.bottom + sideOffset + window.scrollY;

                setPosition({ top, left: left + window.scrollX, width: rect.width });
            }
        }, [open, align, side, sideOffset, triggerRef]);

        // Close on outside click
        React.useEffect(() => {
            if (!open) return;
            const handler = (e: MouseEvent) => {
                if (
                    contentRef.current &&
                    !contentRef.current.contains(e.target as Node) &&
                    triggerRef.current &&
                    !triggerRef.current.contains(e.target as Node)
                ) {
                    setOpen(false);
                }
            };
            const keyHandler = (e: KeyboardEvent) => {
                if (e.key === 'Escape') setOpen(false);
            };
            document.addEventListener('mousedown', handler);
            document.addEventListener('keydown', keyHandler);
            return () => {
                document.removeEventListener('mousedown', handler);
                document.removeEventListener('keydown', keyHandler);
            };
        }, [open, setOpen, triggerRef]);

        if (typeof window === 'undefined') return null;

        return createPortal(
            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={mergedRef}
                        role="menu"
                        aria-orientation="vertical"
                        className={cn(
                            'fixed z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-card p-1 text-foreground shadow-lg',
                            className,
                        )}
                        style={{
                            top: position.top,
                            left: position.left,
                            minWidth: props['style']?.minWidth ?? `${position.width}px`,
                            ...props.style,
                        }}
                        initial={{ opacity: 0, scale: 0.97, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: -4 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        {...(props as React.HTMLAttributes<HTMLDivElement>)}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body,
        );
    },
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

// ─── Item ────────────────────────────────────────────────────────────────────

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    inset?: boolean;
    asChild?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
    ({ className, inset, asChild, children, onClick, ...props }, ref) => {
        const { setOpen } = useDropdown();

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            setOpen(false);
        };

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                className: cn(
                    'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none',
                    'transition-colors duration-100 hover:bg-muted focus:bg-muted',
                    'disabled:pointer-events-none disabled:opacity-50',
                    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                    inset && 'pl-8',
                    className,
                ),
                role: 'menuitem',
                onClick: (e: React.MouseEvent) => {
                    (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.onClick?.(e as React.MouseEvent<HTMLElement>);
                    setOpen(false);
                },
            });
        }

        return (
            <button
                ref={ref}
                role="menuitem"
                className={cn(
                    'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none',
                    'transition-colors duration-100 hover:bg-muted focus:bg-muted',
                    'disabled:pointer-events-none disabled:opacity-50',
                    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                    inset && 'pl-8',
                    className,
                )}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        );
    },
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

// ─── Label ───────────────────────────────────────────────────────────────────

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
    inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
    ({ className, inset, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('px-2 py-1.5 text-sm font-semibold text-foreground', inset && 'pl-8', className)}
            {...props}
        />
    ),
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// ─── Separator ───────────────────────────────────────────────────────────────

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
    ),
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// ─── Group ───────────────────────────────────────────────────────────────────

const DropdownMenuGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div role="group" className={cn(className)} {...props} />
);
DropdownMenuGroup.displayName = 'DropdownMenuGroup';

// ─── Shortcut ────────────────────────────────────────────────────────────────

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
);
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

// ─── Sub (stub — dipakai kalau ada nested menu) ──────────────────────────────

const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DropdownMenuSubTrigger = ({ children, className, inset, ...props }: DropdownMenuItemProps & { inset?: boolean }) => (
    <div
        className={cn(
            'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
            'transition-colors duration-100 hover:bg-muted',
            inset && 'pl-8',
            className,
        )}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
    </div>
);
const DropdownMenuSubContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card p-1 text-foreground shadow-lg',
            className,
        )}
        {...props}
    />
);

// ─── Checkbox & Radio items (stubs) ──────────────────────────────────────────

interface DropdownMenuCheckboxItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
    ({ className, children, checked, ...props }, ref) => (
        <button
            ref={ref}
            role="menuitemcheckbox"
            aria-checked={checked}
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                'transition-colors hover:bg-muted',
                'disabled:pointer-events-none disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {checked && <Check className="h-4 w-4" />}
            </span>
            {children}
        </button>
    ),
);
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

interface DropdownMenuRadioItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

const DropdownMenuRadioItem = React.forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
    ({ className, children, ...props }, ref) => (
        <button
            ref={ref}
            role="menuitemradio"
            className={cn(
                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                'transition-colors hover:bg-muted',
                'disabled:pointer-events-none disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Circle className="h-2 w-2 fill-current" />
            </span>
            {children}
        </button>
    ),
);
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

const DropdownMenuRadioGroup = ({ ...props }: React.HTMLAttributes<HTMLDivElement>) => <div role="radiogroup" {...props} />;
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
};
