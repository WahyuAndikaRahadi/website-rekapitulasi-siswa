import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { TambahCatatanModal, type TargetMurid } from '@/components/tambah-catatan-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronRight, GraduationCap, PlusCircle } from 'lucide-react';
import { useState } from 'react';

interface LaporanRingkas {
    id: number;
    tanggal_kejadian: string;
    kategori: string;
    tingkat_keparahan: string;
    keterangan: string;
    poin_diberikan: number;
    status: string;
}

interface MuridRekap {
    id: number;
    nama: string;
    nis: string | null;
    nisn: string | null;
    nama_kelas: string;
    kelas_id: number;
    skor_resmi: number;
    skor_sementara: number;
    jumlah_laporan: number;
    laporans: LaporanRingkas[];
}

interface Props {
    kelas: { id: number; nama_kelas: string; tingkat: string };
    murids: MuridRekap[];
    filters: { status?: string; dari?: string; sampai?: string };
    poin_ranges: Record<string, Record<string, { min: number; max: number }>>;
    flash?: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Rekap Kelas', href: '/guru/kelas/rekap' },
];

export default function RekapKelas({ kelas, murids, filters, poin_ranges, flash }: Props) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [status, setStatus]     = useState(filters.status ?? 'semua');
    const [dari, setDari]         = useState(filters.dari ?? '');
    const [sampai, setSampai]     = useState(filters.sampai ?? '');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetMurid, setTargetMurid] = useState<TargetMurid | null>(null);

    const toggle = (id: number) =>
        setExpanded((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    const applyFilter = () =>
        router.get('/guru/kelas/rekap', { status, dari, sampai }, { preserveState: true, replace: true });

    const resetFilter = () => {
        setStatus('semua'); setDari(''); setSampai('');
        router.get('/guru/kelas/rekap', {}, { replace: true });
    };

    const openCatatModal = (e: React.MouseEvent, m: MuridRekap) => {
        e.stopPropagation(); // cegah accordion toggle
        setTargetMurid({
            id: m.id,
            nama: m.nama,
            nis: m.nis,
            nisn: m.nisn,
            nama_kelas: m.nama_kelas,
        });
        setIsModalOpen(true);
    };

    // Sort: skor_resmi ascending (murid bermasalah di atas)
    const sorted = [...murids].sort((a, b) => a.skor_resmi - b.skor_resmi);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rekap ${kelas.nama_kelas}`} />
            <div className="space-y-5 p-6">
                <div>
                    <h1 className="text-xl font-semibold">Rekap Kelas {kelas.nama_kelas}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{murids.length} murid terdaftar</p>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Filter */}
                <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Status Laporan</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option value="semua">Semua</option>
                            <option value="pending">Pending</option>
                            <option value="ditindaklanjuti">Ditindaklanjuti</option>
                            <option value="ditolak">Ditolak</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Dari</label>
                        <input type="date" value={dari} onChange={(e) => setDari(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Sampai</label>
                        <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <button onClick={applyFilter} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Terapkan</button>
                    <button onClick={resetFilter} className="h-9 rounded-md border px-3 text-sm hover:bg-muted">Reset</button>
                </div>

                {/* Tabel murid */}
                {murids.length === 0 ? (
                    <div className="rounded-lg border bg-white">
                        <EmptyState icon={GraduationCap} title="Tidak ada murid di kelas ini" />
                    </div>
                ) : (
                    <div className="rounded-lg border bg-white overflow-hidden shadow-xs">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground w-8"></th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Murid</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Skor Resmi</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground text-center">Skor Sementara</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Laporan</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sorted.map((m) => (
                                    <React.Fragment key={m.id}>
                                        <tr
                                            className="cursor-pointer hover:bg-muted/20 transition-colors"
                                            onClick={() => toggle(m.id)}
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {expanded.has(m.id)
                                                    ? <ChevronDown className="size-4" />
                                                    : <ChevronRight className="size-4" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">{m.nama}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    NIS: {m.nis ?? '-'} {m.nisn ? `· NISN: ${m.nisn}` : ''}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full text-xs font-mono ${
                                                    m.skor_resmi < 0
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                        : m.skor_resmi > 0
                                                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                          : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {m.skor_resmi > 0 ? `+${m.skor_resmi}` : m.skor_resmi}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center justify-center font-medium px-2 py-0.5 rounded-full text-xs font-mono ${
                                                    m.skor_sementara < 0
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : m.skor_sementara > 0
                                                          ? 'text-green-600 dark:text-green-400'
                                                          : 'text-muted-foreground'
                                                }`}>
                                                    {m.skor_sementara > 0 ? `+${m.skor_sementara}` : m.skor_sementara}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{m.jumlah_laporan} laporan</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(e) => openCatatModal(e, m)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-95"
                                                >
                                                    <PlusCircle className="size-3.5" />
                                                    Tambah Catatan
                                                </button>
                                            </td>
                                        </tr>
                                        {expanded.has(m.id) && (
                                            <tr key={`${m.id}-detail`}>
                                                <td colSpan={6} className="bg-muted/20 px-4 pb-3 pt-0">
                                                    {m.laporans.length === 0 ? (
                                                        <p className="py-3 text-center text-xs text-muted-foreground">
                                                            Tidak ada laporan sesuai filter.
                                                        </p>
                                                    ) : (
                                                        <table className="w-full text-xs mt-2">
                                                            <thead>
                                                                <tr className="text-left text-muted-foreground border-b border-muted">
                                                                    <th className="py-1.5 pr-4 font-medium">Tanggal</th>
                                                                    <th className="py-1.5 pr-4 font-medium">Kategori & Tingkat</th>
                                                                    <th className="py-1.5 pr-4 font-medium">Keterangan Tindakan</th>
                                                                    <th className="py-1.5 pr-4 font-medium">Poin</th>
                                                                    <th className="py-1.5 font-medium">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-muted">
                                                                {m.laporans.map((l) => (
                                                                    <tr key={l.id}>
                                                                        <td className="py-2 pr-4 text-muted-foreground font-mono">{l.tanggal_kejadian}</td>
                                                                        <td className="py-2 pr-4">
                                                                            <span className="mr-1.5"><StatusBadge status={l.kategori} /></span>
                                                                            <span className="text-[11px] capitalize text-muted-foreground font-medium">
                                                                                ({l.tingkat_keparahan ?? 'ringan'})
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 pr-4 font-medium text-foreground">
                                                                            {l.keterangan}
                                                                        </td>
                                                                        <td className={`py-2 pr-4 font-bold font-mono ${l.poin_diberikan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {l.poin_diberikan > 0 ? `+${l.poin_diberikan}` : l.poin_diberikan}
                                                                        </td>
                                                                        <td className="py-2"><StatusBadge status={l.status} /></td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
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
