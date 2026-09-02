import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronRight, GraduationCap } from 'lucide-react';
import { useState } from 'react';

interface LaporanRingkas {
    id: number;
    tanggal_kejadian: string;
    kategori: string;
    keterangan: string;
    poin_diberikan: number;
    status: string;
}

interface MuridRekap {
    id: number;
    nama: string;
    nis: string | null;
    skor_resmi: number;
    skor_sementara: number;
    jumlah_laporan: number;
    laporans: LaporanRingkas[];
}

interface Props {
    kelas: { id: number; nama_kelas: string };
    murids: MuridRekap[];
    filters: { status?: string; dari?: string; sampai?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Rekap Kelas', href: '/guru/kelas/rekap' },
];

export default function RekapKelas({ kelas, murids, filters }: Props) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [status, setStatus]     = useState(filters.status ?? 'semua');
    const [dari, setDari]         = useState(filters.dari ?? '');
    const [sampai, setSampai]     = useState(filters.sampai ?? '');

    const toggle = (id: number) =>
        setExpanded((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

    const applyFilter = () =>
        router.get('/guru/kelas/rekap', { status, dari, sampai }, { preserveState: true, replace: true });

    const resetFilter = () => {
        setStatus('semua'); setDari(''); setSampai('');
        router.get('/guru/kelas/rekap', {}, { replace: true });
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
                    <div className="rounded-lg border bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground w-8"></th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Murid</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Skor Resmi</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Skor Sementara</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Laporan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {sorted.map((m) => (
                                    <>
                                        <tr key={m.id}
                                            className="cursor-pointer hover:bg-muted/20"
                                            onClick={() => toggle(m.id)}
                                        >
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {expanded.has(m.id)
                                                    ? <ChevronDown className="size-4" />
                                                    : <ChevronRight className="size-4" />}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{m.nama}</p>
                                                {m.nis && <p className="text-xs text-muted-foreground">NIS: {m.nis}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`font-semibold ${m.skor_resmi < 0 ? 'text-red-600' : m.skor_resmi > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                    {m.skor_resmi >= 0 ? '+' : ''}{m.skor_resmi}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-sm ${m.skor_sementara < 0 ? 'text-red-400' : m.skor_sementara > 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
                                                    {m.skor_sementara >= 0 ? '+' : ''}{m.skor_sementara}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{m.jumlah_laporan} laporan</td>
                                        </tr>
                                        {expanded.has(m.id) && (
                                            <tr key={`${m.id}-detail`}>
                                                <td colSpan={5} className="bg-muted/20 px-4 pb-3 pt-0">
                                                    {m.laporans.length === 0 ? (
                                                        <p className="py-3 text-center text-xs text-muted-foreground">
                                                            Tidak ada laporan sesuai filter.
                                                        </p>
                                                    ) : (
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="text-left text-muted-foreground">
                                                                    <th className="py-1.5 pr-4 font-medium">Tanggal</th>
                                                                    <th className="py-1.5 pr-4 font-medium">Keterangan</th>
                                                                    <th className="py-1.5 pr-4 font-medium">Poin</th>
                                                                    <th className="py-1.5 font-medium">Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-muted">
                                                                {m.laporans.map((l) => (
                                                                    <tr key={l.id}>
                                                                        <td className="py-1.5 pr-4 text-muted-foreground">{l.tanggal_kejadian}</td>
                                                                        <td className="py-1.5 pr-4">
                                                                            <span className="mr-1.5"><StatusBadge status={l.kategori} /></span>
                                                                            {l.keterangan}
                                                                        </td>
                                                                        <td className={`py-1.5 pr-4 font-medium ${l.poin_diberikan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                            {l.poin_diberikan >= 0 ? '+' : ''}{l.poin_diberikan}
                                                                        </td>
                                                                        <td className="py-1.5"><StatusBadge status={l.status} /></td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
