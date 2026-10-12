import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { formatIndonesianDate } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ClipboardList, Clock, FileSpreadsheet, X, ZoomIn } from 'lucide-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface LaporanItem {
    id: number;
    tanggal_kejadian: string;
    murid_nama: string;
    murid_nis?: string | null;
    murid_no_telp?: string | null;
    kelas_nama: string;
    guru_nama: string;
    guru_no_telp?: string | null;
    kategori: string;
    tingkat_keparahan: string;
    keterangan: string;
    keterangan_tambahan?: string | null;
    is_manual: boolean;
    needs_verification: boolean;
    poin_diberikan: number;
    status: string;
    jumlah_bukti: number;
    bukti_urls: { url: string; nama_asli: string }[];
}

interface FilterOption { id: number; nama_kelas?: string; nama?: string; }

interface Props {
    laporans: {
        data: LaporanItem[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number; to: number; total: number;
    };
    filters: Record<string, string>;
    kelas_list: FilterOption[];
    guru_list: FilterOption[];
    summary: {
        menunggu_verifikasi: number;
        baru_dilaporkan: number;
        pembinaan: number;
        selesai: number;
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Laporan Masuk', href: '/admin/laporan' },
];

export default function AdminLaporanIndex({ laporans, filters, kelas_list, guru_list, summary }: Props) {
    const activeTab = filters.kategori === 'prestasi' ? 'prestasi' : 'pelanggaran';

    const [f, setF] = useState({
        status: filters.status ?? '',
        kategori: activeTab,
        kelas_id: filters.kelas_id ?? '',
        guru_id: filters.guru_id ?? '',
        dari: filters.dari ?? '',
        sampai: filters.sampai ?? '',
    });

    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [lightbox, setLightbox] = useState<{ url: string; nama: string } | null>(null);

    const apply = (overrides?: Partial<typeof f>) => {
        const nextFilters = { ...f, ...overrides };
        router.get('/admin/laporan', nextFilters, { preserveState: true, replace: true });
    };

    const handleTabChange = (kategoriTab: 'pelanggaran' | 'prestasi') => {
        setF((prev) => ({ ...prev, kategori: kategoriTab }));
        apply({ kategori: kategoriTab });
    };

    const reset = () => {
        const empty = { status: '', kategori: activeTab, kelas_id: '', guru_id: '', dari: '', sampai: '' };
        setF(empty);
        router.get('/admin/laporan', { kategori: activeTab }, { replace: true });
    };

    const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
        setF((p) => ({ ...p, [k]: e.target.value }));

    const handleStatusChange = (laporanId: number, newStatus: string) => {
        setUpdatingId(laporanId);
        router.patch(
            `/admin/laporan/${laporanId}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingId(null),
            }
        );
    };

    const handleExport = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/admin/export/laporan';

        const token = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (token) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = token;
            form.appendChild(csrfInput);
        }

        const exportParams = { ...f, kategori: activeTab };
        Object.entries(exportParams).forEach(([key, value]) => {
            if (value) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = String(value);
                form.appendChild(input);
            }
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Masuk" />
            <div className="space-y-5 p-4 md:p-6 w-full max-w-full min-w-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Laporan Masuk & Manajemen Kasus</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pantau laporan masuk dari guru, ubah status pembinaan, atau verifikasi laporan manual.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
                    >
                        <FileSpreadsheet className="size-4" />
                        Export Excel (+ Foto)
                    </button>
                </div>

                {/* 2 Tab Utama: Pelanggaran vs Prestasi */}
                <div className="flex items-center gap-2 border-b border-border pb-1">
                    <button
                        type="button"
                        onClick={() => handleTabChange('pelanggaran')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-extrabold rounded-t-xl transition-all border-b-2 ${
                            activeTab === 'pelanggaran'
                                ? 'border-red-600 bg-red-600/10 text-red-700 dark:text-red-300 border-b-red-600 shadow-2xs'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                    >
                        <AlertCircle className="size-4 text-red-600" />
                        Tab Pelanggaran Murid
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('prestasi')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-extrabold rounded-t-xl transition-all border-b-2 ${
                            activeTab === 'prestasi'
                                ? 'border-emerald-600 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-b-emerald-600 shadow-2xs'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        }`}
                    >
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        Tab Prestasi / Penghargaan
                    </button>
                </div>

                {/* Summary chips */}
                <div className="flex flex-wrap gap-2.5">
                    {summary.menunggu_verifikasi > 0 && (
                        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3.5 py-2 text-xs font-semibold text-yellow-900 shadow-2xs animate-pulse flex items-center gap-1.5">
                            <Clock className="size-3.5 text-yellow-600" />
                            <span><span className="font-bold">{summary.menunggu_verifikasi}</span> Menunggu Verifikasi Admin</span>
                        </div>
                    )}
                    {[
                        { label: 'Baru Dilaporkan', val: summary.baru_dilaporkan, cls: 'bg-blue-50 border-blue-200 text-blue-800' },
                        { label: 'Pembinaan Tindak Lanjut', val: summary.pembinaan, cls: 'bg-amber-50 border-amber-300 text-amber-900' },
                        { label: 'Selesai', val: summary.selesai, cls: 'bg-green-50 border-green-200 text-green-800' },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-lg border px-3.5 py-2 text-xs font-medium ${s.cls}`}>
                            <span className="font-bold">{s.val}</span> {s.label}
                        </div>
                    ))}
                </div>

                {/* Filter */}
                <div className="rounded-lg border bg-white p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Status</label>
                            <select value={f.status} onChange={upd('status')} className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="">Semua Status</option>
                                <option value="menunggu verifikasi">Menunggu Verifikasi (Manual)</option>
                                <option value="baru dilaporkan">Baru Dilaporkan</option>
                                <option value="pembinaan tindak lanjut">Pembinaan Tindak Lanjut</option>
                                <option value="selesai">Selesai</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Kelas</label>
                            <select value={f.kelas_id} onChange={upd('kelas_id')} className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="">Semua Kelas</option>
                                {kelas_list.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Guru</label>
                            <select value={f.guru_id} onChange={upd('guru_id')} className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="">Semua Guru</option>
                                {guru_list.map((g) => <option key={g.id} value={g.id}>{g.nama}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Dari</label>
                            <input type="date" value={f.dari} onChange={upd('dari')} className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Sampai</label>
                            <input type="date" value={f.sampai} onChange={upd('sampai')} className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        </div>
                        <button onClick={() => apply()} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Terapkan</button>
                        <button onClick={reset} className="h-9 rounded-md border px-3 text-sm hover:bg-muted transition-colors">Reset</button>
                    </div>
                </div>

                {/* Tabel Sesuai Format Template */}
                <div className="rounded-lg border bg-white shadow-xs overflow-hidden w-full max-w-full">
                    {laporans.data.length === 0 ? (
                        <EmptyState icon={ClipboardList} title={`Tidak ada laporan ${activeTab}`} description="Coba ubah filter atau tunggu laporan masuk dari guru." />
                    ) : (
                        <>
                            <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto touch-pan-x">
                                <table className="w-full min-w-[1400px] text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b bg-muted/50 text-left text-xs uppercase font-extrabold tracking-wider">
                                            <th className="px-3 py-3 w-10 text-center text-muted-foreground">No</th>
                                            <th className="px-3 py-3 min-w-[100px] text-muted-foreground">Tanggal</th>
                                            <th className="px-3 py-3 min-w-[150px] text-muted-foreground">Identitas Pelapor (Guru/Tendik)</th>
                                            <th className="px-3 py-3 min-w-[130px] text-muted-foreground">No Telp Guru</th>
                                            <th className="px-3 py-3 min-w-[150px] text-muted-foreground">Nama Murid</th>
                                            <th className="px-3 py-3 min-w-[130px] text-muted-foreground">No Telp Murid</th>
                                            <th className="px-3 py-3 min-w-[80px] text-muted-foreground">Kelas</th>
                                            <th className="px-3 py-3 min-w-[260px] text-muted-foreground">
                                                {activeTab === 'pelanggaran' ? 'Jenis & Keterangan Pelanggaran' : 'Jenis & Keterangan Prestasi'}
                                            </th>
                                            <th className="px-3 py-3 min-w-[200px] text-muted-foreground">Kronologi</th>
                                            <th className="px-3 py-3 min-w-[90px] text-center text-muted-foreground">Angka Poin</th>
                                            <th className="px-3 py-3 min-w-[120px] text-muted-foreground">Bukti Foto</th>
                                            <th className="px-3 py-3 min-w-[200px] text-muted-foreground">Status & Alur</th>
                                            <th className="px-3 py-3 min-w-[70px]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {laporans.data.map((l, index) => {
                                            const rowNo = (laporans.from || 1) + index;
                                            return (
                                                <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-3 py-3 text-center text-xs font-mono text-muted-foreground font-bold">{rowNo}</td>
                                                    <td className="px-3 py-3 text-muted-foreground text-xs">{formatIndonesianDate(l.tanggal_kejadian)}</td>
                                                    <td className="px-3 py-3 text-xs">
                                                        <p className="font-semibold text-foreground">{l.guru_nama}</p>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs font-mono text-muted-foreground font-semibold">
                                                        {l.guru_no_telp ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs">
                                                        <p className="font-bold text-foreground">{l.murid_nama}</p>
                                                        {l.murid_nis && <p className="font-mono text-[11px] text-muted-foreground">NIS: {l.murid_nis}</p>}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs font-mono text-muted-foreground">
                                                        {l.murid_no_telp ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs font-semibold text-foreground">{l.kelas_nama}</td>
                                                    <td className="px-3 py-3 text-xs">
                                                        <div className="flex items-center gap-1 mb-0.5">
                                                            <StatusBadge status={l.kategori} />
                                                            {l.is_manual && (
                                                                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                                                                    Manual
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="font-semibold text-foreground" title={l.keterangan}>{l.keterangan}</p>
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-muted-foreground">
                                                        {l.keterangan_tambahan ? (
                                                            <p className="leading-relaxed" title={l.keterangan_tambahan}>{l.keterangan_tambahan}</p>
                                                        ) : (
                                                            <span className="font-mono">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg ${
                                                            l.poin_diberikan >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                                        }`}>
                                                            {l.poin_diberikan > 0 ? `+${l.poin_diberikan}` : l.poin_diberikan}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {l.bukti_urls.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {l.bukti_urls.map((b, bi) => (
                                                                    <button
                                                                        key={bi}
                                                                        type="button"
                                                                        onClick={() => setLightbox({ url: b.url, nama: b.nama_asli })}
                                                                        className="relative group overflow-hidden rounded-md border border-slate-200 hover:border-primary transition-all"
                                                                        title={b.nama_asli}
                                                                    >
                                                                        <img
                                                                            src={b.url}
                                                                            alt={b.nama_asli}
                                                                            className="size-12 object-cover block"
                                                                            loading="lazy"
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                                                                            <ZoomIn className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs font-mono">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {l.status === 'menunggu verifikasi' ? (
                                                            <div className="flex flex-col gap-1">
                                                                <StatusBadge status="menunggu verifikasi" />
                                                                <Link
                                                                    href={`/admin/laporan/${l.id}`}
                                                                    className="text-[11px] font-bold text-amber-700 underline hover:text-amber-900"
                                                                >
                                                                    Verifikasi Sekarang →
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    value={l.status}
                                                                    disabled={updatingId === l.id}
                                                                    onChange={(e) => handleStatusChange(l.id, e.target.value)}
                                                                    className={`h-8 rounded-md border text-xs font-semibold px-2 focus:outline-none focus:ring-1 transition-all ${
                                                                        l.status === 'baru dilaporkan'
                                                                            ? 'bg-blue-50/80 text-blue-800 border-blue-200'
                                                                            : l.status === 'pembinaan tindak lanjut'
                                                                              ? 'bg-amber-50/80 text-amber-800 border-amber-300'
                                                                              : l.status === 'selesai'
                                                                                ? 'bg-green-50/80 text-green-800 border-green-200'
                                                                                : 'bg-muted text-muted-foreground border-border'
                                                                    }`}
                                                                >
                                                                    <option value="baru dilaporkan">Baru Dilaporkan</option>
                                                                    <option value="pembinaan tindak lanjut">Pembinaan Tindak Lanjut</option>
                                                                    <option value="selesai">Selesai</option>
                                                                    <option value="ditolak">Ditolak</option>
                                                                </select>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-right">
                                                        <Link href={`/admin/laporan/${l.id}`} className="rounded px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                                                            Detail
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={laporans.links} from={laporans.from} to={laporans.to} total={laporans.total} />
                        </>
                    )}
                </div>
            </div>
        </AppLayout>

        {lightbox && createPortal(
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
                onClick={() => setLightbox(null)}
            >
                <div
                    className="relative max-w-5xl max-h-[92vh] flex flex-col items-center gap-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between w-full px-1">
                        <p className="text-white text-sm font-medium truncate max-w-[85%]">{lightbox.nama}</p>
                        <button
                            onClick={() => setLightbox(null)}
                            className="ml-3 flex-shrink-0 rounded-full bg-white/20 hover:bg-white/40 p-2 text-white transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <img
                        src={lightbox.url}
                        alt={lightbox.nama}
                        className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
                    />
                </div>
            </div>,
            document.body
        )}
    </>
    );
}
