import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    name: string;
    imageUrl?: string | null;
    src?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = ['#0B2559', '#1E5FA8', '#2E8B57', '#F5821F', '#7C3AED', '#0284C7', '#4F46E5'];

export function getColorForName(name: string): string {
    if (!name) return AVATAR_COLORS[0];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl font-bold',
};

export function Avatar({
    name,
    imageUrl,
    src,
    size = 'md',
    className,
    style,
    ...props
}: AvatarProps) {
    const activeUrl = imageUrl || src;
    const [hasError, setHasError] = React.useState(false);

    // Reset error when URL changes
    React.useEffect(() => {
        setHasError(false);
    }, [activeUrl]);

    const initials = getInitials(name);
    const bgColor = getColorForName(name);

    return (
        <div
            className={cn(
                'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white shadow-xs',
                sizeClasses[size],
                className,
            )}
            style={{ backgroundColor: bgColor, ...style }}
            {...props}
        >
            {activeUrl && !hasError ? (
                <img
                    src={activeUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className="leading-none tracking-wider">{initials}</span>
            )}
        </div>
    );
}
