import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Search, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface JenisPelanggaran {
    id: number;
    kode: string;
    keterangan: string;
    kategori: 'pelanggaran' | 'kebaikan';
    poin: number;
    tingkat_keparahan: string | null;
}

interface MuridResult {
    id: number;
    nama: string;
    nis: string | null;
    nama_kelas: string;
}

interface Props {
    jenis_pelanggarans: JenisPelanggaran[];
    tahun_ajaran: { id: number; label: string } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Buat Laporan', href: '/guru/laporan/buat' },
];

export default function BuatLaporan({ jenis_pelanggarans, tahun_ajaran }: Props) {
    // Murid search state
    const [muridQuery, setMuridQuery] = useState('');
    const [muridResults, setMuridResults] = useState<MuridResult[]>([]);
    const [muridLoading, setMuridLoading] = useState(false);
    const [selectedMurid, setSelectedMurid] = useState<MuridResult | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Kategori filter
    const [filterKategori, setFilterKategori] = useState<'semua' | 'pelanggaran' | 'kebaikan'>('semua');

    // File preview
    const [previewFiles, setPreviewFiles] = useState<{ file: File; url: string }[]>([]);

    const { data, setData, post, processing, errors, reset } = useForm<{
        murid_id: number | '';
        jenis_pelanggaran_id: number | '';
        tanggal_kejadian: string;
        keterangan_tambahan: string;
        bukti: File[];
    }>({
        murid_id: '',
        jenis_pelanggaran_id: '',
        tanggal_kejadian: new Date().toISOString().split('T')[0],
        keterangan_tambahan: '',
        bukti: [],
    });

    const searchMurid = useCallback((q: string) => {
        setMuridQuery(q);
        if (q.length < 2) { setMuridResults([]); return; }
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setMuridLoading(true);
            fetch(`/guru/murid/search?q=${encodeURIComponent(q)}`)
                .then((r) => r.json())
                .then((data) => { setMuridResults(data); setMuridLoading(false); })
                .catch(() => setMuridLoading(false));
        }, 300);
    }, []);

    const selectMurid = (murid: MuridResult) => {
        setSelectedMurid(murid);
        setData('murid_id', murid.id);
        setMuridQuery('');
        setMuridResults([]);
    };

    const clearMurid = () => {
        setSelectedMurid(null);
        setData('murid_id', '');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
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
        post('/guru/laporan', { forceFormData: true });
    };

    const filteredJenis = jenis_pelanggarans.filter(
        (j) => filterKategori === 'semua' || j.kategori === filterKategori,
    );

    const selectedJenis = jenis_pelanggarans.find((j) => j.id === data.jenis_pelanggaran_id);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Laporan" />
            <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">Buat Laporan</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {tahun_ajaran ? `Tahun Ajaran ${tahun_ajaran.label}` : 'Tidak ada tahun ajaran aktif'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Murid */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Murid <span className="text-red-500">*</span></label>
                        {selectedMurid ? (
                            <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5">
                                <div>
                                    <p className="text-sm font-medium">{selectedMurid.nama}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {selectedMurid.nama_kelas}{selectedMurid.nis ? ` · NIS: ${selectedMurid.nis}` : ''}
                                    </p>
                                </div>
                                <button type="button" onClick={clearMurid} className="text-muted-foreground hover:text-foreground">
                                    <X className="size-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                    {muridLoading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <Search className="size-4 text-muted-foreground" />}
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ketik nama atau NIS murid..."
                                    value={muridQuery}
                                    onChange={(e) => searchMurid(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {muridResults.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                                        {muridResults.map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => selectMurid(m)}
                                                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-accent"
                                            >
                                                <span className="font-medium">{m.nama}</span>
                                                <span className="text-muted-foreground text-xs">{m.nama_kelas}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {muridQuery.length >= 2 && muridResults.length === 0 && !muridLoading && (
                                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover px-3 py-2.5 text-sm text-muted-foreground shadow-md">
                                        Murid tidak ditemukan
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.murid_id && <p className="text-xs text-red-600">{errors.murid_id}</p>}
                    </div>

                    {/* Jenis Pelanggaran */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Jenis <span className="text-red-500">*</span></label>
                        {/* Filter kategori */}
                        <div className="flex gap-2">
                            {(['semua', 'pelanggaran', 'kebaikan'] as const).map((k) => (
                                <button
                                    key={k}
                                    type="button"
                                    onClick={() => setFilterKategori(k)}
                                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                                        filterKategori === k
                                            ? k === 'pelanggaran' ? 'bg-red-600 text-white'
                                            : k === 'kebaikan' ? 'bg-green-600 text-white'
                                            : 'bg-foreground text-background'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                >
                                    {k.charAt(0).toUpperCase() + k.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="max-h-56 overflow-y-auto rounded-md border">
                            {filteredJenis.length === 0 ? (
                                <p className="p-3 text-sm text-muted-foreground">Tidak ada data</p>
                            ) : filteredJenis.map((j) => (
                                <label
                                    key={j.id}
                                    className={`flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm hover:bg-accent ${
                                        data.jenis_pelanggaran_id === j.id ? 'bg-accent' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="jenis_pelanggaran_id"
                                            value={j.id}
                                            checked={data.jenis_pelanggaran_id === j.id}
                                            onChange={() => setData('jenis_pelanggaran_id', j.id)}
                                            className="accent-primary"
                                        />
                                        <span>
                                            <span className="text-muted-foreground mr-1.5 font-mono text-xs">{j.kode}</span>
                                            {j.keterangan}
                                        </span>
                                    </div>
                                    <span className={`ml-3 shrink-0 text-xs font-medium ${j.kategori === 'kebaikan' ? 'text-green-600' : 'text-red-600'}`}>
                                        {j.kategori === 'kebaikan' ? '+' : '−'}{j.poin} poin
                                    </span>
                                </label>
                            ))}
                        </div>
                        {selectedJenis && (
                            <p className="text-muted-foreground text-xs">
                                Dipilih: <span className="font-medium text-foreground">{selectedJenis.keterangan}</span>
                                {selectedJenis.tingkat_keparahan && ` · ${selectedJenis.tingkat_keparahan}`}
                            </p>
                        )}
                        {errors.jenis_pelanggaran_id && <p className="text-xs text-red-600">{errors.jenis_pelanggaran_id}</p>}
                    </div>

                    {/* Tanggal Kejadian */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Tanggal Kejadian <span className="text-red-500">*</span></label>
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
                        <label className="text-sm font-medium">Keterangan Tambahan <span className="text-muted-foreground font-normal">(opsional)</span></label>
                        <textarea
                            value={data.keterangan_tambahan}
                            onChange={(e) => setData('keterangan_tambahan', e.target.value)}
                            rows={3}
                            placeholder="Ceritakan kronologi atau detail kejadian..."
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.keterangan_tambahan && <p className="text-xs text-red-600">{errors.keterangan_tambahan}</p>}
                    </div>

                    {/* Upload Bukti */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                            Bukti Foto <span className="text-muted-foreground font-normal">(opsional, maks. 5 foto, 500KB/foto)</span>
                        </label>
                        {previewFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {previewFiles.map((pf, i) => (
                                    <div key={i} className="group relative">
                                        <img src={pf.url} alt="" className="h-20 w-20 rounded-md border object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {previewFiles.length < 5 && (
                            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30">
                                <Upload className="size-4" />
                                <span>Pilih foto (JPG, JPEG, PNG)</span>
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

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            Simpan Laporan
                        </button>
                        <a
                            href="/guru/laporan/riwayat"
                            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted"
                        >
                            Batal
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
