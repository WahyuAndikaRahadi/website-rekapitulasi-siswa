import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { TambahCatatanModal, type TargetMurid } from '@/components/tambah-catatan-modal';
import AppLayout from '@/layouts/app-layout';
import { getViolationPointBadgeInfo } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronRight, Filter, GraduationCap, PlusCircle, RotateCcw, ShieldCheck, Sparkles, Users } from 'lucide-react';
import React, { useState } from 'react';

interface LaporanRingkas {
    id: number;
    tanggal_kejadian: string;
    kategori: string;
    tingkat_keparahan: string;
    keterangan: string;
    poin_diberikan: number | null;
    status: string;
}

interface MuridRekap {
    id: number;
    nama: string;
    nis: string | null;
    nisn: string | null;
    no_telp?: string | null;
    nama_kelas: string;
    kelas_id: number;
    poin_prestasi: number;
    poin_pelanggaran: number;
    kualifikasi?: string;
    tahap_pembinaan?: string;
    skor_resmi?: number;
    skor_sementara?: number;
    jumlah_laporan: number;
    laporans: LaporanRingkas[];
}

interface Props {
    kelas?: { id: number; nama_kelas: string; tingkat: string };
    murids?: MuridRekap[];
    filters?: { status?: string; dari?: string; sampai?: string };
    poin_ranges?: Record<string, Record<string, { min: number; max: number }>>;
    flash?: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Rekap Kelas', href: '/guru/kelas/rekap' },
];

