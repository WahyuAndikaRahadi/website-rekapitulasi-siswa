import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { GraduationCap, Pencil, Plus, School, Search, Trash2, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface KelasItem {
    id: number;
    nama_kelas: string;
    tingkat: string;
    wali_kelas: string | null;
    total_murid?: number;
}

interface Props {
    kelas_list: KelasItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Kelola Kelas', href: '/admin/kelas' },
];

export default function KelasIndex({ kelas_list }: Props) {
    const [editItem, setEditItem] = useState<KelasItem | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTingkat, setFilterTingkat] = useState<string>('all');

    const createForm = useForm({
        nama_kelas: '',
        tingkat: 'X',
    });

    const editForm = useForm({
        nama_kelas: '',
        tingkat: '',
    });

    const openEdit = (k: KelasItem) => {
        setEditItem(k);
        editForm.setData({
            nama_kelas: k.nama_kelas,
            tingkat: k.tingkat,
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/kelas', {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem) return;
        editForm.put(`/admin/kelas/${editItem.id}`, {
            onSuccess: () => setEditItem(null),
        });
    };

    const handleDelete = (id: number, nama: string) => {
        if (!confirm(`Hapus kelas "${nama}"? Data murid dalam kelas ini harus dipindahkan atau kosong terlebih dahulu.`)) return;
        router.delete(`/admin/kelas/${id}`);
    };

    const filteredKelas = useMemo(() => {
        return kelas_list.filter((k) => {
            const matchesSearch = k.nama_kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (k.wali_kelas && k.wali_kelas.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesTingkat = filterTingkat === 'all' || k.tingkat === filterTingkat;
            return matchesSearch && matchesTingkat;
        });
    }, [kelas_list, searchQuery, filterTingkat]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Kelas" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-full min-w-0">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">Kelola Kelas</h1>
                        <p className="text-sm text-muted-foreground">
                            Manajemen daftar kelas untuk kegiatan belajar dan rekapitulasi siswa
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors w-fit"
                    >
                        <Plus className="size-4" />
                        Tambah Kelas
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari nama kelas atau wali kelas..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Tingkat:</span>
                        <select
                            value={filterTingkat}
                            onChange={(e) => setFilterTingkat(e.target.value)}
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="all">Semua Tingkat</option>
                            <option value="X">Kelas X</option>
                            <option value="XI">Kelas XI</option>
                            <option value="XII">Kelas XII</option>
                            <option value="XIII">Kelas XIII</option>
                        </select>
                    </div>
                </div>

                {/* Modal Tambah Kelas */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between border-b pb-3">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Tambah Kelas Baru</h2>
                                    <p className="text-xs text-muted-foreground">Buat kelas baru untuk data siswa</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsCreateOpen(false);
                                        createForm.reset();
                                    }}
                                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Tingkat <span className="text-red-500">*</span></label>
                                    <select
                                        value={createForm.data.tingkat}
                                        onChange={(e) => createForm.setData('tingkat', e.target.value)}
                                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="X">X</option>
                                        <option value="XI">XI</option>
                                        <option value="XII">XII</option>
                                        <option value="XIII">XIII</option>
                                    </select>
                                    {createForm.errors.tingkat && <p className="text-xs text-red-600">{createForm.errors.tingkat}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Nama Kelas <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={createForm.data.nama_kelas}
                                        onChange={(e) => createForm.setData('nama_kelas', e.target.value)}
                                        placeholder="Misal: X SIJA 1"
                                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    {createForm.errors.nama_kelas && <p className="text-xs text-red-600">{createForm.errors.nama_kelas}</p>}
                                </div>
                                <div className="flex gap-2.5 pt-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setIsCreateOpen(false);
                                            createForm.reset();
                                        }}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={createForm.processing}
                                        loadingText="Menyimpan..."
                                        className="flex-1"
                                    >
                                        Simpan Kelas
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal Edit Kelas */}
                {editItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between border-b pb-3">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Edit Data Kelas</h2>
                                    <p className="text-xs text-muted-foreground">Perbarui informasi tingkat atau nama kelas</p>
                                </div>
                                <button
                                    onClick={() => setEditItem(null)}
                                    className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Tingkat <span className="text-red-500">*</span></label>
                                    <select
                                        value={editForm.data.tingkat}
                                        onChange={(e) => editForm.setData('tingkat', e.target.value)}
                                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="X">X</option>
                                        <option value="XI">XI</option>
                                        <option value="XII">XII</option>
                                        <option value="XIII">XIII</option>
                                    </select>
                                    {editForm.errors.tingkat && <p className="text-xs text-red-600">{editForm.errors.tingkat}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-foreground">Nama Kelas <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.nama_kelas}
                                        onChange={(e) => editForm.setData('nama_kelas', e.target.value)}
                                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    {editForm.errors.nama_kelas && <p className="text-xs text-red-600">{editForm.errors.nama_kelas}</p>}
                                </div>
                                <div className="flex gap-2.5 pt-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setEditItem(null)}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={editForm.processing}
                                        loadingText="Menyimpan..."
                                        className="flex-1"
                                    >
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Table Card */}
                <div className="overflow-hidden rounded-xl border bg-card shadow-xs w-full max-w-full">
                    <div className="flex items-center justify-between border-b px-5 py-3.5 bg-muted/30">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <School className="size-4 text-primary" />
                            <span>Total {filteredKelas.length} Kelas</span>
                        </div>
                    </div>
                    {filteredKelas.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Tidak ada kelas ditemukan"
                            description={kelas_list.length === 0 ? "Belum ada data kelas yang ditambahkan." : "Tidak ada kelas yang cocok dengan pencarian."}
                            actionLabel={kelas_list.length === 0 ? "Tambah Kelas Sekarang" : undefined}
                            onAction={kelas_list.length === 0 ? () => setIsCreateOpen(true) : undefined}
                        />
                    ) : (
                        <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto touch-pan-x">
                            <table className="w-full min-w-[600px] text-left text-sm whitespace-nowrap">
                                <thead className="border-b bg-muted/40 text-xs">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold text-muted-foreground">Nama Kelas</th>
                                        <th className="px-5 py-3 font-semibold text-muted-foreground">Tingkat</th>
                                        <th className="px-5 py-3 font-semibold text-muted-foreground">Wali Kelas</th>
                                        <th className="px-5 py-3 font-semibold text-muted-foreground">Siswa Aktif</th>
                                        <th className="px-5 py-3 text-right font-semibold text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredKelas.map((k) => (
                                        <tr key={k.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-5 py-3 font-medium text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <School className="size-4 text-muted-foreground" />
                                                    <span>{k.nama_kelas}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                                                    Tingkat {k.tingkat}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                {k.wali_kelas ? (
                                                    <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        {k.wali_kelas}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Users className="size-3" />
                                                    {k.total_murid ?? 0} siswa
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(k)}
                                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                                        title="Edit kelas"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(k.id, k.nama_kelas)}
                                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Hapus kelas"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
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
