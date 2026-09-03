import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2, Upload, UserCheck, X } from 'lucide-react';
import React, { useState } from 'react';

interface BuktiItem {
    id: number;
    nama_asli: string;
    url: string;
}

interface LaporanData {
    id: number;
    murid_id: number;
    murid: { id: number; nama: string; nis: string | null; nama_kelas: string };
    kategori: 'pelanggaran' | 'kebaikan';
    tingkat_keparahan: 'ringan' | 'sedang' | 'berat';
    keterangan: string;
    poin_diberikan: number | null;
    tanggal_kejadian: string;
    keterangan_tambahan: string | null;
    bukti: BuktiItem[];
}

interface Props {
    laporan: LaporanData;
    poin_ranges: Record<string, Record<string, { min: number; max: number }>>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Riwayat Laporan', href: '/guru/laporan/riwayat' },
    { title: 'Edit Laporan', href: '#' },
];

export default function EditLaporan({ laporan, poin_ranges }: Props) {
    const [existingBukti, setExistingBukti] = useState<BuktiItem[]>(laporan.bukti);
    const [toDelete, setToDelete]           = useState<number[]>([]);
    const [newPreviews, setNewPreviews]     = useState<{ file: File; url: string }[]>([]);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        murid_id: number;
        kategori: 'pelanggaran' | 'kebaikan';
        tingkat_keparahan: 'ringan' | 'sedang' | 'berat';
        keterangan: string;
        tanggal_kejadian: string;
        keterangan_tambahan: string;
        bukti_hapus: number[];
        bukti: File[];
    }>({
        _method: 'PUT',
        murid_id: laporan.murid_id,
        kategori: laporan.kategori,
        tingkat_keparahan: laporan.tingkat_keparahan,
        keterangan: laporan.keterangan,
        tanggal_kejadian: laporan.tanggal_kejadian,
        keterangan_tambahan: laporan.keterangan_tambahan ?? '',
        bukti_hapus: [],
        bukti: [],
    });

    const markDelete = (id: number) => {
        setExistingBukti((prev) => prev.filter((b) => b.id !== id));
        const next = [...toDelete, id];
        setToDelete(next);
        setData('bukti_hapus', next);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (existingBukti.length + newPreviews.length + files.length > 5) {
            alert('Maksimal 5 foto bukti.');
            return;
        }
        setNewPreviews((prev) => [...prev, ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) }))]);
        setData('bukti', [...data.bukti, ...files]);
    };

    const removeNew = (idx: number) => {
        URL.revokeObjectURL(newPreviews[idx].url);
        setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
        setData('bukti', data.bukti.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/guru/laporan/${laporan.id}`, { forceFormData: true });
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Laporan" />
            <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">Edit Laporan</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Hanya laporan yang masih pending yang dapat diedit.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-card p-6 shadow-xs">
                    {/* Murid Info */}
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCheck className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">{laporan.murid.nama}</p>
                            <p className="text-xs text-muted-foreground">
                                Kelas: <span className="font-medium text-foreground">{laporan.murid.nama_kelas}</span>
                                {laporan.murid.nis && <span> · NIS: {laporan.murid.nis}</span>}
                            </p>
                        </div>
                    </div>

                    {/* Kategori Toggle */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setData('kategori', 'pelanggaran')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-all ${
                                    data.kategori === 'pelanggaran'
                                        ? 'border-red-500 bg-red-500/10 text-red-700 font-semibold shadow-xs dark:text-red-400'
                                        : 'border-input bg-background hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                <AlertCircle className="size-4 text-red-500" />
                                Pelanggaran
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('kategori', 'kebaikan')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-all ${
                                    data.kategori === 'kebaikan'
                                        ? 'border-green-500 bg-green-500/10 text-green-700 font-semibold shadow-xs dark:text-green-400'
                                        : 'border-input bg-background hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                <CheckCircle2 className="size-4 text-green-500" />
                                Kebaikan / Prestasi
                            </button>
                        </div>
                        {errors.kategori && <p className="text-xs text-red-600">{errors.kategori}</p>}
                    </div>

                    {/* Tingkat / Tahap */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Tingkat / Tahap <span className="text-red-500">*</span>
                            </label>
                            <span className="text-xs text-muted-foreground italic">
                                Poin ditentukan oleh admin
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {(['ringan', 'sedang', 'berat'] as const).map((t) => {
                                const range = poin_ranges[data.kategori]?.[t];
                                const hint = range ? `${range.min} s/d ${range.max}` : '';
                                const isSelected = data.tingkat_keparahan === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setData('tingkat_keparahan', t)}
                                        className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all ${
                                            isSelected
                                                ? data.kategori === 'pelanggaran'
                                                    ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/20 dark:bg-red-950/40 dark:text-red-200'
                                                    : 'border-green-500 bg-green-50 text-green-900 ring-2 ring-green-500/20 dark:bg-green-950/40 dark:text-green-200'
                                                : 'border-input bg-background hover:bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        <span className="text-sm font-semibold capitalize">{t}</span>
                                        <span className="text-xs font-mono font-medium mt-0.5 opacity-80">
                                            {hint} poin
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.tingkat_keparahan && <p className="text-xs text-red-600">{errors.tingkat_keparahan}</p>}
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Keterangan Tindakan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.keterangan}
                            onChange={(e) => setData('keterangan', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.keterangan && <p className="text-xs text-red-600">{errors.keterangan}</p>}
                    </div>

                    {/* Tanggal Kejadian */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Tanggal Kejadian <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.tanggal_kejadian}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setData('tanggal_kejadian', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.tanggal_kejadian && <p className="text-xs text-red-600">{errors.tanggal_kejadian}</p>}
                    </div>

                    {/* Keterangan Tambahan */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Kronologi / Catatan Tambahan <span className="text-muted-foreground font-normal lowercase">(opsional)</span>
                        </label>
                        <textarea
                            value={data.keterangan_tambahan}
                            onChange={(e) => setData('keterangan_tambahan', e.target.value)}
                            rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    {/* Existing Bukti */}
                    {existingBukti.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Foto Bukti Saat Ini
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {existingBukti.map((b) => (
                                    <div key={b.id} className="group relative">
                                        <img src={b.url} alt={b.nama_asli} className="h-20 w-20 rounded-md border object-cover shadow-xs" />
                                        <button
                                            type="button"
                                            onClick={() => markDelete(b.id)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white shadow-xs transition-opacity hover:bg-red-700"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Upload */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Tambah Foto Bukti Baru
                        </label>
                        {newPreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-1">
                                {newPreviews.map((p, i) => (
                                    <div key={i} className="group relative">
                                        <img src={p.url} alt="" className="h-20 w-20 rounded-md border object-cover shadow-xs" />
                                        <button
                                            type="button"
                                            onClick={() => removeNew(i)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white shadow-xs transition-opacity hover:bg-red-700"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {existingBukti.length + newPreviews.length < 5 && (
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed py-3 px-4 text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
                                <Upload className="size-4" />
                                <span>Pilih foto (JPG, PNG)</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpg,image/jpeg,image/png"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                            </label>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            Simpan Perubahan
                        </button>
                        <Link
                            href="/guru/laporan/riwayat"
                            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
                        >
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
