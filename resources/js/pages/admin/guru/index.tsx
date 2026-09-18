import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';

interface GuruItem {
    id: number;
    nama: string;
    nip: string | null;
    no_telp: string | null;
    email: string;
    wali_kelas: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Kelola Guru', href: '/admin/guru' },
];

export default function GuruIndex({ gurus }: { gurus: GuruItem[] }) {
    const handleDelete = (id: number, nama: string) => {
        if (confirm(`Yakin ingin menghapus data guru "${nama}"?`)) {
            router.delete(`/admin/guru/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Guru" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground">Kelola Guru</h1>
                        <p className="text-sm text-muted-foreground">Daftar semua akun guru dan wali kelas</p>
                    </div>
                    <Link
                        href="/admin/guru/create"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="size-4" />
                        Tambah Guru
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                    {gurus.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="Belum ada data guru"
                            description="Tambahkan akun guru untuk mulai memberikan akses pencatatan rekap siswa."
                            actionLabel="Tambah Guru Sekarang"
                            onAction={() => router.visit('/admin/guru/create')}
                        />
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/40 text-xs">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Nama Guru</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">NIP</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">No. Telepon</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Wali Kelas</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {gurus.map((g) => (
                                    <tr key={g.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3 font-medium">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={g.nama} size="xs" />
                                                <span>{g.nama}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.nip ?? '—'}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold">{g.no_telp ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{g.email}</td>
                                        <td className="px-4 py-3">
                                            {g.wali_kelas ? (
                                                <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                    {g.wali_kelas}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <Link href={`/admin/guru/${g.id}/edit`}
                                                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                                                    <Pencil className="size-3.5" />
                                                </Link>
                                                <Link href={`/admin/guru/${g.id}/mapping-kelas`}
                                                    className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                                                    Mapping Kelas
                                                </Link>
                                                <button onClick={() => handleDelete(g.id, g.nama)}
                                                    className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
