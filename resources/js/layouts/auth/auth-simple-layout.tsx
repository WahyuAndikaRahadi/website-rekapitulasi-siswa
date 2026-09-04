import { Link } from '@inertiajs/react';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col lg:grid lg:grid-cols-12">
            {/* Left Hero Brand Panel (Desktop) */}
            <div className="relative hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#071739] via-[#0B2559] to-[#1E5FA8] p-10 text-white">
                {/* Ambient Glow & Decorative Grid */}
                <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '24px 24px'
                    }}
                />

                {/* Top Brand */}
                <div className="relative z-10">
                    <Link href={route('home')} className="inline-flex items-center gap-3.5 group">
                        <img src="/logo.png" alt="SMK Negeri 69 Jakarta" className="size-12 object-contain drop-shadow mt-1" />
                        <div>
                            <span className="text-xl font-extrabold tracking-wider block text-white drop-shadow-sm">
                                SMKN 69 JAKARTA
                            </span>
                            <span className="text-xs font-medium text-blue-200/90 tracking-wide uppercase">
                                <span>BERBUDAYA • BERKARAKTER • BERKARYA</span>
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Center Value Props */}
                <div className="relative z-10 my-auto py-8 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl xl:text-3xl font-bold leading-tight text-white tracking-tight">
                            Platform Pembinaan & Monitoring Karakter Siswa
                        </h2>
                        <p className="text-sm text-blue-100/85 leading-relaxed">
                            Mewujudkan lingkungan sekolah yang disiplin, apresiatif, dan transparan melalui pencatatan rekapitulasi poin terpadu.
                        </p>
                    </div>

                    <div className="space-y-3.5 pt-2">
                        <div className="flex items-start gap-3 rounded-xl bg-white/[0.07] p-3.5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.1]">
                            <div className="rounded-lg bg-blue-500/30 p-2 text-sky-200 mt-0.5">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Pencatatan Poin Akurat</h4>
                                <p className="text-xs text-blue-100/75 mt-0.5 leading-relaxed">
                                    Rekapitulasi riwayat pelanggaran dan apresiasi kebaikan secara objektif.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-white/[0.07] p-3.5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.1]">
                            <div className="rounded-lg bg-emerald-500/30 p-2 text-emerald-200 mt-0.5">
                                <Award className="size-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Apresiasi Kebaikan & Prestasi</h4>
                                <p className="text-xs text-blue-100/75 mt-0.5 leading-relaxed">
                                    Mendorong budaya positif dengan penghargaan poin kebaikan siswa.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl bg-white/[0.07] p-3.5 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/[0.1]">
                            <div className="rounded-lg bg-amber-500/30 p-2 text-amber-200 mt-0.5">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-white">Kolaborasi Guru & Wali Kelas</h4>
                                <p className="text-xs text-blue-100/75 mt-0.5 leading-relaxed">
                                    Akses terintegrasi untuk pendidik dalam membina perkembangan siswa.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200/75">
                    <span>© {new Date().getFullYear()} SMK Negeri 69 Jakarta</span>
                    <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-400" />
                        Sistem Aktif
                    </span>
                </div>
            </div>

            {/* Right Form Content Area */}
            <div className="flex-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center px-4 py-8 sm:px-6 md:px-10 lg:px-16 min-h-screen">
                <div className="w-full max-w-md space-y-6">
                    {/* Mobile Header (Shown only on small screens) */}
                    <div className="lg:hidden flex flex-col items-center text-center space-y-3 mb-2">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 group">
                            <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md border border-blue-100 transition-transform group-hover:scale-105">
                                <img src="/logo.png" alt="SMKN 69" className="size-12 object-contain" />
                            </div>
                            <div>
                                <span className="text-lg font-bold tracking-tight text-[#0B2559] block">
                                    SMK NEGERI 69 JAKARTA
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Sistem Rekapitulasi Siswa
                                </span>
                            </div>
                        </Link>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#1E5FA8] border border-blue-200/60">
                            <Sparkles className="size-3 text-amber-500" />
                            <span>BERBUDAYA • BERKARAKTER • BERKARYA</span>
                        </div>
                    </div>

                    {/* Card Wrapper */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-blue-950/5 p-6 sm:p-8 relative overflow-hidden">
                        {/* Decorative Top Accent Line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B2559] via-[#1E5FA8] to-sky-400" />

                        {/* Title Header */}
                        <div className="mb-6 text-left space-y-1.5">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Form Content */}
                        <div>
                            {children}
                        </div>
                    </div>

                    {/* School Identity Footer (Mobile/Desktop) */}
                    <div className="text-center space-y-1">
                        <p className="text-xs text-slate-400">
                            Pusat Layanan Disiplin & Tata Tertib Siswa • SMKN 69 Jakarta
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
