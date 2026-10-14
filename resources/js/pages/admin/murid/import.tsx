import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle, Download, FileSpreadsheet, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface PreviewRow {
    baris: number;
    nama: string;
    nis: string | null;
    nisn: string | null;
    no_telp?: string | null;
    no_ortu?: string | null;
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
    const [clientFileError, setClientFileError] = useState<string | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const uploadForm = useForm({
        file: null as File | null,
        kelas_id: kelas_list[0]?.id.toString() ?? '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClientFileError(null);
        const file = e.target.files?.[0] ?? null;
        if (!file) {
            uploadForm.setData('file', null);
            return;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        const allowedExts = ['xlsx', 'xls', 'csv'];
        if (!ext || !allowedExts.includes(ext)) {
            setClientFileError(`Format file "${file.name}" tidak didukung. Hanya file .xlsx, .xls, atau .csv yang diizinkan.`);
            e.target.value = '';
            uploadForm.setData('file', null);
            return;
        }

        const MAX_SIZE_MB = 5;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setClientFileError(`Ukuran file "${file.name}" terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Batas maksimal adalah ${MAX_SIZE_MB} MB.`);
            e.target.value = '';
            uploadForm.setData('file', null);
            return;
        }

        uploadForm.setData('file', file);
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadForm.processing || clientFileError || !uploadForm.data.file) return;
        uploadForm.post('/admin/murid-import', { forceFormData: true });
    };

    const handleConfirm = () => {
        if (isConfirming || isCancelling) return;
        setIsConfirming(true);
        router.post('/admin/murid-import/confirm', {}, {
            onFinish: () => setIsConfirming(false),
        });
    };

    const handleCancel = () => {
        if (isConfirming || isCancelling) return;
        setIsCancelling(true);
        router.post('/admin/murid-import/cancel', {}, {
            onFinish: () => setIsCancelling(false),
        });
    };

    const validRows = preview?.filter((r) => r.status === 'valid') ?? [];
    const errorRows = preview?.filter((r) => r.status === 'error') ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Murid dari Excel - SMKN 69 Jakarta" />
            <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/murid"
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="size-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Import Murid dari Excel
                            </h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Unggah file spreadsheet Excel untuk menambahkan siswa baru ke kelas yang dipilih.
                            </p>
                        </div>
                    </div>

                    {/* Tombol Download Template Excel */}
                    <a
                        href="/template-siswa.xlsx"
                        download="template-siswa.xlsx"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer self-start sm:self-auto"
                    >
                        <Download className="size-4" />
                        <span>Download Template Excel</span>
                    </a>
                </div>

                {/* Petunjuk Format Template */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                    <div className="flex items-start gap-3.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E5FA8] border border-blue-100">
                            <FileSpreadsheet className="size-5" />
                        </div>
                        <div className="space-y-1.5 text-xs">
                            <h2 className="text-sm font-bold text-slate-900">Petunjuk Pengisian Template Excel</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Kolom yang tersedia pada template:
                                <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 border">NAMA</code> (wajib),
                                <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 border">NIS</code> (opsional),
                                <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 border">NISN</code> (opsional),
                                <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 border">NO_TELP</code> (opsional),
                                <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-800 border">NO_ORTU</code> (opsional).
                            </p>
                            <p className="text-emerald-700 font-medium">
                                ✓ Jumlah siswa per kelas fleksibel (misal 32, 34, atau 36 siswa). Baris kosong sisa template akan otomatis diabaikan oleh sistem.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Upload */}
                {!preview && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                        <h2 className="mb-4 text-sm font-bold text-slate-900">Form Upload Data</h2>
                        <form onSubmit={handleUpload} className="space-y-5">
                            {(Object.keys(uploadForm.errors).length > 0 || clientFileError) && (
                                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
                                    <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="font-bold">Terjadi kesalahan validasi file import:</p>
                                        <ul className="list-inside list-disc space-y-0.5">
                                            {clientFileError && <li>{clientFileError}</li>}
                                            {Object.entries(uploadForm.errors).map(([field, msg]) => (
                                                <li key={field}>{msg}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5 max-w-md">
                                <label className="text-xs font-semibold text-slate-700">
                                    Pilih Kelas Tujuan <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={uploadForm.data.kelas_id}
                                    onChange={(e) => uploadForm.setData('kelas_id', e.target.value)}
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Pilih kelas</option>
                                    {kelas_list.map((k) => (
                                        <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                    ))}
                                </select>
                                {uploadForm.errors.kelas_id && (
                                    <p className="text-xs text-rose-600">{uploadForm.errors.kelas_id}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">
                                    Pilih File Excel (.xlsx, .xls, .csv) <span className="text-rose-500">*</span>
                                </label>
                                <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-primary hover:bg-slate-50/60 transition-all cursor-pointer">
                                    <Upload className="size-8 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {uploadForm.data.file ? uploadForm.data.file.name : 'Klik untuk memilih file Excel dari komputer'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Format: .xlsx, .xls, .csv (maksimal 5 MB)
                                    </span>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                    />
                                </label>
                                {clientFileError && (
                                    <p className="text-xs text-rose-600 font-semibold">{clientFileError}</p>
                                )}
                                {uploadForm.errors.file && (
                                    <p className="text-xs text-rose-600 font-semibold">{uploadForm.errors.file}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                isLoading={uploadForm.processing}
                                disabled={!uploadForm.data.file || !uploadForm.data.kelas_id || !!clientFileError || uploadForm.processing}
                                loadingText="Mengunggah &amp; Memvalidasi Data..."
                                className="h-10 rounded-xl px-5 text-xs font-semibold cursor-pointer"
                            >
                                <Upload className="size-4 mr-2" />
                                Upload &amp; Pratinjau Validasi
                            </Button>
                        </form>
                    </div>
                )}

                {/* Preview Hasil Validasi */}
                {preview && (
                    <div className="space-y-5">
                        {/* Ringkasan Status */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
                                <CheckCircle className="size-4 text-emerald-600" />
                                <span><strong>{validRows.length}</strong> baris data murid valid</span>
                            </div>
                            {errorRows.length > 0 && (
                                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 shadow-2xs">
                                    <AlertCircle className="size-4 text-rose-600" />
                                    <span><strong>{errorRows.length}</strong> baris error (akan dilewati)</span>
                                </div>
                            )}
                        </div>

                        {/* Detail Pesan Error jika ada */}
                        {errors_import && errors_import.length > 0 && (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 space-y-2">
                                <p className="text-xs font-bold text-rose-900">Detail Baris Bermasalah:</p>
                                <ul className="space-y-1 text-xs text-rose-700 list-disc list-inside">
                                    {errors_import.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tabel Preview */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden w-full max-w-full">
                            <div className="border-b px-5 py-3.5 bg-slate-50/75">
                                <h2 className="text-sm font-bold text-slate-800">
                                    Pratinjau Data Siswa ({preview.length} Baris Terdeteksi)
                                </h2>
                            </div>
                            <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto">
                                <table className="w-full min-w-[750px] text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b bg-slate-50/50 text-left text-xs font-semibold text-slate-700">
                                            <th className="px-4 py-3 w-16">Baris</th>
                                            <th className="px-4 py-3">Nama Lengkap</th>
                                            <th className="px-4 py-3">NIS</th>
                                            <th className="px-4 py-3">NISN</th>
                                            <th className="px-4 py-3">No. Telp Siswa</th>
                                            <th className="px-4 py-3">No. Telp Orang Tua</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {preview.map((row) => (
                                            <tr key={row.baris} className={row.status === 'error' ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}>
                                                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{row.baris}</td>
                                                <td className="px-4 py-2.5 font-medium text-slate-900">
                                                    {row.nama || <span className="italic text-slate-400">Kosong</span>}
                                                </td>
                                                <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{row.nis ?? '—'}</td>
                                                <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{row.nisn ?? '—'}</td>
                                                <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{row.no_telp ?? '—'}</td>
                                                <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{row.no_ortu ?? '—'}</td>
                                                <td className="px-4 py-2.5 text-center">
                                                    {row.status === 'valid' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                                            <CheckCircle className="size-3" /> Valid
                                                        </span>
                                                    ) : (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                                                                <AlertCircle className="size-3" /> Error
                                                            </span>
                                                            {row.errors.map((err, i) => (
                                                                <p key={i} className="mt-0.5 text-[11px] text-rose-600">{err}</p>
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

                        {/* Tombol Konfirmasi Import */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            {validRows.length > 0 && (
                                <Button
                                    onClick={handleConfirm}
                                    isLoading={isConfirming}
                                    loadingText="Menyimpan Data Murid..."
                                    disabled={isConfirming || isCancelling}
                                    className="h-10 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                    <CheckCircle className="size-4 mr-2" />
                                    Konfirmasi &amp; Simpan {validRows.length} Data Murid
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                type="button"
                                disabled={isConfirming || isCancelling}
                                onClick={handleCancel}
                                className="h-10 rounded-xl px-4 text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                                {isCancelling ? 'Membatalkan...' : 'Upload Ulang File Lain'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
