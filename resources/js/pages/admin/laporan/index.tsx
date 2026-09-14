import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ClipboardList, Clock } from 'lucide-react';
import React, { useState } from 'react';

interface LaporanItem {
    id: number;
    tanggal_kejadian: string;
    murid_nama: string;
    kelas_nama: string;
    guru_nama: string;
    kategori: string;
    tingkat_keparahan: string;
    keterangan: string;
    is_manual: boolean;
    needs_verification: boolean;
    poin_diberikan: number;
    status: string;
    jumlah_bukti: number;
}

interface FilterOption { id: number; nama_kelas?: string; nama?: string; label?: string; }

interface Props {
    laporans: {
        data: LaporanItem[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number; to: number; total: number;
    };
    filters: Record<string, string>;
    kelas_list: FilterOption[];
    guru_list: FilterOption[];
    tahun_ajarans: FilterOption[];
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

export default function AdminLaporanIndex({ laporans, filters, kelas_list, guru_list, tahun_ajarans, summary }: Props) {
    const [f, setF] = useState({
        status: filters.status ?? '',
        kategori: filters.kategori ?? '',
        kelas_id: filters.kelas_id ?? '',
        guru_id: filters.guru_id ?? '',
        dari: filters.dari ?? '',
        sampai: filters.sampai ?? '',
        tahun_ajaran_id: filters.tahun_ajaran_id ?? '',
    });

    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const apply = () => router.get('/admin/laporan', f, { preserveState: true, replace: true });
    const reset = () => {
        const empty = { status: '', kategori: '', kelas_id: '', guru_id: '', dari: '', sampai: '', tahun_ajaran_id: '' };
        setF(empty);
        router.get('/admin/laporan', {}, { replace: true });
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Masuk" />
            <div className="space-y-5 p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Laporan Masuk & Manajemen Kasus</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Pantau laporan masuk dari guru, ubah status pembinaan, atau verifikasi laporan manual.
                        </p>
                    </div>
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
                            <label className="text-xs font-medium text-muted-foreground">Tahun Ajaran</label>
                            <select value={f.tahun_ajaran_id} onChange={upd('tahun_ajaran_id')} className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="">Semua</option>
                                {tahun_ajarans.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
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
                            <label className="text-xs font-medium text-muted-foreground">Kategori</label>
                            <select value={f.kategori} onChange={upd('kategori')} className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="">Semua</option>
                                <option value="pelanggaran">Pelanggaran</option>
                                <option value="prestasi">Prestasi</option>
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
                        <button onClick={apply} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Terapkan</button>
                        <button onClick={reset} className="h-9 rounded-md border px-3 text-sm hover:bg-muted transition-colors">Reset</button>
                    </div>
                </div>

                {/* Tabel */}
                <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
                    {laporans.data.length === 0 ? (
                        <EmptyState icon={ClipboardList} title="Tidak ada laporan" description="Coba ubah filter atau tunggu laporan masuk dari guru." />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Murid</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Kategori</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Keterangan</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground text-center">Poin</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Pelapor</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Status & Alur</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Bukti</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {laporans.data.map((l) => (
                                            <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{l.tanggal_kejadian}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-foreground">{l.murid_nama}</p>
                                                    <p className="text-xs text-muted-foreground">{l.kelas_nama}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusBadge status={l.kategori} />
                                                        {l.is_manual && (
                                                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold border border-amber-300">
                                                                Manual
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    <p className="max-w-[220px] truncate" title={l.keterangan}>{l.keterangan}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-mono font-bold ${l.poin_diberikan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {l.poin_diberikan > 0 ? `+${l.poin_diberikan}` : l.poin_diberikan}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground text-xs">{l.guru_nama}</td>
                                                <td className="px-4 py-3">
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
                                                <td className="px-4 py-3 text-muted-foreground text-xs">{l.jumlah_bukti > 0 ? `${l.jumlah_bukti} foto` : '—'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link href={`/admin/laporan/${l.id}`} className="rounded px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors">
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={laporans.links} from={laporans.from} to={laporans.to} total={laporans.total} />
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
