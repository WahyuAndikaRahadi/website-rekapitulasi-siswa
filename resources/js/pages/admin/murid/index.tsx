import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { GraduationCap, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface MuridItem { id: number; nama: string; nis: string | null; nisn: string | null; nama_kelas: string; kelas_id: number; }
interface KelasItem { id: number; nama_kelas: string; }
interface TahunAjaranItem { id: number; label: string; }

interface Props {
    murids: {
        data: MuridItem[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number; to: number; total: number;
    };
    filters: Record<string, string>;
    kelas_list: KelasItem[];
    tahun_ajarans: TahunAjaranItem[];
    tahun_ajaran_aktif: { id: number; label: string } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Kelola Murid', href: '/admin/murid' },
];

export default function MuridIndex({ murids, filters, kelas_list, tahun_ajarans, tahun_ajaran_aktif }: Props) {
    const [q, setQ]             = useState(filters.q ?? '');
    const [kelasId, setKelasId] = useState(filters.kelas_id ?? '');
    const [editItem, setEditItem] = useState<MuridItem | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const applyFilter = () => router.get('/admin/murid', { q, kelas_id: kelasId }, { preserveState: true, replace: true });
    const resetFilter = () => { setQ(''); setKelasId(''); router.get('/admin/murid', {}, { replace: true }); };

    const createForm = useForm({ nama: '', nis: '', nisn: '', kelas_id: kelas_list[0]?.id.toString() ?? '' });
    const editForm   = useForm({ nama: '', nis: '', nisn: '', kelas_id: '' });

    const openEdit = (m: MuridItem) => {
        setEditItem(m);
        editForm.setData({ nama: m.nama, nis: m.nis ?? '', nisn: m.nisn ?? '', kelas_id: m.kelas_id.toString() });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/murid', { onSuccess: () => { createForm.reset(); setShowCreate(false); } });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/admin/murid/${editItem!.id}`, { onSuccess: () => setEditItem(null) });
    };

    const handleDelete = (id: number, nama: string) => {
        if (!confirm(`Hapus murid "${nama}"?`)) return;
        router.delete(`/admin/murid/${id}`);
    };

    const MuridModal = ({ title, form, onSubmit, onClose }: { title: string; form: typeof createForm; onSubmit: (e: React.FormEvent) => void; onClose: () => void }) => (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-medium">{title}</h2>
                    <button onClick={onClose}><X className="size-4 text-muted-foreground" /></button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    {[
                        { key: 'nama', label: 'Nama Lengkap', required: true, placeholder: 'Nama murid' },
                        { key: 'nis', label: 'NIS', required: false, placeholder: 'Opsional' },
                        { key: 'nisn', label: 'NISN', required: false, placeholder: 'Opsional' },
                    ].map((f) => (
                        <div key={f.key} className="space-y-1.5">
                            <label className="text-sm font-medium">{f.label} {f.required && <span className="text-red-500">*</span>}</label>
                            <input type="text" value={(form.data as any)[f.key]}
                                onChange={(e) => form.setData(f.key as any, e.target.value)}
                                placeholder={f.placeholder}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                            {(form.errors as any)[f.key] && <p className="text-xs text-red-600">{(form.errors as any)[f.key]}</p>}
                        </div>
                    ))}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Kelas <span className="text-red-500">*</span></label>
                        <select value={(form.data as any).kelas_id} onChange={(e) => form.setData('kelas_id' as any, e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option value="">Pilih kelas</option>
                            {kelas_list.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                        </select>
                        {form.errors.kelas_id && <p className="text-xs text-red-600">{form.errors.kelas_id}</p>}
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="submit" disabled={form.processing}
                            className="h-9 flex-1 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            Simpan
                        </button>
                        <button type="button" onClick={onClose} className="h-9 flex-1 rounded-md border text-sm hover:bg-muted">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Murid" />
            <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Kelola Murid</h1>
                        {tahun_ajaran_aktif && <p className="text-muted-foreground mt-0.5 text-sm">TA {tahun_ajaran_aktif.label}</p>}
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/murid-import"
                            className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium hover:bg-muted">
                            Import Excel
                        </Link>
                        <button onClick={() => setShowCreate(true)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            + Tambah Murid
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Cari nama / NIS</label>
                        <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                            placeholder="Ketik nama atau NIS..."
                            className="h-9 w-56 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Kelas</label>
                        <select value={kelasId} onChange={(e) => setKelasId(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option value="">Semua Kelas</option>
                            {kelas_list.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                        </select>
                    </div>
                    <button onClick={applyFilter} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Cari</button>
                    <button onClick={resetFilter} className="h-9 rounded-md border px-3 text-sm hover:bg-muted">Reset</button>
                </div>

                {/* Tabel */}
                <div className="rounded-lg border bg-white">
                    {murids.data.length === 0 ? (
                        <EmptyState icon={GraduationCap} title="Tidak ada murid ditemukan" description="Coba ubah filter atau tambah murid baru." />
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40 text-left">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Nama</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">NIS / NISN</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Kelas</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {murids.data.map((m) => (
                                            <tr key={m.id} className="hover:bg-muted/20">
                                                <td className="px-4 py-3 font-medium">{m.nama}</td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {m.nis ? <span>{m.nis}</span> : <span className="italic">—</span>}
                                                    {m.nisn && <span className="ml-2 text-xs">/ {m.nisn}</span>}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{m.nama_kelas}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <button onClick={() => openEdit(m)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-3.5" /></button>
                                                        <button onClick={() => handleDelete(m.id, m.nama)} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4">
                                <Pagination links={murids.links} from={murids.from} to={murids.to} total={murids.total} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showCreate && (
                <MuridModal title="Tambah Murid" form={createForm} onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
            )}
            {editItem && (
                <MuridModal title="Edit Murid" form={editForm as any} onSubmit={handleEdit} onClose={() => setEditItem(null)} />
            )}
        </AppLayout>
    );
}
