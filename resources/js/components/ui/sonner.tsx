import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg text-sm font-medium',
                    description: 'group-[.toast]:text-muted-foreground font-normal text-xs',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-md',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-md',
                    success:
                        'group-[.toaster]:border-[#2E8B57]/30 group-[.toaster]:bg-[#F0FDF4] group-[.toaster]:text-[#14532D] [&_[data-icon]]:text-[#2E8B57]',
                    error:
                        'group-[.toaster]:border-[#D6293E]/30 group-[.toaster]:bg-[#FEF2F2] group-[.toaster]:text-[#7F1D1D] [&_[data-icon]]:text-[#D6293E]',
                    info:
                        'group-[.toaster]:border-[#1E5FA8]/30 group-[.toaster]:bg-[#EFF6FF] group-[.toaster]:text-[#1E3A8A] [&_[data-icon]]:text-[#1E5FA8]',
                    warning:
                        'group-[.toaster]:border-[#F5B700]/30 group-[.toaster]:bg-[#FEFCE8] group-[.toaster]:text-[#713F12] [&_[data-icon]]:text-[#CA8A04]',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
