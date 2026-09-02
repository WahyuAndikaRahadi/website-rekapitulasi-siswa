import { EmptyState } from '@/components/empty-state';
import { StatusBadge } from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';

interface JenisItem {
    id: number;
    kode: string;
    keterangan: string;
    kategori: string;
    tingkat_keparahan: string | null;
    poin: number;
    is_active: boolean;
}

interface Props {
    jenis_pelanggarans: JenisItem[];
    tahun_ajaran: { id: number; label: string } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Master Data Jenis', href: '/admin/master/jenis-pelanggaran' },
];

export default function JenisPelanggaranIndex({ jenis_pelanggarans, tahun_ajaran }: Props) {
    const handleDelete = (id: number, keterangan: string) => {
        if (!confirm(`Hapus "${keterangan}"? Tindakan ini tidak bisa dibatalkan.`)) return;
        router.delete(`/admin/master/jenis-pelanggaran/${id}`);
    };

    const pelanggaran = jenis_pelanggarans.filter((j) => j.kategori === 'pelanggaran');
    const kebaikan    = jenis_pelanggarans.filter((j) => j.kategori === 'kebaikan');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Data Jenis" />
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Master Data Jenis Pelanggaran & Kebaikan</h1>
                        {tahun_ajaran && (
                            <p className="text-muted-foreground mt-1 text-sm">Tahun Ajaran {tahun_ajaran.label}</p>
                        )}
                    </div>
                    <Link
                        href="/admin/master/jenis-pelanggaran/create"
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        + Tambah Jenis
                    </Link>
                </div>

                {jenis_pelanggarans.length === 0 ? (
                    <div className="rounded-lg border bg-white">
                        <EmptyState
                            icon={BookOpen}
                            title="Belum ada jenis pelanggaran/kebaikan"
                            description="Tambahkan jenis untuk mulai menerima laporan."
                            action={<Link href="/admin/master/jenis-pelanggaran/create" className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">+ Tambah Jenis</Link>}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Pelanggaran */}
                        <div className="rounded-lg border bg-white">
                            <div className="flex items-center justify-between border-b px-5 py-3">
                                <h2 className="text-sm font-medium">Pelanggaran ({pelanggaran.length})</h2>
                            </div>
                            {pelanggaran.length === 0 ? (
                                <p className="p-5 text-sm text-muted-foreground">Belum ada data pelanggaran.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30 text-left">
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Kode</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Keterangan</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Tingkat</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Poin</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-2.5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {pelanggaran.map((j) => (
                                            <tr key={j.id} className={`hover:bg-muted/20 ${!j.is_active ? 'opacity-50' : ''}`}>
                                                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{j.kode}</td>
                                                <td className="px-4 py-2.5">{j.keterangan}</td>
                                                <td className="px-4 py-2.5">
                                                    {j.tingkat_keparahan ? <StatusBadge status={j.tingkat_keparahan} /> : '—'}
                                                </td>
                                                <td className="px-4 py-2.5 font-medium text-red-600">−{j.poin}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`text-xs ${j.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        {j.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex gap-1">
                                                        <Link href={`/admin/master/jenis-pelanggaran/${j.id}/edit`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-3.5" /></Link>
                                                        <button onClick={() => handleDelete(j.id, j.keterangan)} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Kebaikan */}
                        <div className="rounded-lg border bg-white">
                            <div className="flex items-center justify-between border-b px-5 py-3">
                                <h2 className="text-sm font-medium">Kebaikan ({kebaikan.length})</h2>
                            </div>
                            {kebaikan.length === 0 ? (
                                <p className="p-5 text-sm text-muted-foreground">Belum ada data kebaikan.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30 text-left">
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Kode</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Keterangan</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Poin</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-2.5"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {kebaikan.map((j) => (
                                            <tr key={j.id} className={`hover:bg-muted/20 ${!j.is_active ? 'opacity-50' : ''}`}>
                                                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{j.kode}</td>
                                                <td className="px-4 py-2.5">{j.keterangan}</td>
                                                <td className="px-4 py-2.5 font-medium text-green-600">+{j.poin}</td>
                                                <td className="px-4 py-2.5">
                                                    <span className={`text-xs ${j.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        {j.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex gap-1">
                                                        <Link href={`/admin/master/jenis-pelanggaran/${j.id}/edit`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-3.5" /></Link>
                                                        <button onClick={() => handleDelete(j.id, j.keterangan)} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
