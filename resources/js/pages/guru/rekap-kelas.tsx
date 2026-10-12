import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatIndonesianDate } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Eye, FileText, Filter, GraduationCap, RotateCcw, Users, X, ZoomIn } from 'lucide-react';
import React, { useState } from 'react';

interface BuktiItem {
    url: string;
    nama_asli: string;
}

interface LaporanRingkas {
    id: number;
    tanggal_kejadian: string;
    guru_nama?: string;
    kategori: string;
    tingkat_keparahan: string;
    keterangan: string;
    keterangan_tambahan?: string | null;
    poin_diberikan: number | null;
    status: string;
    bukti_urls?: BuktiItem[];
}

interface MuridRekap {
    id: number;
    nama: string;
    nis: string | null;
    nisn: string | null;
    no_telp?: string | null;
    no_ortu?: string | null;
    nama_kelas: string;
    kelas_id: number;
    poin_prestasi: number;
    poin_pelanggaran: number;
    poin_pelanggaran_kotor?: number;
    poin_akumulasi?: number;
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
    flash,
}: Props) {
    const [status, setStatus] = useState(filters?.status ?? 'semua');
    const [dari, setDari]     = useState(filters?.dari ?? '');
    const [sampai, setSampai] = useState(filters?.sampai ?? '');

    // Modal Catatan Siswa
    const [activeModalMurid, setActiveModalMurid] = useState<MuridRekap | null>(null);
    const [filterKategoriModal, setFilterKategoriModal] = useState<'semua' | 'prestasi' | 'pelanggaran'>('semua');
    const [lightboxImg, setLightboxImg] = useState<{ url: string; nama: string } | null>(null);

    const applyFilter = () =>
        router.get('/guru/kelas/rekap', { status, dari, sampai }, { preserveState: true, replace: true });

    const resetFilter = () => {
        setStatus('semua');
        setDari('');
        setSampai('');
        router.get('/guru/kelas/rekap', {}, { replace: true });
    };

    const handleOpenCatatanModal = (e: React.MouseEvent, m: MuridRekap) => {
        e.stopPropagation();
        setActiveModalMurid(m);
        setFilterKategoriModal('semua');
    };

    // Sort nama siswa
    const sorted = [...(murids || [])].sort((a, b) => a.nama.localeCompare(b.nama));
    const totalCatatan = murids.reduce((acc, m) => acc + (m.jumlah_laporan ?? 0), 0);

    // Modal filtered catatan
    const modalLaporans = (activeModalMurid?.laporans || []).filter((l) => {
        if (filterKategoriModal === 'semua') return true;
        if (filterKategoriModal === 'prestasi') return l.kategori === 'prestasi' || l.kategori === 'kebaikan';
        if (filterKategoriModal === 'pelanggaran') return l.kategori === 'pelanggaran';
        return true;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rekap Kelas ${kelas.nama_kelas}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-full min-w-0">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                Rekapitulasi Kelas {kelas.nama_kelas}
                            </h1>
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                                Tingkat {kelas.tingkat}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Monitoring rekapitulasi poin akumulasi serta riwayat catatan prestasi dan pelanggaran siswa
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-1.5 shadow-2xs text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Users className="size-3.5 text-primary" />
                                <span><strong className="text-foreground">{murids.length}</strong> Murid</span>
                            </div>
                            <span className="text-muted-foreground/40">|</span>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <FileText className="size-3.5 text-emerald-600" />
                                <span><strong className="text-foreground">{totalCatatan}</strong> Catatan</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Filter Controls */}
                <div className="rounded-xl border bg-card p-4 shadow-xs">
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-foreground">
                        <Filter className="size-3.5 text-muted-foreground" />
                        <span>Filter Rekapitulasi Catatan</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-4 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Status Laporan</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="semua">Semua Status</option>
                                <option value="baru dilaporkan">Baru Dilaporkan</option>
                                <option value="menunggu verifikasi">Menunggu Verifikasi</option>
                                <option value="pembinaan tindak lanjut">Pembinaan / Tindak Lanjut</option>
                                <option value="selesai">Selesai</option>
                            </select>
                        </div>

                        <div className="lg:col-span-3 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dari}
                                onChange={(e) => setDari(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="lg:col-span-3 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={sampai}
                                onChange={(e) => setSampai(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="lg:col-span-2 flex items-end gap-2">
                            <Button
                                type="button"
                                onClick={applyFilter}
                                className="h-9 flex-1 rounded-lg text-xs font-semibold px-3"
                            >
                                Terapkan
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={resetFilter}
                                title="Reset Filter"
                                className="h-9 px-2.5 rounded-lg text-xs"
                            >
                                <RotateCcw className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabel Murid & Rekap */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-xs w-full max-w-full">
                    <div className="flex items-center justify-between border-b px-5 py-3.5 bg-muted/30">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <GraduationCap className="size-4 text-primary" />
                            <span>Daftar Siswa ({murids.length} Siswa Terdaftar)</span>
                        </div>
                    </div>

                    {murids.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Tidak ada murid di kelas ini"
                            description="Belum ada data siswa yang tercatat di kelas ini."
                        />
                    ) : (
                        <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto touch-pan-x">
                            <table className="w-full min-w-[850px] text-sm whitespace-nowrap text-left">
                                <thead className="border-b bg-muted/40 text-xs">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground w-12 text-center">No.</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground">Nama Siswa</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground">No. HP Siswa</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground">No. HP Orang Tua (WA)</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Poin Akumulasi</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Catatan</th>
                                        <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sorted.map((m, idx) => {
                                        const poinPenghargaan = m.poin_prestasi ?? 0;
                                        const poinPelanggaran = m.poin_pelanggaran_kotor ?? m.poin_pelanggaran ?? 0;
                                        const akumulasi = m.poin_akumulasi ?? (poinPenghargaan - poinPelanggaran);

                                        return (
                                            <tr
                                                key={m.id}
                                                className="hover:bg-muted/20 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-foreground">{m.nama}</p>
                                                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                                        NIS: {m.nis ?? '-'} {m.nisn ? `· NISN: ${m.nisn}` : ''}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                    {m.no_telp ?? '—'}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs font-semibold">
                                                    {m.no_ortu ? (
                                                        <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                            {m.no_ortu}
                                                        </span>
                                                    ) : (
                                                        <span className="text-rose-500 font-normal italic text-[11px]">Belum diisi</span>
                                                    )}
                                                </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="inline-flex flex-col items-center gap-0.5">
                                                            <span
                                                                className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs font-mono border shadow-2xs ${
                                                                    akumulasi > 0
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : akumulasi < 0
                                                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                                                }`}
                                                                title={`Penghargaan: +${poinPenghargaan} | Pelanggaran: -${poinPelanggaran}`}
                                                            >
                                                                {akumulasi > 0 ? `+${akumulasi}` : akumulasi}
                                                            </span>
                                                            {(poinPenghargaan > 0 || poinPelanggaran > 0) && (
                                                                <span className="text-[10px] text-muted-foreground font-mono tracking-tight">
                                                                    +{poinPenghargaan} / -{poinPelanggaran}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                                                            {m.jumlah_laporan ?? 0} catatan
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={(e) => handleOpenCatatanModal(e, m)}
                                                            className="h-8 gap-1.5 rounded-lg text-xs font-medium px-3"
                                                            title="Lihat rincian catatan penghargaan dan pelanggaran"
                                                        >
                                                            <Eye className="size-3.5 text-primary" />
                                                            Lihat Catatan
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            {/* Modal Detail Catatan Murid (Penghargaan & Pengurangan Poin) */}
            {activeModalMurid && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border bg-card shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/20">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-bold text-foreground">
                                        Catatan Perkembangan Siswa: {activeModalMurid.nama}
                                    </h2>
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-muted font-mono font-medium text-foreground">
                                        {activeModalMurid.nama_kelas}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                                    NIS: {activeModalMurid.nis ?? '-'} | NISN: {activeModalMurid.nisn ?? '-'}
                                </p>
                            </div>
                            <button
                                onClick={() => setActiveModalMurid(null)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Summary Badges in Modal */}
                        <div className="px-6 py-3 border-b bg-muted/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Ringkasan Poin:</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Penghargaan: +{activeModalMurid.poin_prestasi ?? 0}
                                </span>
                                <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    Pelanggaran: -{activeModalMurid.poin_pelanggaran_kotor ?? activeModalMurid.poin_pelanggaran ?? 0}
                                </span>
                                <span className="inline-flex items-center gap-1 font-bold text-foreground bg-muted px-2 py-0.5 rounded border">
                                    Akumulasi: {activeModalMurid.poin_akumulasi ?? ((activeModalMurid.poin_prestasi ?? 0) - (activeModalMurid.poin_pelanggaran_kotor ?? activeModalMurid.poin_pelanggaran ?? 0))}
                                </span>
                            </div>

                            {/* Filter Tabs dalam modal */}
                            <div className="flex items-center rounded-lg border bg-background p-0.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFilterKategoriModal('semua')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                        filterKategoriModal === 'semua'
                                            ? 'bg-primary text-primary-foreground font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Semua ({activeModalMurid.laporans?.length ?? 0})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterKategoriModal('prestasi')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                        filterKategoriModal === 'prestasi'
                                            ? 'bg-emerald-600 text-white font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Penghargaan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterKategoriModal('pelanggaran')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                        filterKategoriModal === 'pelanggaran'
                                            ? 'bg-rose-600 text-white font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Pelanggaran
                                </button>
                            </div>
                        </div>

                        {/* List Catatan Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
                            {modalLaporans.length === 0 ? (
                                <div className="py-12 text-center text-sm text-muted-foreground italic">
                                    Tidak ada catatan dalam kategori ini.
                                </div>
                            ) : (
                                modalLaporans.map((lap) => {
                                    const isPenghargaan = lap.kategori === 'prestasi' || lap.kategori === 'kebaikan';
                                    return (
                                        <div
                                            key={lap.id}
                                            className={`rounded-xl border p-4 transition-colors ${
                                                isPenghargaan
                                                    ? 'border-emerald-200/80 bg-emerald-50/20'
                                                    : 'border-rose-200/80 bg-rose-50/20'
                                            }`}
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-2 pb-2 border-b border-border/50">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                                        isPenghargaan
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {isPenghargaan ? 'Penghargaan / Prestasi' : 'Pelanggaran Disiplin'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatIndonesianDate(lap.tanggal_kejadian)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">·</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Dicatat oleh: <strong className="text-foreground">{lap.guru_nama}</strong>
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={lap.status} />
                                                    {lap.poin_diberikan !== null && lap.poin_diberikan !== undefined && (
                                                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                                            lap.poin_diberikan > 0
                                                                ? 'bg-emerald-600 text-white'
                                                                : lap.poin_diberikan < 0
                                                                ? 'bg-rose-600 text-white'
                                                                : 'bg-muted text-foreground'
                                                        }`}>
                                                            {lap.poin_diberikan > 0 ? `+${lap.poin_diberikan}` : lap.poin_diberikan} Poin
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pt-2.5">
                                                <p className="text-sm font-medium text-foreground leading-relaxed">
                                                    {lap.keterangan}
                                                </p>
                                                {lap.keterangan_tambahan && (
                                                    <p className="mt-1 text-xs text-muted-foreground italic">
                                                        Keterangan tambahan: {lap.keterangan_tambahan}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Bukti Lampiran Foto jika ada */}
                                            {lap.bukti_urls && lap.bukti_urls.length > 0 && (
                                                <div className="mt-3 pt-2.5 border-t border-border/40">
                                                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                                                        Lampiran Bukti Foto ({lap.bukti_urls.length}):
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {lap.bukti_urls.map((b, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                onClick={() => setLightboxImg({ url: b.url, nama: b.nama_asli })}
                                                                className="group relative size-14 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                                                            >
                                                                <img
                                                                    src={b.url}
                                                                    alt={b.nama_asli}
                                                                    className="size-full object-cover group-hover:scale-105 transition-transform"
                                                                />
                                                                <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <ZoomIn className="size-4 text-white" />
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t px-6 py-3 bg-muted/20 flex justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setActiveModalMurid(null)}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Preview Gambar */}
            {lightboxImg && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setLightboxImg(null)}
                            className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
                        >
                            <X className="size-6" />
                        </button>
                        <img
                            src={lightboxImg.url}
                            alt={lightboxImg.nama}
                            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
