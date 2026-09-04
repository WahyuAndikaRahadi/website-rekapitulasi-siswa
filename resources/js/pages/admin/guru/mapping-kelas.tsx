import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface KelasItem { id: number; nama_kelas: string; }
interface KelasAmpu { kelas_id: number; mapel: string; }

interface Props {
    guru: { id: number; nama: string };
    kelas_list: KelasItem[];
    kelas_diampu: KelasAmpu[];
}

export default function MappingKelas({ guru, kelas_list, kelas_diampu }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Kelola Guru', href: '/admin/guru' },
        { title: `Mapping Kelas — ${guru.nama}`, href: '#' },
    ];

    const [rows, setRows] = useState<KelasAmpu[]>(
        kelas_diampu.length > 0 ? kelas_diampu : []
    );

    const { post, processing } = useForm({});

    const addRow = () => {
        const firstAvailable = kelas_list.find(
            (k) => !rows.some((r) => r.kelas_id === k.id)
        );
        if (firstAvailable) {
            setRows([...rows, { kelas_id: firstAvailable.id, mapel: '' }]);
        }
    };

    const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

    const updateRow = (idx: number, field: keyof KelasAmpu, value: string | number) => {
        setRows(rows.map((r, i) => i === idx ? { ...r, [field]: field === 'kelas_id' ? Number(value) : value } : r));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Post dengan data rows sebagai form data
        const formData = new FormData();
        rows.forEach((row, i) => {
            formData.append(`kelas[${i}][kelas_id]`, String(row.kelas_id));
            formData.append(`kelas[${i}][mapel]`, row.mapel);
        });
        post(`/admin/guru/${guru.id}/mapping-kelas`, {
            data: { kelas: rows } as any,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Mapping Kelas — ${guru.nama}`} />
            <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">Mapping Kelas</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Kelas yang diampu oleh <span className="font-medium text-foreground">{guru.nama}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-lg border bg-white">
                        {rows.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                Belum ada kelas yang di-assign. Klik tombol di bawah untuk menambah.
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left">
                                        <th className="px-4 py-2.5 font-medium text-muted-foreground">Kelas</th>
                                        <th className="px-4 py-2.5 font-medium text-muted-foreground">Mata Pelajaran (opsional)</th>
                                        <th className="px-4 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {rows.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-2">
                                                <select
                                                    value={row.kelas_id}
                                                    onChange={(e) => updateRow(idx, 'kelas_id', Number(e.target.value))}
                                                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                >
                                                    {kelas_list.map((k) => (
                                                        <option key={k.id} value={k.id}
                                                            disabled={rows.some((r, i) => i !== idx && r.kelas_id === k.id)}>
                                                            {k.nama_kelas}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={row.mapel}
                                                    onChange={(e) => updateRow(idx, 'mapel', e.target.value)}
                                                    placeholder="cth: Matematika"
                                                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <button type="button" onClick={() => removeRow(idx)}
                                                    className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600">
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {rows.length < kelas_list.length && (
                        <button type="button" onClick={addRow}
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                            <Plus className="size-4" /> Tambah kelas
                        </button>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            isLoading={processing}
                            loadingText="Menyimpan..."
                        >
                            Simpan Mapping
                        </Button>
                        <Link href="/admin/guru">
                            <Button variant="secondary" type="button">
                                Batal
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
