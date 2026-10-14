import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CalendarDays, CheckCircle, Trash2 } from 'lucide-react';

interface TahunAjaranItem { id: number; label: string; is_active: boolean; }
interface Props { tahun_ajarans: TahunAjaranItem[]; }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Tahun Ajaran', href: '/admin/tahun-ajaran' },
];

export default function TahunAjaranIndex({ tahun_ajarans }: Props) {
    const form = useForm({ label: '' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/admin/tahun-ajaran', { onSuccess: () => form.reset() });
    };

    const handleAktifkan = (id: number) => {
        router.patch(`/admin/tahun-ajaran/${id}/aktifkan`);
    };

    const handleDelete = (id: number, label: string) => {
        if (!confirm(`Hapus tahun ajaran "${label}"?`)) return;
        router.delete(`/admin/tahun-ajaran/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tahun Ajaran" />
            <div className="space-y-6 p-6">
                <h1 className="text-xl font-semibold">Kelola Tahun Ajaran</h1>

                {/* Form tambah */}
                <div className="rounded-lg border bg-white p-5">
                    <h2 className="mb-4 text-sm font-medium">Tambah Tahun Ajaran</h2>
                    <form onSubmit={handleCreate} className="flex items-end gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Label (format: YYYY-YYYY)</label>
                            <input type="text" required pattern="[0-9]{4}-[0-9]{4}" value={form.data.label}
                                onChange={(e) => form.setData('label', e.target.value)}
                                placeholder="2027-2028"
                                className="h-9 w-40 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                            {form.errors.label && <p className="text-xs text-red-600">{form.errors.label}</p>}
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            isLoading={form.processing}
                            loadingText="Menambahkan..."
                        >
                            Tambah
                        </Button>
                    </form>
                </div>

                {/* Daftar */}
                <div className="rounded-lg border bg-white overflow-hidden w-full max-w-full">
                    {tahun_ajarans.length === 0 ? (
                        <EmptyState icon={CalendarDays} title="Belum ada tahun ajaran" />
                    ) : (
                        <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto">
                            <table className="w-full min-w-[500px] text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left">
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Tahun Ajaran</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {tahun_ajarans.map((t) => (
                                        <tr key={t.id} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium">{t.label}</td>
                                            <td className="px-4 py-3">
                                                {t.is_active ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                                        <CheckCircle className="size-3" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Tidak aktif</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    {!t.is_active && (
                                                        <button onClick={() => handleAktifkan(t.id)}
                                                            className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10">
                                                            Jadikan Aktif
                                                        </button>
                                                    )}
                                                    {!t.is_active && (
                                                        <button onClick={() => handleDelete(t.id, t.label)}
                                                            className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    )}
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
