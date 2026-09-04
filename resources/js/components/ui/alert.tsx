import * as React from 'react';

import { cn } from '@/lib/utils';

// Hapus class-variance-authority — ganti dengan plain mapping

type AlertVariant = 'default' | 'destructive' | 'success' | 'warning';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
    default: 'bg-card text-foreground border-border',
    destructive: 'border-destructive/40 bg-destructive/8 text-destructive [&>svg]:text-destructive',
    success: 'border-success/40 bg-success/8 text-success [&>svg]:text-success',
    warning: 'border-warning/40 bg-warning/10 text-warning-foreground [&>svg]:text-amber-600',
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'default', ...props }, ref) => (
    <div
        ref={ref}
        role="alert"
        className={cn(
            'relative w-full rounded-lg border p-4',
            '[&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]',
            '[&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4',
            variantClasses[variant],
            className,
        )}
        {...props}
    />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
    ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
    ),
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertDescription, AlertTitle };
