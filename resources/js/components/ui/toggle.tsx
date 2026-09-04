import * as React from 'react';

import { cn } from '@/lib/utils';

// Hapus @radix-ui/react-toggle dan class-variance-authority

type ToggleVariant = 'default' | 'outline';
type ToggleSize = 'default' | 'sm' | 'lg';

const variantClasses: Record<ToggleVariant, string> = {
    default: 'bg-transparent',
    outline: 'border border-border bg-transparent hover:bg-muted hover:text-foreground',
};

const sizeClasses: Record<ToggleSize, string> = {
    default: 'h-10 px-3 min-w-10',
    sm: 'h-9 px-2.5 min-w-9',
    lg: 'h-11 px-5 min-w-11',
};

// Export toggleVariants for toggle-group compatibility
export function toggleVariants({ variant = 'default', size = 'default', className }: { variant?: ToggleVariant; size?: ToggleSize; className?: string } = {}) {
    return cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors',
        'hover:bg-muted hover:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2',
        variantClasses[variant],
        sizeClasses[size],
        className,
    );
}

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    variant?: ToggleVariant;
    size?: ToggleSize;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
    ({ className, variant = 'default', size = 'default', pressed, onPressedChange, onClick, ...props }, ref) => {
        const [internalPressed, setInternalPressed] = React.useState(false);
        const isPressed = pressed !== undefined ? pressed : internalPressed;

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            const next = !isPressed;
            setInternalPressed(next);
            onPressedChange?.(next);
        };

        return (
            <button
                ref={ref}
                role="checkbox"
                aria-checked={isPressed}
                data-state={isPressed ? 'on' : 'off'}
                className={toggleVariants({ variant, size, className })}
                onClick={handleClick}
                {...props}
            />
        );
    },
);
Toggle.displayName = 'Toggle';

export { Toggle };
