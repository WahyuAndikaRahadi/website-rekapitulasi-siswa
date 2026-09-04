import { TopKelasItem, TopKelasLeaderboard, TopMuridItem, TopMuridLeaderboard } from '@/components/leaderboard-tables';
import { StatusBadge } from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    FilePlus,
    GraduationCap,
    Inbox,
    Pencil,
    Trophy,
} from 'lucide-react';
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
];

interface LaporanItem {
    id: number;
    tanggal_kejadian: string;
    murid_nama: string;
    kelas_nama: string;
    kategori: 'pelanggaran' | 'kebaikan';
    tingkat_keparahan?: string;
    keterangan: string;
    poin_diberikan: number;
    status: 'pending' | 'ditindaklanjuti' | 'ditolak';
    bisa_diedit: boolean;
}

interface Props {
    stats: {
        total_laporan: number;
        pending: number;
        ditindaklanjuti: number;
    };
    laporan_terbaru: LaporanItem[];
    top_murids: TopMuridItem[];
    top_kelas: TopKelasItem[];
    tahun_ajaran: { label: string } | null;
}

export default function GuruDashboard({
    stats,
    laporan_terbaru = [],
    top_murids = [],
    top_kelas = [],
    tahun_ajaran,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const guru = auth.guru;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Guru - SMKN 69 Jakarta" />

            <div className="space-y-6 p-6 md:p-6">
                {/* Greeting */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Selamat Datang, {guru?.nama ?? auth.user?.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {guru?.is_wali_kelas
                                ? `Wali Kelas ${guru.wali_kelas?.nama_kelas}`
                                : 'Guru Mata Pelajaran / Tenaga Pendidik'}
                        </p>
                    </div>
                    {tahun_ajaran && (
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/60 bg-blue-50/70 px-3.5 py-1.5 text-xs font-semibold text-[#0B2559] shadow-2xs">
                            <Calendar className="size-3.5 text-[#1E5FA8]" />
                            <span>Tahun Ajaran {tahun_ajaran.label}</span>
                        </div>
                    )}
                </div>

                {/* Quick actions & stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        href="/guru/laporan/buat"
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-[#1E5FA8]/50 hover:shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[#1E5FA8]/15 p-3 text-[#1E5FA8]">
                                <FilePlus className="size-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">Buat Laporan Baru</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Catat peristiwa pelanggaran tata tertib atau apresiasi kebaikan siswa
                                </p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/guru/laporan/riwayat"
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-[#1E5FA8]/50 hover:shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-[#F5B700]/15 p-3 text-[#D97706]">
                                <Clock className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-foreground">Riwayat Laporan</p>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                        {stats?.total_laporan ?? 0}
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    <span className="font-medium text-[#D97706]">{stats?.pending ?? 0} pending</span>, {stats?.ditindaklanjuti ?? 0} selesai
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Rekap kelas hanya muncul kalau wali kelas */}
                    {guru?.is_wali_kelas && (
                        <Link
                            href="/guru/kelas/rekap"
                            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-[#1E5FA8]/50 hover:shadow-sm"
                        >
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-[#2E8B57]/15 p-3 text-[#2E8B57]">
                                    <GraduationCap className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">Rekap Kelas</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Pantau akumulasi skor seluruh siswa kelas {guru.wali_kelas?.nama_kelas}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                {/* ── LEADERBOARD SECTION (TOP 10 STUDENTS & TOP 10 CLASSES) ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <TopMuridLeaderboard topMurids={top_murids} />
                    <TopKelasLeaderboard topKelas={top_kelas} />
                </div>

                {/* Laporan terbaru */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Laporan Terbaru Anda</h2>
                            <p className="text-xs text-muted-foreground">Daftar laporan kedisiplinan yang baru saja Anda kirimkan</p>
                        </div>
                        {laporan_terbaru?.length > 0 && (
                            <Link
                                href="/guru/laporan/riwayat"
                                className="text-xs font-semibold text-[#1E5FA8] hover:underline"
                            >
                                Lihat Semua Riwayat →
                            </Link>
                        )}
                    </div>

                    {!laporan_terbaru || laporan_terbaru.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/50 py-12 text-center">
                            <div className="mb-3 rounded-full bg-slate-100 p-3 text-muted-foreground">
                                <Inbox className="size-6" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Belum ada laporan yang Anda buat</p>
                            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                Klik tombol &quot;Buat Laporan Baru&quot; untuk mencatat pelanggaran atau kebaikan murid.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400">
                                        <th className="pb-3 px-2 font-semibold">Tanggal</th>
                                        <th className="pb-3 px-2 font-semibold">Siswa</th>
                                        <th className="pb-3 px-2 font-semibold">Kelas</th>
                                        <th className="pb-3 px-2 font-semibold">Peristiwa / Keterangan</th>
                                        <th className="pb-3 px-2 font-semibold text-center">Poin</th>
                                        <th className="pb-3 px-2 font-semibold">Status</th>
                                        <th className="pb-3 px-2 text-right font-semibold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {laporan_terbaru.map((l) => (
                                        <tr key={l.id} className="hover:bg-slate-50/50">
                                            <td className="py-3 px-2 text-slate-500 font-mono whitespace-nowrap">
                                                {l.tanggal_kejadian}
                                            </td>
                                            <td className="py-3 px-2 font-semibold text-slate-900">
                                                {l.murid_nama}
                                            </td>
                                            <td className="py-3 px-2 text-slate-500 font-medium">
                                                {l.kelas_nama}
                                            </td>
                                            <td className="py-3 px-2 text-slate-700 max-w-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={`inline-block size-2 rounded-full shrink-0 ${
                                                            l.kategori === 'pelanggaran'
                                                                ? 'bg-[#D6293E]'
                                                                : 'bg-[#2E8B57]'
                                                        }`}
                                                    />
                                                    <span className="truncate">{l.keterangan}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-center font-mono font-bold">
                                                {l.poin_diberikan !== null && l.poin_diberikan !== undefined ? (
                                                    <span
                                                        className={
                                                            l.poin_diberikan < 0
                                                                ? 'text-[#D6293E]'
                                                                : l.poin_diberikan > 0
                                                                ? 'text-[#2E8B57]'
                                                                : 'text-slate-500'
                                                        }
                                                    >
                                                        {l.poin_diberikan > 0 ? `+${l.poin_diberikan}` : l.poin_diberikan}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-normal italic text-[11px]">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2">
                                                <StatusBadge status={l.status} />
                                            </td>
                                            <td className="py-3 px-2 text-right">
                                                {l.bisa_diedit && (
                                                    <Link
                                                        href={`/guru/laporan/${l.id}/edit`}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                                        title="Edit Laporan"
                                                    >
                                                        <Pencil className="size-3" />
                                                        <span>Edit</span>
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
