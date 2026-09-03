import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2, Upload, UserCheck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface TargetMurid {
    id: number;
    nama: string;
    nis?: string | null;
    nisn?: string | null;
    nama_kelas: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    murid: TargetMurid | null;
    poinRanges?: Record<string, Record<string, { min: number; max: number }>>;
}

const DEFAULT_POIN_RANGES: Record<'pelanggaran' | 'kebaikan', Record<'ringan' | 'sedang' | 'berat', { min: number; max: number }>> = {
    pelanggaran: {
        ringan: { min: -5,  max: -10 },
        sedang: { min: -11, max: -25 },
        berat:  { min: -26, max: -50 },
    },
    kebaikan: {
        ringan: { min: 5,  max: 10 },
        sedang: { min: 11, max: 25 },
        berat:  { min: 26, max: 50 },
    },
};

export function TambahCatatanModal({ open, onOpenChange, murid, poinRanges = DEFAULT_POIN_RANGES }: Props) {
    const [previewFiles, setPreviewFiles] = useState<{ file: File; url: string }[]>([]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        murid_id: number | '';
        kategori: 'pelanggaran' | 'kebaikan';
        tingkat_keparahan: 'ringan' | 'sedang' | 'berat';
        keterangan: string;
        tanggal_kejadian: string;
        keterangan_tambahan: string;
        bukti: File[];
    }>({
        murid_id: '',
        kategori: 'pelanggaran',
        tingkat_keparahan: 'ringan',
        keterangan: '',
        tanggal_kejadian: new Date().toISOString().split('T')[0],
        keterangan_tambahan: '',
        bukti: [],
    });

    useEffect(() => {
        if (murid && open) {
            setData((prev) => ({
                ...prev,
                murid_id: murid.id,
                kategori: 'pelanggaran',
                tingkat_keparahan: 'ringan',
                keterangan: '',
                tanggal_kejadian: new Date().toISOString().split('T')[0],
                keterangan_tambahan: '',
                bukti: [],
            }));
            setPreviewFiles([]);
            clearErrors();
        }
    }, [murid, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (previewFiles.length + files.length > 5) {
            alert('Maksimal 5 foto bukti.');
            return;
        }
        const newPreviews = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
        setPreviewFiles((prev) => [...prev, ...newPreviews]);
        setData('bukti', [...data.bukti, ...files]);
    };

    const removeFile = (idx: number) => {
        URL.revokeObjectURL(previewFiles[idx].url);
        setPreviewFiles((prev) => prev.filter((_, i) => i !== idx));
        setData('bukti', data.bukti.filter((_, i) => i !== idx));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/guru/laporan', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
                setPreviewFiles([]);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Tambah Catatan Siswa</DialogTitle>
                    <DialogDescription>
                        Catat tindakan pelanggaran tata tertib atau prestasi kebaikan siswa.
                    </DialogDescription>
                </DialogHeader>

                {murid && (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCheck className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground truncate">{murid.nama}</p>
                            <p className="text-xs text-muted-foreground">
                                Kelas: <span className="font-medium text-foreground">{murid.nama_kelas}</span>
                                {murid.nis && <span> · NIS: {murid.nis}</span>}
                                {murid.nisn && <span> · NISN: {murid.nisn}</span>}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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

                    {/* Tingkat / Tahap Selection with Point Badges */}
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
                                const range = poinRanges[data.kategori]?.[t];
                                const hint = range
                                    ? `${range.min} s/d ${range.max}`
                                    : '';
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

                    {/* Keterangan / Jenis Tindakan (Free text input) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Keterangan Tindakan / Prestasi <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder={
                                data.kategori === 'pelanggaran'
                                    ? 'Contoh: Terlambat masuk sekolah, Seragam tidak lengkap, dsb.'
                                    : 'Contoh: Membantu merapikan ruang lab, Juara 1 lomba cerdas cermat, dsb.'
                            }
                            value={data.keterangan}
                            onChange={(e) => setData('keterangan', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

                    {/* Keterangan Tambahan / Kronologi */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Kronologi / Catatan Tambahan <span className="text-muted-foreground font-normal lowercase">(opsional)</span>
                        </label>
                        <textarea
                            value={data.keterangan_tambahan}
                            onChange={(e) => setData('keterangan_tambahan', e.target.value)}
                            rows={2}
                            placeholder="Detail kejadian, lokasi, atau informasi relevan lainnya..."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.keterangan_tambahan && <p className="text-xs text-red-600">{errors.keterangan_tambahan}</p>}
                    </div>

                    {/* Upload Foto Bukti */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Foto Bukti <span className="text-muted-foreground font-normal lowercase">(opsional, maks. 5 foto)</span>
                        </label>
                        {previewFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1 pb-2">
                                {previewFiles.map((pf, i) => (
                                    <div key={i} className="group relative">
                                        <img src={pf.url} alt="" className="h-16 w-16 rounded-md border object-cover shadow-xs" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white shadow-xs transition-opacity hover:bg-red-700"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {previewFiles.length < 5 && (
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed py-2.5 px-3 text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
                                <Upload className="size-4" />
                                <span>Pilih Foto Bukti (JPG, PNG)</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpg,image/jpeg,image/png"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                            </label>
                        )}
                        {errors.bukti && <p className="text-xs text-red-600">{errors.bukti}</p>}
                    </div>

                    {/* Submit and Cancel Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            Simpan Catatan
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
