import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    /** Controlled checked state */
    checked?: boolean;
    /** Called when the checked state changes */
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, disabled, id, ...props }, ref) => {
        return (
            <span className="relative inline-flex size-5 shrink-0">
                {/* Native input — hidden visually but accessible */}
                <input
                    ref={ref}
                    id={id}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onCheckedChange?.(e.target.checked)}
                    className="peer absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    aria-checked={checked}
                    {...props}
                />
                {/* Custom visual box */}
                <span
                    className={cn(
                        'pointer-events-none flex size-5 shrink-0 items-center justify-center rounded-sm border border-border',
                        'transition-colors duration-150',
                        'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                        'peer-disabled:opacity-50',
                        checked
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-card text-transparent',
                        className,
                    )}
                    aria-hidden="true"
                >
                    <Check className="size-3.5 stroke-[3]" />
                </span>
            </span>
        );
    },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
