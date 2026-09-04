import * as React from 'react';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-primary text-primary-foreground border-transparent',
    secondary: 'bg-secondary text-secondary-foreground border-transparent',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/15 text-warning-foreground border-warning/30',
    outline: 'text-foreground border-border',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variantClasses[variant],
                className,
            )}
            {...props}
        />
    );
}

export { Badge };
