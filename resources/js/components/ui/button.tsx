import * as React from 'react';

import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link' | 'outline' | 'default';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    loadingText?: string;
}

const variantClasses: Record<string, string> = {
    primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm',
    default:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm',
    secondary:
        'border border-border bg-card text-foreground hover:bg-muted active:bg-muted/80 shadow-2xs',
    outline:
        'border border-border bg-card text-foreground hover:bg-muted active:bg-muted/80 shadow-2xs',
    destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 shadow-sm',
    ghost:
        'text-foreground hover:bg-muted active:bg-muted/80',
    link:
        'text-primary underline-offset-4 hover:underline p-0 h-auto',
};

const sizeClasses: Record<ButtonSize, string> = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 py-1.5 text-xs rounded-md',
    lg: 'h-11 px-6 py-2.5 text-sm',
    icon: 'h-10 w-10 p-0',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'default',
            isLoading = false,
            loadingText,
            disabled,
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    // Base
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium select-none',
                    // Transitions
                    'transition-all duration-150',
                    // Focus ring (accessible, custom brand color)
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    // Disabled & Loading
                    'disabled:pointer-events-none disabled:opacity-50',
                    // SVG children
                    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
                    // Variant
                    variantClasses[variant] || variantClasses.primary,
                    // Size
                    sizeClasses[size],
                    className,
                )}
                {...props}
            >
                {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                            aria-hidden="true"
                        />
                        <span>{loadingText || 'Memproses...'}</span>
                    </span>
                ) : (
                    children
                )}
            </button>
        );
    },
);

Button.displayName = 'Button';

export { Button };
