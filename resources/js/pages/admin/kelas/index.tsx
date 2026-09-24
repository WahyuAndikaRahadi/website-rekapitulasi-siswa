import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { GraduationCap, Pencil, School, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface KelasItem {
    id: number;
    nama_kelas: string;
    tingkat: string;
    wali_kelas: string | null;
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
            onSuccess: () => createForm.reset(),
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/admin/kelas/${editItem!.id}`, {
            onSuccess: () => setEditItem(null),
        });
    };

    const handleDelete = (id: number, nama: string) => {
        if (!confirm(`Hapus kelas "${nama}"? Data murid dalam kelas ini harus dipindahkan terlebih dahulu.`)) return;
        router.delete(`/admin/kelas/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Kelas - SMKN 69 Jakarta" />
            <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto w-full max-w-full min-w-0">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Kelola Daftar Kelas
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Daftar kelas aktif di SMKN 69 Jakarta (SIJA 4 Tahun, Otomotif, Mekatronika).
                    </p>
                </div>

                {/* Form Tambah Kelas */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <h2 className="mb-4 text-sm font-semibold text-slate-800">Tambah Kelas Baru</h2>
                    <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1 w-32">
                            <label className="text-xs font-semibold text-slate-700">Tingkat</label>
                            <select
                                value={createForm.data.tingkat}
                                onChange={(e) => createForm.setData('tingkat', e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <option value="X">X</option>
                                <option value="XI">XI</option>
                                <option value="XII">XII</option>
                                <option value="XIII">XIII</option>
                            </select>
                            {createForm.errors.tingkat && <p className="text-xs text-rose-600">{createForm.errors.tingkat}</p>}
                        </div>
                        <div className="space-y-1 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-slate-700">Nama Kelas</label>
                            <input
                                type="text"
                                required
                                value={createForm.data.nama_kelas}
                                onChange={(e) => createForm.setData('nama_kelas', e.target.value)}
                                placeholder="Misal: X SIJA 1"
                                className="h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                            {createForm.errors.nama_kelas && <p className="text-xs text-rose-600">{createForm.errors.nama_kelas}</p>}
                        </div>
                        <Button
                            type="submit"
                            isLoading={createForm.processing}
                            loadingText="Menambahkan..."
                            className="h-9 rounded-lg text-xs font-semibold px-4 cursor-pointer"
                        >
                            + Tambah Kelas
                        </Button>
                    </form>
                </div>

                {/* Modal Edit Kelas */}
                {editItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                        <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
                            <div className="mb-4 flex items-center justify-between border-b pb-3">
                                <h2 className="text-base font-semibold text-slate-900">Edit Data Kelas</h2>
                                <button onClick={() => setEditItem(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                                    <X className="size-4" />
                                </button>
                            </div>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Tingkat</label>
                                    <select
                                        value={editForm.data.tingkat}
                                        onChange={(e) => editForm.setData('tingkat', e.target.value)}
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <option value="X">X</option>
                                        <option value="XI">XI</option>
                                        <option value="XII">XII</option>
                                        <option value="XIII">XIII</option>
                                    </select>
                                    {editForm.errors.tingkat && <p className="text-xs text-rose-600">{editForm.errors.tingkat}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Nama Kelas</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.nama_kelas}
                                        onChange={(e) => editForm.setData('nama_kelas', e.target.value)}
                                        className="h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                    {editForm.errors.nama_kelas && <p className="text-xs text-rose-600">{editForm.errors.nama_kelas}</p>}
                                </div>
                                <div className="flex gap-2.5 pt-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setEditItem(null)}
                                        className="flex-1 rounded-lg"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={editForm.processing}
                                        loadingText="Menyimpan..."
                                        className="flex-1 rounded-lg bg-primary text-primary-foreground"
                                    >
                                        Simpan
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tabel Kelas */}
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden w-full max-w-full">
                    <div className="flex items-center justify-between border-b px-5 py-3.5 bg-slate-50/75">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <School className="size-4 text-primary" />
                            <span>Total ({kelas_list.length} Kelas Terdaftar)</span>
                        </div>
                    </div>
                    {kelas_list.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="Belum ada kelas terdaftar"
                            description="Tambahkan kelas menggunakan form di atas."
                        />
                    ) : (
                        <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto touch-pan-x">
                            <table className="w-full min-w-[550px] text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b bg-slate-50/50 text-left">
                                        <th className="px-5 py-3 font-semibold text-slate-700">Nama Kelas</th>
                                        <th className="px-5 py-3 font-semibold text-slate-700">Tingkat</th>
                                        <th className="px-5 py-3 font-semibold text-slate-700">Wali Kelas</th>
                                        <th className="px-5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {kelas_list.map((k) => (
                                        <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-900">{k.nama_kelas}</td>
                                            <td className="px-5 py-3 text-slate-600">
                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                    Kelas {k.tingkat}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">{k.wali_kelas ?? '—'}</td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(k)}
                                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                                        title="Edit kelas"
                                                    >
                                                        <Pencil className="size-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(k.id, k.nama_kelas)}
                                                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
