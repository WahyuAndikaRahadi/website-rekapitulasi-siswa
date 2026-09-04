import { ChevronDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// Hapus @radix-ui/react-navigation-menu dan class-variance-authority
// Implementasi minimal untuk kompatibilitas app-header.tsx

function navigationMenuTriggerStyle() {
    return cn(
        'group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium',
        'transition-colors hover:bg-muted hover:text-foreground',
        'focus:bg-muted focus:text-foreground focus:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
    );
}

const NavigationMenu = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    ({ className, children, ...props }, ref) => (
        <nav ref={ref} className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)} {...props}>
            {children}
        </nav>
    ),
);
NavigationMenu.displayName = 'NavigationMenu';

const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
    ({ className, ...props }, ref) => (
        <ul ref={ref} className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)} {...props} />
    ),
);
NavigationMenuList.displayName = 'NavigationMenuList';

const NavigationMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
    ({ className, ...props }, ref) => (
        <li ref={ref} className={cn('relative', className)} {...props} />
    ),
);
NavigationMenuItem.displayName = 'NavigationMenuItem';

interface NavigationMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
    ({ className, children, ...props }, ref) => (
        <button ref={ref} className={cn(navigationMenuTriggerStyle(), 'group', className)} {...props}>
            {children}
            <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden />
        </button>
    ),
);
NavigationMenuTrigger.displayName = 'NavigationMenuTrigger';

const NavigationMenuContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('left-0 top-0 w-full md:absolute md:w-auto', className)} {...props} />
    ),
);
NavigationMenuContent.displayName = 'NavigationMenuContent';

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    ({ className, ...props }, ref) => <a ref={ref} className={className} {...props} />,
);
NavigationMenuLink.displayName = 'NavigationMenuLink';

const NavigationMenuViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div className="absolute left-0 top-full flex justify-center">
            <div
                ref={ref}
                className={cn(
                    'origin-top-center relative mt-1.5 overflow-hidden rounded-md border bg-card text-foreground shadow-lg',
                    className,
                )}
                {...props}
            />
        </div>
    ),
);
NavigationMenuViewport.displayName = 'NavigationMenuViewport';

const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('top-full z-10 flex h-1.5 items-end justify-center overflow-hidden', className)} {...props}>
            <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
        </div>
    ),
);
NavigationMenuIndicator.displayName = 'NavigationMenuIndicator';

export {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
    NavigationMenuViewport,
};
