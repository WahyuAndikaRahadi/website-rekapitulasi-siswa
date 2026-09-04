import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}) {
    return (
        <div className="bg-[#F8FAFC] flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Link href={route('home')} className="flex flex-col items-center gap-2 self-center font-medium group">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-2 shadow-md border border-slate-200 transition-transform group-hover:scale-105">
                        <AppLogoIcon className="size-11" />
                    </div>
                    <div className="text-center">
                        <span className="text-base font-bold tracking-tight text-[#0B2559] block">
                            SMK NEGERI 69 JAKARTA
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Sistem Rekapitulasi Siswa
                        </span>
                    </div>
                </Link>

                <div className="flex flex-col gap-6">
                    <Card className="rounded-2xl border border-slate-200/80 shadow-xl shadow-blue-950/5 overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-[#0B2559] via-[#1E5FA8] to-sky-400" />
                        <CardHeader className="px-8 pt-6 pb-0 text-center space-y-1">
                            <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
                            {description && <CardDescription className="text-sm text-slate-500">{description}</CardDescription>}
                        </CardHeader>
                        <CardContent className="px-8 py-6">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
