import { EmptyState } from '@/components/empty-state';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Trash2, Users } from 'lucide-react';

interface GuruItem {
    id: number;
    nama: string;
    nip: string | null;
    email: string;
    wali_kelas: string | null;
}

interface Props { gurus: GuruItem[]; }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Kelola Guru', href: '/admin/guru' },
];

export default function GuruIndex({ gurus }: Props) {
    const handleDelete = (id: number, nama: string) => {
        if (!confirm(`Hapus akun guru "${nama}"? Semua laporan yang dibuat guru ini tetap tersimpan.`)) return;
        router.delete(`/admin/guru/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Guru" />
            <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Kelola Guru</h1>
                    <Link href="/admin/guru/create"
                        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        + Tambah Guru
                    </Link>
                </div>

                <div className="rounded-lg border bg-white">
                    {gurus.length === 0 ? (
                        <EmptyState icon={Users} title="Belum ada akun guru"
                            action={<Link href="/admin/guru/create" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">+ Tambah Guru</Link>}
                        />
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/40 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Nama</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">NIP</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Wali Kelas</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {gurus.map((g) => (
                                    <tr key={g.id} className="hover:bg-muted/20">
                                        <td className="px-4 py-3 font-medium">{g.nama}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.nip ?? '—'}</td>
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
