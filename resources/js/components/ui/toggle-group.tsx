import * as React from 'react';

import { toggleVariants } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';

// Hapus @radix-ui/react-toggle-group dan class-variance-authority

type ToggleVariant = 'default' | 'outline';
type ToggleSize = 'default' | 'sm' | 'lg';

interface ToggleGroupContextValue {
    value: string[];
    onValueChange: (value: string[]) => void;
    type: 'single' | 'multiple';
    variant?: ToggleVariant;
    size?: ToggleSize;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
    value: [],
    onValueChange: () => {},
    type: 'single',
    size: 'default',
    variant: 'default',
});

interface ToggleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: 'single' | 'multiple';
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    variant?: ToggleVariant;
    size?: ToggleSize;
    disabled?: boolean;
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
    ({ className, type = 'single', value: controlledValue, defaultValue, onValueChange, variant = 'default', size = 'default', children, ...props }, ref) => {
        const normalize = (v?: string | string[]): string[] => {
            if (!v) return [];
            return Array.isArray(v) ? v : [v];
        };

        const [internalValue, setInternalValue] = React.useState<string[]>(normalize(defaultValue));
        const value = controlledValue !== undefined ? normalize(controlledValue) : internalValue;

        const handleValueChange = (newValue: string[]) => {
            setInternalValue(newValue);
            if (onValueChange) {
                onValueChange(type === 'single' ? (newValue[0] ?? '') : newValue);
            }
        };

        return (
            <ToggleGroupContext.Provider value={{ value, onValueChange: handleValueChange, type, variant, size }}>
                <div ref={ref} className={cn('flex items-center justify-center gap-1', className)} role="group" {...props}>
                    {children}
                </div>
            </ToggleGroupContext.Provider>
        );
    },
);
ToggleGroup.displayName = 'ToggleGroup';

interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    variant?: ToggleVariant;
    size?: ToggleSize;
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
    ({ className, children, value, variant, size, ...props }, ref) => {
        const ctx = React.useContext(ToggleGroupContext);
        const isPressed = ctx.value.includes(value);

        const handleClick = () => {
            if (ctx.type === 'single') {
                ctx.onValueChange(isPressed ? [] : [value]);
            } else {
                ctx.onValueChange(isPressed ? ctx.value.filter((v) => v !== value) : [...ctx.value, value]);
            }
        };

        return (
            <button
                ref={ref}
                role="checkbox"
                aria-checked={isPressed}
                data-state={isPressed ? 'on' : 'off'}
                className={toggleVariants({ variant: variant ?? ctx.variant, size: size ?? ctx.size, className })}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        );
    },
);
ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem };
