'use client';

import * as React from 'react';

// Hapus @radix-ui/react-collapsible — implementasi manual

interface CollapsibleContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsibleCtx() {
    const ctx = React.useContext(CollapsibleContext);
    if (!ctx) throw new Error('Collapsible components must be used within <Collapsible>');
    return ctx;
}

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
    ({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }, ref) => {
        const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
        const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

        const handleChange = React.useCallback(
            (v: boolean) => {
                setInternalOpen(v);
                onOpenChange?.(v);
            },
            [onOpenChange],
        );

        return (
            <CollapsibleContext.Provider value={{ open, onOpenChange: handleChange }}>
                <div ref={ref} data-state={open ? 'open' : 'closed'} {...props}>
                    {children}
                </div>
            </CollapsibleContext.Provider>
        );
    },
);
Collapsible.displayName = 'Collapsible';

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
    ({ asChild, children, onClick, ...props }, ref) => {
        const { open, onOpenChange } = useCollapsibleCtx();

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e);
            onOpenChange(!open);
        };

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                    (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.onClick?.(e);
                    onOpenChange(!open);
                },
                'data-state': open ? 'open' : 'closed',
            } as React.HTMLAttributes<HTMLElement>);
        }

        return (
            <button ref={ref} onClick={handleClick} data-state={open ? 'open' : 'closed'} {...props}>
                {children}
            </button>
        );
    },
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, style, ...props }, ref) => {
        const { open } = useCollapsibleCtx();

        return (
            <div
                ref={ref}
                data-state={open ? 'open' : 'closed'}
                hidden={!open}
                style={{ display: open ? undefined : 'none', ...style }}
                {...props}
            >
                {children}
            </div>
        );
    },
);
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
