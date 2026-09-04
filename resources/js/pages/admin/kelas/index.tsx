import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { GraduationCap, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface KelasItem {
    id: number;
    nama_kelas: string;
    tingkat: string;
    tahun_ajaran: string;
    wali_kelas: string | null;
}

interface TahunAjaranItem { id: number; label: string; }

interface Props {
    kelas_list: KelasItem[];
    tahun_ajarans: TahunAjaranItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Kelola Kelas', href: '/admin/kelas' },
];

export default function KelasIndex({ kelas_list, tahun_ajarans }: Props) {
    const [editItem, setEditItem] = useState<KelasItem | null>(null);

    const createForm = useForm({ nama_kelas: '', tingkat: '', tahun_ajaran_id: tahun_ajarans[0]?.id.toString() ?? '' });
    const editForm   = useForm({ nama_kelas: '', tingkat: '' });

    const openEdit = (k: KelasItem) => {
        setEditItem(k);
        editForm.setData({ nama_kelas: k.nama_kelas, tingkat: k.tingkat });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/kelas', { onSuccess: () => createForm.reset() });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/admin/kelas/${editItem!.id}`, { onSuccess: () => setEditItem(null) });
    };

    const handleDelete = (id: number, nama: string) => {
        if (!confirm(`Hapus kelas "${nama}"? Murid dalam kelas ini tidak bisa dihapus.`)) return;
        router.delete(`/admin/kelas/${id}`);
    };

    const grouped = kelas_list.reduce<Record<string, KelasItem[]>>((acc, k) => {
        const key = k.tahun_ajaran;
        acc[key] = [...(acc[key] ?? []), k];
        return acc;
    }, {});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Kelas" />
            <div className="space-y-6 p-6">
                <h1 className="text-xl font-semibold">Kelola Kelas</h1>

                {/* Form tambah */}
                <div className="rounded-lg border bg-white p-5">
                    <h2 className="mb-4 text-sm font-medium">Tambah Kelas Baru</h2>
                    <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Tahun Ajaran</label>
                            <select value={createForm.data.tahun_ajaran_id}
                                onChange={(e) => createForm.setData('tahun_ajaran_id', e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                {tahun_ajarans.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Tingkat</label>
                            <select value={createForm.data.tingkat}
                                onChange={(e) => createForm.setData('tingkat', e.target.value)}
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="">Pilih</option>
                                <option value="X">X</option>
                                <option value="XI">XI</option>
                                <option value="XII">XII</option>
                            </select>
                            {createForm.errors.tingkat && <p className="text-xs text-red-600">{createForm.errors.tingkat}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Nama Kelas</label>
                            <input type="text" value={createForm.data.nama_kelas}
                                onChange={(e) => createForm.setData('nama_kelas', e.target.value)}
                                placeholder="cth: X TO 1"
                                className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                            {createForm.errors.nama_kelas && <p className="text-xs text-red-600">{createForm.errors.nama_kelas}</p>}
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            isLoading={createForm.processing}
                            loadingText="Menambahkan..."
                        >
                            Tambah
                        </Button>
                    </form>
                </div>

                {/* Edit modal */}
                {editItem && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-lg">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-medium">Edit Kelas</h2>
                                <button onClick={() => setEditItem(null)}><X className="size-4 text-muted-foreground" /></button>
                            </div>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Tingkat</label>
                                    <select value={editForm.data.tingkat} onChange={(e) => editForm.setData('tingkat', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                        <option value="X">X</option>
                                        <option value="XI">XI</option>
                                        <option value="XII">XII</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Nama Kelas</label>
                                    <input type="text" value={editForm.data.nama_kelas}
                                        onChange={(e) => editForm.setData('nama_kelas', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                    {editForm.errors.nama_kelas && <p className="text-xs text-red-600">{editForm.errors.nama_kelas}</p>}
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        isLoading={editForm.processing}
                                        loadingText="Menyimpan..."
                                        className="flex-1"
                                    >
                                        Simpan
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setEditItem(null)}
                                        className="flex-1"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tabel per tahun ajaran */}
                {Object.keys(grouped).length === 0 ? (
                    <div className="rounded-lg border bg-white">
                        <EmptyState icon={GraduationCap} title="Belum ada kelas" description="Tambahkan kelas menggunakan form di atas." />
                    </div>
                ) : (
                    Object.entries(grouped).map(([tahun, items]) => (
                        <div key={tahun} className="rounded-lg border bg-white">
                            <div className="border-b px-5 py-3">
                                <h2 className="text-sm font-medium">Tahun Ajaran {tahun} ({items.length} kelas)</h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left">
                                        <th className="px-4 py-2.5 font-medium text-muted-foreground">Nama Kelas</th>
                                        <th className="px-4 py-2.5 font-medium text-muted-foreground">Tingkat</th>
                                        <th className="px-4 py-2.5 font-medium text-muted-foreground">Wali Kelas</th>
                                        <th className="px-4 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((k) => (
                                        <tr key={k.id} className="hover:bg-muted/20">
                                            <td className="px-4 py-2.5 font-medium">{k.nama_kelas}</td>
                                            <td className="px-4 py-2.5 text-muted-foreground">{k.tingkat}</td>
                                            <td className="px-4 py-2.5 text-muted-foreground">{k.wali_kelas ?? '—'}</td>
                                            <td className="px-4 py-2.5">
                                                <div className="flex gap-1">
                                                    <button onClick={() => openEdit(k)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-3.5" /></button>
                                                    <button onClick={() => handleDelete(k.id, k.nama_kelas)} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
