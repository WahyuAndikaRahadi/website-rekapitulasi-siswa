import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar as CustomAvatar, AvatarProps as CustomAvatarProps, getInitials, getColorForName } from '@/components/avatar';

interface LegacyAvatarProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Avatar = React.forwardRef<HTMLSpanElement, LegacyAvatarProps>(({ className, children, ...props }, ref) => (
    <span
        ref={ref}
        className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
    >
        {children}
    </span>
));
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(({ className, alt = '', src, ...props }, ref) => {
    const [error, setError] = React.useState(!src);

    React.useEffect(() => {
        setError(!src);
    }, [src]);

    if (error || !src) return null;

    return (
        <img
            ref={ref}
            src={src}
            alt={alt}
            onError={() => setError(true)}
            className={cn('aspect-square h-full w-full object-cover', className)}
            {...props}
        />
    );
});
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={cn(
            'flex h-full w-full items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold',
            className,
        )}
        {...props}
    />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarFallback, AvatarImage, CustomAvatar, getInitials, getColorForName };
