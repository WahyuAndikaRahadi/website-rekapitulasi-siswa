import { EmptyState } from '@/components/empty-state';
import { TambahCatatanModal, type TargetMurid } from '@/components/tambah-catatan-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Filter, GraduationCap, PlusCircle, RotateCcw, Search } from 'lucide-react';
import { useCallback, useState } from 'react';

interface MuridItem {
    id: number;
    nama: string;
    nis: string | null;
    nisn: string | null;
    kelas_id: number;
    nama_kelas: string;
    tingkat: string;
    skor_resmi: number;
    skor_sementara: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    murids: {
        data: MuridItem[];
        links: PaginationLink[];
        total: number;
        current_page: number;
        last_page: number;
        from: number;
        to: number;
    };
    filters: {
        q?: string;
        tingkat?: string;
        jurusan?: string;
        kelas_id?: string;
    };
    tingkat_list: string[];
    jurusan_list: string[];
    kelas_list: { id: number; nama_kelas: string; tingkat: string }[];
    poin_ranges: Record<string, Record<string, { min: number; max: number }>>;
    tahun_ajaran: { id: number; label: string } | null;
    flash?: { success?: string; error?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Buat Laporan', href: '/guru/laporan/buat' },
];

export default function BuatLaporan({
    murids,
    filters,
    tingkat_list,
    jurusan_list,
    kelas_list,
    poin_ranges,
    tahun_ajaran,
    flash,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.q ?? '');
    const [selectedTingkat, setSelectedTingkat] = useState(filters.tingkat ?? '');
    const [selectedJurusan, setSelectedJurusan] = useState(filters.jurusan ?? '');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas_id ?? '');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetMurid, setTargetMurid] = useState<TargetMurid | null>(null);

    const applyFilters = useCallback(
        (overrides: Partial<typeof filters> = {}) => {
            const params = {
                q: searchQuery,
                tingkat: selectedTingkat,
                jurusan: selectedJurusan,
                kelas_id: selectedKelas,
                ...overrides,
            };

            // Bersihkan parameter kosong
            const cleanParams: Record<string, string> = {};
            Object.entries(params).forEach(([key, val]) => {
                if (val) cleanParams[key] = val;
            });

            router.get('/guru/laporan/buat', cleanParams, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [searchQuery, selectedTingkat, selectedJurusan, selectedKelas],
    );

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const handleReset = () => {
        setSearchQuery('');
        setSelectedTingkat('');
        setSelectedJurusan('');
        setSelectedKelas('');
        router.get('/guru/laporan/buat', {}, { replace: true });
    };

    const openCatatModal = (murid: MuridItem) => {
        setTargetMurid({
            id: murid.id,
            nama: murid.nama,
            nis: murid.nis,
            nisn: murid.nisn,
            nama_kelas: murid.nama_kelas,
        });
        setIsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Laporan & Catat Siswa" />

            <div className="space-y-6 p-6">
                {/* Header & Academic Year badge */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Buat Laporan & Catat Siswa</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Cari siswa berdasarkan nama, NIS, NISN, atau filter berdasarkan tingkat dan jurusan untuk menambahkan catatan pelanggaran atau kebaikan.
                        </p>
                    </div>
                    {tahun_ajaran && (
                        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground">
                            <span className="size-2 rounded-full bg-emerald-500"></span>
                            Tahun Ajaran: {tahun_ajaran.label}
                        </div>
                    )}
                </div>

                {/* Flash Message */}
                {flash?.success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        <span>{flash.success}</span>
                    </div>
                )}

                {/* Filter & Search Bar */}
                <div className="rounded-xl border bg-card p-4 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12">
                            {/* Search Bar */}
                            <div className="lg:col-span-5 relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, NIS, atau NISN murid..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            {/* Filter Tingkat */}
                            <div className="lg:col-span-2">
                                <select
                                    value={selectedTingkat}
                                    onChange={(e) => {
                                        setSelectedTingkat(e.target.value);
                                        applyFilters({ tingkat: e.target.value });
                                    }}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Semua Tingkat</option>
                                    {tingkat_list.map((t) => (
                                        <option key={t} value={t}>
                                            Tingkat {t}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Jurusan */}
                            <div className="lg:col-span-2">
                                <select
                                    value={selectedJurusan}
                                    onChange={(e) => {
                                        setSelectedJurusan(e.target.value);
                                        applyFilters({ jurusan: e.target.value });
                                    }}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Semua Jurusan</option>
                                    {jurusan_list.map((j) => (
                                        <option key={j} value={j}>
                                            Jurusan {j}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Kelas */}
                            <div className="lg:col-span-3">
                                <select
                                    value={selectedKelas}
                                    onChange={(e) => {
                                        setSelectedKelas(e.target.value);
                                        applyFilters({ kelas_id: e.target.value });
                                    }}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Semua Kelas</option>
                                    {kelas_list.map((k) => (
                                        <option key={k.id} value={k.id}>
                                            {k.nama_kelas}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search Action Buttons */}
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan <span className="font-semibold text-foreground">{murids.total}</span> murid terdaftar
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <RotateCcw className="size-3" />
                                    Reset Filter
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                    <Search className="size-3" />
                                    Cari
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Student Table */}
                <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                    {murids.data.length === 0 ? (
                        <div className="p-8">
                            <EmptyState
                                icon={GraduationCap}
                                title="Data murid tidak ditemukan"
                                description="Tidak ada murid yang cocok dengan kata kunci pencarian atau filter yang dipilih."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-muted-foreground">
                                        <th className="py-3 px-4 font-semibold w-12 text-center">No</th>
                                        <th className="py-3 px-4 font-semibold">Nama Murid</th>
                                        <th className="py-3 px-4 font-semibold">NIS / NISN</th>
                                        <th className="py-3 px-4 font-semibold">Kelas & Tingkat</th>
                                        <th className="py-3 px-4 font-semibold text-center">Skor Resmi</th>
                                        <th className="py-3 px-4 font-semibold text-center">Skor Sementara</th>
                                        <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {murids.data.map((m, idx) => {
                                        const rowNumber = (murids.current_page - 1) * 15 + idx + 1;
                                        return (
                                            <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="py-3 px-4 text-center text-xs text-muted-foreground font-mono">
                                                    {rowNumber}
                                                </td>
                                                <td className="py-3 px-4 font-medium text-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <span>{m.nama}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                                                    <div>NIS: <span className="font-semibold text-foreground">{m.nis ?? '-'}</span></div>
                                                    {m.nisn && <div className="text-[11px] opacity-80">NISN: {m.nisn}</div>}
                                                </td>
                                                <td className="py-3 px-4 text-xs">
                                                    <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 font-medium text-secondary-foreground">
                                                        {m.nama_kelas}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full text-xs font-mono ${
                                                            m.skor_resmi < 0
                                                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                                : m.skor_resmi > 0
                                                                  ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                                                  : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        {m.skor_resmi > 0 ? `+${m.skor_resmi}` : m.skor_resmi}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center justify-center font-medium px-2 py-0.5 rounded-full text-xs font-mono ${
                                                            m.skor_sementara < 0
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : m.skor_sementara > 0
                                                                  ? 'text-green-600 dark:text-green-400'
                                                                  : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {m.skor_sementara > 0 ? `+${m.skor_sementara}` : m.skor_sementara}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => openCatatModal(m)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-95"
                                                    >
                                                        <PlusCircle className="size-3.5" />
                                                        Tambah Catatan
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {murids.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
                            <p className="text-xs text-muted-foreground">
                                Halaman {murids.current_page} dari {murids.last_page}
                            </p>
                            <div className="flex items-center gap-1">
                                {murids.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground font-semibold'
                                                : link.url
                                                  ? 'hover:bg-muted text-foreground'
                                                  : 'pointer-events-none opacity-40 text-muted-foreground'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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
