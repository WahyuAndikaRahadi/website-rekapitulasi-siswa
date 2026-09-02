import { Link } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Link href={route('home')} className="flex flex-col items-center gap-2">
                            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl shadow-md">
                                <GraduationCap className="size-6" />
                            </div>
                            <div className="text-center">
                                <span className="text-primary text-base font-bold tracking-tight">SMK NEGERI 69 JAKARTA</span>
                                <p className="text-muted-foreground text-xs">Sistem Rekap Pelanggaran & Kebaikan Siswa</p>
                            </div>
                        </Link>

                        <div className="mt-2 space-y-1">
                            <h1 className="text-foreground text-lg font-semibold">{title}</h1>
                            {description && <p className="text-muted-foreground text-xs">{description}</p>}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