export default function RekapKelas({
    kelas = { id: 0, nama_kelas: '-', tingkat: '-' },
    murids = [],
    filters = {},
    poin_ranges = {},
    flash,
}: Props) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [status, setStatus]     = useState(filters?.status ?? 'semua');
    const [dari, setDari]         = useState(filters?.dari ?? '');
    const [sampai, setSampai]     = useState(filters?.sampai ?? '');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetMurid, setTargetMurid] = useState<TargetMurid | null>(null);

    const toggle = (id: number) =>
        setExpanded((prev) => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });

    const applyFilter = () =>
        router.get('/guru/kelas/rekap', { status, dari, sampai }, { preserveState: true, replace: true });

    const resetFilter = () => {
        setStatus('semua');
        setDari('');
        setSampai('');
        router.get('/guru/kelas/rekap', {}, { replace: true });
    };

    const openCatatModal = (e: React.MouseEvent, m: MuridRekap) => {
        e.stopPropagation(); // cegah accordion toggle
        setTargetMurid({
            id: m.id,
            nama: m.nama,
            nis: m.nis,
            nisn: m.nisn,
            nama_kelas: m.nama_kelas || kelas.nama_kelas,
        });
        setIsModalOpen(true);
    };

    // Sort: poin_pelanggaran descending (murid dengan pelanggaran tertinggi di atas)
    const sorted = [...(murids || [])].sort((a, b) => (b.poin_pelanggaran ?? 0) - (a.poin_pelanggaran ?? 0));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rekap Kelas ${kelas.nama_kelas}`} />

            <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071739] via-[#0B2559] to-[#1E5FA8] p-6 text-white shadow-md">
                    <div className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-blue-400/20 blur-2xl" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 border border-white/15">
                                <GraduationCap className="size-3.5 text-amber-300" />
                                <span>Wali Kelas Dashboard</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                Rekapitulasi Kelas {kelas.nama_kelas}
                            </h1>
                            <p className="text-xs md:text-sm text-blue-100/80">
                                Total {murids.length} murid terdaftar dalam binaan kelas Anda.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-white/10 p-3 text-center border border-white/15 backdrop-blur-xs min-w-24">
                                <span className="block text-xl font-extrabold text-white">{murids.length}</span>
                                <span className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">Murid</span>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 text-center border border-white/15 backdrop-blur-xs min-w-28">
                                <span className="block text-xl font-extrabold text-emerald-300">
                                    {murids.reduce((acc, m) => acc + (m.jumlah_laporan ?? 0), 0)}
                                </span>
                                <span className="text-[10px] text-blue-200 uppercase tracking-wider font-medium">Total Catatan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-xs">
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Filter Controls */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 shadow-xs">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-[#0B2559]">
                        <Filter className="size-3.5 text-[#1E5FA8]" />
                        <span>Filter & Pencarian Laporan</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-4 space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Status Laporan</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8] transition-colors"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="baru dilaporkan">Baru Dilaporkan</option>
                                <option value="menunggu verifikasi">Menunggu Verifikasi</option>
                                <option value="pembinaan tindak lanjut">Pembinaan / Tindak Lanjut</option>
                                <option value="selesai">Selesai</option>
                            </select>
                        </div>

                        <div className="lg:col-span-3 space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dari}
                                onChange={(e) => setDari(e.target.value)}
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8] transition-colors"
                            />
                        </div>

                        <div className="lg:col-span-3 space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={sampai}
                                onChange={(e) => setSampai(e.target.value)}
                                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8] transition-colors"
                            />
                        </div>

                        <div className="lg:col-span-2 flex items-end gap-2">
                            <button
                                type="button"
                                onClick={applyFilter}
                                className="h-10 flex-1 rounded-lg bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                                Terapkan
                            </button>
                            <button
                                type="button"
                                onClick={resetFilter}
                                title="Reset Filter"
                                className="h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs transition-colors cursor-pointer flex items-center justify-center"
                            >
                                <RotateCcw className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabel Murid & Rekap */}
                {murids.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <EmptyState icon={GraduationCap} title="Tidak ada murid di kelas ini" />
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                                        <th className="px-4 py-3.5 font-semibold text-slate-700 w-10"></th>
                                        <th className="px-4 py-3.5 font-semibold text-slate-700">Nama Murid</th>
                                        <th className="px-4 py-3.5 font-semibold text-slate-700">No. Telepon</th>
                                        <th className="px-4 py-3.5 font-semibold text-slate-700 text-center">Poin Prestasi</th>
                                        <th className="px-4 py-3.5 font-semibold text-slate-700 text-center">Poin Pelanggaran</th>
                                        <th className="px-4 py-3.5 font-semibold text-slate-700 text-center">Catatan</th>
                                        <th className="px-4 py-3.5 font-semibold text-slate-700 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sorted.map((m) => {
                                        const isExp = expanded.has(m.id);
                                        const laporans = m.laporans || [];
                                        const badgeInfo = getViolationPointBadgeInfo(m.poin_pelanggaran ?? 0);
                                        return (
                                            <React.Fragment key={m.id}>
                                                <tr
                                                    style={badgeInfo.hasViolation ? badgeInfo.rowStyle : undefined}
                                                    className={`cursor-pointer transition-colors ${
                                                        badgeInfo.hasViolation
                                                            ? badgeInfo.rowClassName
                                                            : isExp
                                                            ? 'bg-blue-50/40'
                                                            : 'hover:bg-slate-50/70'
                                                    }`}
                                                    onClick={() => toggle(m.id)}
                                                >
                                                    <td className="px-4 py-3.5 text-slate-400">
                                                        {isExp ? (
                                                            <ChevronDown className="size-4 text-[#1E5FA8]" />
                                                        ) : (
                                                            <ChevronRight className="size-4" />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <p className="font-semibold text-slate-900">{m.nama}</p>
                                                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                                                            NIS: {m.nis ?? '-'} {m.nisn ? `· NISN: ${m.nisn}` : ''}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-slate-700">
                                                        {m.no_telp ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs font-mono shadow-2xs bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            +{m.poin_prestasi ?? 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span
                                                            style={badgeInfo.style}
                                                            className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs font-mono shadow-2xs border ${badgeInfo.classNames}`}
                                                        >
                                                            {m.poin_pelanggaran ?? 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                                            {m.jumlah_laporan ?? 0} catatan
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => openCatatModal(e, m)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
                                                        >
                                                            <PlusCircle className="size-3.5" />
                                                            Tambah Catatan
                                                        </button>
                                                    </td>
                                                </tr>

                                                {/* Accordion Detail Laporan */}
                                                {isExp && (
                                                    <tr key={`${m.id}-detail`}>
                                                        <td colSpan={7} className="bg-slate-50/60 px-6 py-4 border-t border-b border-slate-200/70">
                                                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                                                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                                                                    <span className="text-xs font-bold text-[#0B2559] uppercase tracking-wider">
                                                                        Riwayat Catatan: {m.nama}
                                                                    </span>
                                                                    <span className="text-xs text-slate-500">
                                                                        {laporans.length} data ditampilkan
                                                                    </span>
                                                                </div>

                                                                {laporans.length === 0 ? (
                                                                    <p className="py-4 text-center text-xs text-slate-400 italic">
                                                                        Belum ada catatan laporan yang sesuai dengan filter yang dipilih.
                                                                    </p>
                                                                ) : (
                                                                    <div className="overflow-x-auto">
                                                                        <table className="w-full text-xs">
                                                                            <thead>
                                                                                <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50/50">
                                                                                    <th className="py-2 px-3 font-semibold">Tanggal</th>
                                                                                    <th className="py-2 px-3 font-semibold">Kategori & Tingkat</th>
                                                                                    <th className="py-2 px-3 font-semibold">Keterangan Tindakan</th>
                                                                                    <th className="py-2 px-3 font-semibold text-center">Poin</th>
                                                                                    <th className="py-2 px-3 font-semibold text-right">Status</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {laporans.map((l) => (
                                                                                    <tr key={l.id} className="hover:bg-slate-50/50">
                                                                                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                                                                                            {l.tanggal_kejadian}
                                                                                        </td>
                                                                                        <td className="py-2.5 px-3">
                                                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                                                <StatusBadge status={l.kategori} />
                                                                                                <span className="text-[11px] capitalize text-slate-500 font-medium">
                                                                                                    ({l.tingkat_keparahan ?? 'ringan'})
                                                                                                </span>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="py-2.5 px-3 font-medium text-slate-900 max-w-md">
                                                                                            {l.keterangan}
                                                                                        </td>
                                                                                        <td className="py-2.5 px-3 text-center">
                                                                                            {l.poin_diberikan !== null && l.poin_diberikan !== undefined ? (
                                                                                                <span
                                                                                                    className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                                                                                                        l.poin_diberikan > 0
                                                                                                            ? 'bg-emerald-50 text-emerald-700'
                                                                                                            : l.poin_diberikan < 0
                                                                                                              ? 'bg-rose-50 text-rose-700'
                                                                                                              : 'bg-slate-100 text-slate-600'
                                                                                                    }`}
                                                                                                >
                                                                                                    {l.poin_diberikan > 0 ? `+${l.poin_diberikan}` : l.poin_diberikan}
                                                                                                </span>
                                                                                            ) : (
                                                                                                <span className="text-slate-400 italic text-[11px]">
                                                                                                    Menunggu review
                                                                                                </span>
                                                                                            )}
                                                                                        </td>
                                                                                        <td className="py-2.5 px-3 text-right">
                                                                                            <StatusBadge status={l.status} />
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Reusable Tambah Catatan Modal */}
            <TambahCatatanModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                murid={targetMurid}
                poinRanges={poin_ranges}
            />
        </AppLayout>
    );
}
