import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle, FileSpreadsheet, Upload } from 'lucide-react';

interface PreviewRow {
    baris: number;
    nama: string;
    nis: string | null;
    nisn: string | null;
    status: 'valid' | 'error';
    errors: string[];
}

interface KelasItem { id: number; nama_kelas: string; }

interface Props {
    kelas_list: KelasItem[];
    preview: PreviewRow[] | null;
    errors_import: string[] | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Kelola Murid', href: '/admin/murid' },
    { title: 'Import Excel', href: '/admin/murid-import' },
];

export default function MuridImport({ kelas_list, preview, errors_import }: Props) {
    const uploadForm = useForm({ file: null as File | null, kelas_id: kelas_list[0]?.id.toString() ?? '' });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadForm.post('/admin/murid-import', { forceFormData: true });
    };

    const handleConfirm = () => {
        router.post('/admin/murid-import/confirm');
    };

    const validRows   = preview?.filter((r) => r.status === 'valid')  ?? [];
    const errorRows   = preview?.filter((r) => r.status === 'error')  ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Murid" />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div>
                    <h1 className="text-xl font-semibold">Import Murid dari Excel</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Unggah data murid baru ke dalam kelas yang dipilih.</p>
                </div>

                {/* Petunjuk format */}
                <div className="rounded-lg border bg-white p-5">
                    <div className="flex items-start gap-3">
                        <FileSpreadsheet className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                        <div className="text-sm">
                            <p className="font-medium">Format File Excel</p>
                            <p className="text-muted-foreground mt-1">Kolom yang dikenali: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NAMA</code> (wajib), <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NIS</code> (opsional), <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NISN</code> (opsional)</p>
                            <p className="text-muted-foreground mt-0.5">Baris pertama harus berisi nama kolom. Format file: .xlsx, .xls, .csv (maks. 5 MB).</p>
                        </div>
                    </div>
                </div>

                {/* Form upload */}
                {!preview && (
                    <div className="rounded-lg border bg-white p-5">
                        <h2 className="mb-4 text-sm font-medium">Upload File</h2>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Kelas Tujuan <span className="text-red-500">*</span></label>
                                <select value={uploadForm.data.kelas_id}
                                    onChange={(e) => uploadForm.setData('kelas_id', e.target.value)}
                                    className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <option value="">Pilih kelas</option>
                                    {kelas_list.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                                </select>
                                {uploadForm.errors.kelas_id && <p className="text-xs text-red-600">{uploadForm.errors.kelas_id}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">File Excel <span className="text-red-500">*</span></label>
                                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30">
                                    <Upload className="size-4" />
                                    <span>{uploadForm.data.file ? uploadForm.data.file.name : 'Pilih file .xlsx, .xls, atau .csv'}</span>
                                    <input type="file" accept=".xlsx,.xls,.csv"
                                        onChange={(e) => uploadForm.setData('file', e.target.files?.[0] ?? null)}
                                        className="sr-only" />
                                </label>
                                {uploadForm.errors.file && <p className="text-xs text-red-600">{uploadForm.errors.file}</p>}
                            </div>

                            <Button
                                type="submit"
                                isLoading={uploadForm.processing}
                                disabled={!uploadForm.data.file}
                                loadingText="Mengunggah & Memvalidasi..."
                            >
                                <Upload className="size-4" />
                                Upload & Validasi
                            </Button>
                        </form>
                    </div>
                )}

                {/* Preview hasil validasi */}
                {preview && preview.length > 0 && (
                    <div className="space-y-4">
                        {/* Ringkasan */}
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
                                <CheckCircle className="size-4" />
                                <span><strong>{validRows.length}</strong> baris valid</span>
                            </div>
                            {errorRows.length > 0 && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
                                    <AlertCircle className="size-4" />
                                    <span><strong>{errorRows.length}</strong> baris error (akan dilewati)</span>
                                </div>
                            )}
                        </div>

                        {/* Error detail */}
                        {errors_import && errors_import.length > 0 && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="mb-2 text-sm font-medium text-red-800">Detail Error:</p>
                                <ul className="space-y-0.5">
                                    {errors_import.map((e, i) => (
                                        <li key={i} className="text-xs text-red-700">• {e}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tabel preview */}
                        <div className="rounded-lg border bg-white">
                            <div className="border-b px-5 py-3">
                                <h2 className="text-sm font-medium">Preview Data ({preview.length} baris)</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30 text-left">
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Baris</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Nama</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">NIS</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">NISN</th>
                                            <th className="px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {preview.map((row) => (
                                            <tr key={row.baris} className={row.status === 'error' ? 'bg-red-50' : 'hover:bg-muted/20'}>
                                                <td className="px-4 py-2.5 text-muted-foreground">{row.baris}</td>
                                                <td className="px-4 py-2.5 font-medium">{row.nama || <span className="italic text-muted-foreground">kosong</span>}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{row.nis ?? '—'}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{row.nisn ?? '—'}</td>
                                                <td className="px-4 py-2.5">
                                                    {row.status === 'valid' ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle className="size-3" /> Valid</span>
                                                    ) : (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 text-xs text-red-700"><AlertCircle className="size-3" /> Error</span>
                                                            {row.errors.map((err, i) => (
                                                                <p key={i} className="mt-0.5 text-xs text-red-600">{err}</p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tombol konfirmasi */}
                        {validRows.length > 0 && (
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleConfirm}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    <CheckCircle className="size-4" />
                                    Konfirmasi Import {validRows.length} Murid
                                </Button>
                                <Link href="/admin/murid-import">
                                    <Button variant="secondary" type="button">
                                        Upload Ulang
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {validRows.length === 0 && (
                            <div className="flex gap-3">
                                <Link href="/admin/murid-import">
                                    <Button variant="secondary" type="button">
                                        Upload Ulang
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
