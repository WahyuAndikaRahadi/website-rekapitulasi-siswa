import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Pencil } from 'lucide-react';
import { useState } from 'react';

interface LaporanItem {
    id: number;
    tanggal_kejadian: string;
    murid_nama: string;
    kelas_nama: string;
    keterangan: string;
    kategori: string;
    tingkat_keparahan: string;
    poin_diberikan: number;
    status: string;
    bisa_diedit: boolean;
}

interface Props {
    laporans: {
        data: LaporanItem[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number;
        to: number;
        total: number;
    };
    filters: { status?: string; kategori?: string; dari?: string; sampai?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Riwayat Laporan', href: '/guru/laporan/riwayat' },
];

export default function RiwayatLaporan({ laporans, filters }: Props) {
    const [status, setStatus]     = useState(filters.status ?? '');
    const [kategori, setKategori] = useState(filters.kategori ?? '');
    const [dari, setDari]         = useState(filters.dari ?? '');
    const [sampai, setSampai]     = useState(filters.sampai ?? '');

    const applyFilter = () => {
        router.get('/guru/laporan/riwayat', { status, kategori, dari, sampai }, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        setStatus(''); setKategori(''); setDari(''); setSampai('');
        router.get('/guru/laporan/riwayat', {}, { preserveState: false, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Laporan" />
            <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Riwayat Laporan</h1>
                    <Link
                        href="/guru/laporan/buat"
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        + Buat Laporan
                    </Link>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="ditindaklanjuti">Ditindaklanjuti</option>
                            <option value="ditolak">Ditolak</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Kategori</label>
                        <select
                            value={kategori}
                            onChange={(e) => setKategori(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="">Semua Kategori</option>
                            <option value="pelanggaran">Pelanggaran</option>
                            <option value="kebaikan">Kebaikan</option>
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
                    <button onClick={applyFilter} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        Terapkan
                    </button>
                    <button onClick={resetFilter} className="h-9 rounded-md border px-3 text-sm hover:bg-muted">
                        Reset
                    </button>
                </div>

                {/* Tabel */}
                <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
                    {laporans.data.length === 0 ? (
                        <EmptyState
                            icon={ClipboardList}
                            title="Belum ada laporan"
                            description="Laporan yang kamu buat akan tampil di sini."
                        />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Murid</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Kategori & Tingkat</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Keterangan</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground text-center">Poin</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {laporans.data.map((l) => (
                                            <tr key={l.id} className="hover:bg-muted/20">
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{l.tanggal_kejadian}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-foreground">{l.murid_nama}</p>
                                                    <p className="text-xs text-muted-foreground">{l.kelas_nama}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusBadge status={l.kategori} />
                                                        <span className="text-xs font-medium capitalize text-muted-foreground">
                                                            ({l.tingkat_keparahan})
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    {l.keterangan}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-mono font-bold ${l.poin_diberikan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {l.poin_diberikan > 0 ? `+${l.poin_diberikan}` : l.poin_diberikan}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={l.status} />
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {l.bisa_diedit && (
                                                        <Link
                                                            href={`/guru/laporan/${l.id}/edit`}
                                                            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground border"
                                                        >
                                                            <Pencil className="size-3" /> Edit
                                                        </Link>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 border-t">
                                <Pagination links={laporans.links} from={laporans.from} to={laporans.to} total={laporans.total} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
