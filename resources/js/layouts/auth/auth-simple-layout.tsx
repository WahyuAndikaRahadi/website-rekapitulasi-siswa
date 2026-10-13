import { Link } from '@inertiajs/react';
import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-background flex flex-col lg:grid lg:grid-cols-12">

            {/* ── Panel Kiri — Brand SMKN 69 (desktop only) ─────────────────── */}
            <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden bg-primary p-10 text-white">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary-light/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-primary-light/15 blur-3xl" />
                {/* Subtle dot grid */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Logo + nama sekolah */}
                <div className="relative z-10">
                    <Link href={route('home')} className="inline-flex items-center gap-3.5">
                        <img
                            src="/logo.png"
                            alt="SMK Negeri 69 Jakarta"
                            className="size-12 object-contain drop-shadow mt-1"
                        />
                        <div>
                            <span className="text-xl font-extrabold tracking-wider block text-white drop-shadow-sm">
                                E POINT 69
                            </span>
                            <span className="text-[11px] font-medium text-white/70 tracking-widest uppercase">
                                SMKN 69 JAKARTA · Berbudaya · Berkarakter · Berkarya
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Kalimat inti sistem */}
                <div className="relative z-10 space-y-4">
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest uppercase text-white/50 mb-3">
                            E Point 69 - SMKN 69 Jakarta
                        </p>
                        <h2 className="text-3xl font-bold leading-snug text-white tracking-tight">
                            Pencatatan poin<br />
                            kedisiplinan siswa<br />
                            yang akurat & terukur.
                        </h2>
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed max-w-xs">
                        Rekap pelanggaran dan apresiasi kebaikan secara terpadu —
                        mendukung pembinaan karakter dan transparansi tata tertib sekolah.
                    </p>

                    {/* Divider */}
                    <div className="pt-2 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/15" />
                        <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                            Dikelola oleh Bagian Tata Tertib
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 border-t border-white/10 pt-4 text-xs text-white/40">
                    © {new Date().getFullYear()} SMK Negeri 69 Jakarta
                </div>
            </div>

            {/* ── Panel Kanan — Form ────────────────────────────────────────── */}
            <div className="flex-1 lg:col-span-7 flex flex-col justify-center items-center px-4 py-10 sm:px-6 md:px-12 lg:px-16 min-h-screen">
                <div className="w-full max-w-md space-y-6">

                    {/* Mobile header — hanya tampil di layar kecil */}
                    <div className="lg:hidden flex flex-col items-center text-center space-y-3 mb-2">
                        <Link href={route('home')} className="flex flex-col items-center gap-2.5">
                            <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md border border-border">
                                <img src="/logo.png" alt="SMKN 69" className="size-12 object-contain" />
                            </div>
                            <div>
                                <span className="text-lg font-bold tracking-tight text-primary block">
                                    E POINT 69
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    SMK NEGERI 69 JAKARTA
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Form card */}
                    <div className="bg-card rounded-2xl border border-border shadow-lg shadow-primary/5 p-7 sm:p-8 relative overflow-hidden">
                        {/* Accent bar di atas card */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-sky-400" />

                        {title && (
                            <div className="mb-6 space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                                {description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                                )}
                            </div>
                        )}

                        {children}
                    </div>

                    {/* Footer kecil */}
                    <p className="text-center text-xs text-muted-foreground">
                        Pusat Layanan Disiplin & Tata Tertib Siswa · SMKN 69 Jakarta
                    </p>
                </div>
            </div>
        </div>
    );
}
