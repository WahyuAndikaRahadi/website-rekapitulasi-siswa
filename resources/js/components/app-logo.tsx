import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-white/10 p-1 shadow-sm border border-white/20">
                <AppLogoIcon className="size-7" />
            </div>
            <div className="grid flex-1 text-left">
                <span className="truncate text-sm font-bold leading-tight tracking-wide text-foreground">
                    E Point 69
                </span>
                <span className="text-[11px] font-medium text-muted-foreground leading-tight">
                    SMKN 69 JAKARTA
                </span>
            </div>
        </div>
    );
}

