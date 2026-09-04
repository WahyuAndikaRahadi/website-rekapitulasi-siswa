import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// ─── Simple Select (native <select> re-styled) ───────────────────────────────

export interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/**
 * SelectNative — native <select> re-styled.
 * Accessible by default, zero JS overhead.
 * Use for simple dropdowns where searchability is not needed.
 */
const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(({ className, children, ...props }, ref) => (
    <div className="relative w-full">
        <select
            ref={ref}
            className={cn(
                'flex h-10 w-full appearance-none rounded-md border border-border bg-card px-3 py-2 pr-9 text-sm text-foreground',
                'transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            {children}
        </select>
        <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
        />
    </div>
));
SelectNative.displayName = 'SelectNative';

// ─── Radix-compatible API aliases (wrappers over SelectNative) ───────────────
// These provide compatibility shims so existing pages don't break immediately.
// They map the Radix-style API (Select > SelectTrigger > SelectContent > SelectItem)
// to a controlled SelectNative under the hood.

interface SelectContextValue {
    value: string;
    onValueChange: (v: string) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
    placeholder?: string;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectCtx() {
    const ctx = React.useContext(SelectContext);
    if (!ctx) throw new Error('Select sub-components must be used inside <Select>');
    return ctx;
}

interface SelectProps {
    children: React.ReactNode;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
}

function Select({ children, value: controlledValue, defaultValue = '', onValueChange }: SelectProps) {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [open, setOpen] = React.useState(false);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const handleChange = (v: string) => {
        setInternalValue(v);
        onValueChange?.(v);
    };

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleChange, open, setOpen }}>
            {children}
        </SelectContext.Provider>
    );
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface SelectValueProps {
    placeholder?: string;
    className?: string;
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
    const { value } = useSelectCtx();
    return <span className={cn(!value && 'text-muted-foreground')}>{value || placeholder}</span>;
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useSelectCtx();
        return (
            <button
                ref={ref}
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground',
                    'transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    '[&>span]:line-clamp-1 [&>span]:truncate',
                    className,
                )}
                onClick={() => setOpen(!open)}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : undefined }} />
            </button>
        );
    },
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
    position?: 'popper' | 'item-aligned';
    children: React.ReactNode;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = useSelectCtx();
        const containerRef = React.useRef<HTMLDivElement>(null);

        const mergedRef = (node: HTMLDivElement | null) => {
            (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        };

        React.useEffect(() => {
            if (!open) return;
            const handler = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setOpen(false);
                }
            };
            document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
        }, [open, setOpen]);

        if (!open) return null;

        return (
            <div
                ref={mergedRef}
                role="listbox"
                className={cn(
                    'absolute z-50 mt-1 max-h-64 w-full min-w-[8rem] overflow-y-auto rounded-md border border-border bg-card p-1 text-foreground shadow-md',
                    'animate-in fade-in-0 zoom-in-95',
                    className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    },
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, children, value, disabled, ...props }, ref) => {
        const { value: selectedValue, onValueChange, setOpen } = useSelectCtx();
        const isSelected = selectedValue === value;

        return (
            <div
                ref={ref}
                role="option"
                aria-selected={isSelected}
                aria-disabled={disabled}
                className={cn(
                    'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm',
                    'transition-colors hover:bg-muted focus:bg-muted outline-none',
                    isSelected && 'bg-primary/8 font-medium text-primary',
                    disabled && 'pointer-events-none opacity-50',
                    className,
                )}
                onClick={() => {
                    if (!disabled) {
                        onValueChange(value);
                        setOpen(false);
                    }
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                </span>
                {children}
            </div>
        );
    },
);
SelectItem.displayName = 'SelectItem';

const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('py-1.5 pl-8 pr-2 text-xs font-semibold text-muted-foreground', className)} {...props} />
    ),
);
SelectLabel.displayName = 'SelectLabel';

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
    ),
);
SelectSeparator.displayName = 'SelectSeparator';

// Stub scroll buttons (no-op in native impl)
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectNative,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
};
