import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
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

interface BuktiItem {
    id: number;
    nama_asli: string;
    url: string;
}

interface LaporanData {
    id: number;
    murid_id: number;
    murid: { id: number; nama: string; nis: string | null; nama_kelas: string };
    jenis_pelanggaran_id: number;
    tanggal_kejadian: string;
    keterangan_tambahan: string | null;
    bukti: BuktiItem[];
}

interface Props {
    laporan: LaporanData;
    jenis_pelanggarans: JenisPelanggaran[];
}

interface MuridResult {
    id: number;
    nama: string;
    nis: string | null;
    nama_kelas: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Riwayat', href: '/guru/laporan/riwayat' },
    { title: 'Edit Laporan', href: '#' },
];

export default function EditLaporan({ laporan, jenis_pelanggarans }: Props) {
    const [selectedMurid, setSelectedMurid] = useState<MuridResult>({
        id: laporan.murid.id, nama: laporan.murid.nama,
        nis: laporan.murid.nis, nama_kelas: laporan.murid.nama_kelas,
    });
    const [muridQuery, setMuridQuery]       = useState('');
    const [muridResults, setMuridResults]   = useState<MuridResult[]>([]);
    const [muridLoading, setMuridLoading]   = useState(false);
    const [filterKategori, setFilterKategori] = useState<'semua' | 'pelanggaran' | 'kebaikan'>('semua');
    const [existingBukti, setExistingBukti] = useState<BuktiItem[]>(laporan.bukti);
    const [toDelete, setToDelete]           = useState<number[]>([]);
    const [newPreviews, setNewPreviews]     = useState<{ file: File; url: string }[]>([]);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        murid_id: number;
        jenis_pelanggaran_id: number;
        tanggal_kejadian: string;
        keterangan_tambahan: string;
        bukti_hapus: number[];
        bukti: File[];
    }>({
        _method: 'PUT',
        murid_id: laporan.murid_id,
        jenis_pelanggaran_id: laporan.jenis_pelanggaran_id,
        tanggal_kejadian: laporan.tanggal_kejadian,
        keterangan_tambahan: laporan.keterangan_tambahan ?? '',
        bukti_hapus: [],
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
                .then((d) => { setMuridResults(d); setMuridLoading(false); })
                .catch(() => setMuridLoading(false));
        }, 300);
    }, []);

    const selectMurid = (m: MuridResult) => {
        setSelectedMurid(m);
        setData('murid_id', m.id);
        setMuridQuery(''); setMuridResults([]);
    };

    const markDelete = (id: number) => {
        setExistingBukti((prev) => prev.filter((b) => b.id !== id));
        const next = [...toDelete, id];
        setToDelete(next);
        setData('bukti_hapus', next);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
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

    const filteredJenis = jenis_pelanggarans.filter(
        (j) => filterKategori === 'semua' || j.kategori === filterKategori,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Laporan" />
            <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">Edit Laporan</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Hanya laporan yang masih pending yang dapat diedit.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Murid */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Murid <span className="text-red-500">*</span></label>
                        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2.5">
                            <div>
                                <p className="text-sm font-medium">{selectedMurid.nama}</p>
                                <p className="text-muted-foreground text-xs">{selectedMurid.nama_kelas}</p>
                            </div>
                            <button type="button" onClick={() => setSelectedMurid(null as any)} className="text-muted-foreground hover:text-foreground">
                                <X className="size-4" />
                            </button>
                        </div>
                        {!selectedMurid && (
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                    {muridLoading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <Search className="size-4 text-muted-foreground" />}
                                </div>
                                <input type="text" placeholder="Ketik nama murid..." value={muridQuery}
                                    onChange={(e) => searchMurid(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                {muridResults.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                                        {muridResults.map((m) => (
                                            <button key={m.id} type="button" onClick={() => selectMurid(m)}
                                                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-accent">
                                                <span className="font-medium">{m.nama}</span>
                                                <span className="text-muted-foreground text-xs">{m.nama_kelas}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.murid_id && <p className="text-xs text-red-600">{errors.murid_id}</p>}
                    </div>

                    {/* Jenis */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Jenis <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                            {(['semua', 'pelanggaran', 'kebaikan'] as const).map((k) => (
                                <button key={k} type="button" onClick={() => setFilterKategori(k)}
                                    className={`rounded px-3 py-1 text-xs font-medium transition-colors ${filterKategori === k ? k === 'pelanggaran' ? 'bg-red-600 text-white' : k === 'kebaikan' ? 'bg-green-600 text-white' : 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                                    {k.charAt(0).toUpperCase() + k.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="max-h-56 overflow-y-auto rounded-md border">
                            {filteredJenis.map((j) => (
                                <label key={j.id} className={`flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm hover:bg-accent ${data.jenis_pelanggaran_id === j.id ? 'bg-accent' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" name="jenis_pelanggaran_id" value={j.id}
                                            checked={data.jenis_pelanggaran_id === j.id}
                                            onChange={() => setData('jenis_pelanggaran_id', j.id)} className="accent-primary" />
                                        <span><span className="text-muted-foreground mr-1.5 font-mono text-xs">{j.kode}</span>{j.keterangan}</span>
                                    </div>
                                    <span className={`ml-3 shrink-0 text-xs font-medium ${j.kategori === 'kebaikan' ? 'text-green-600' : 'text-red-600'}`}>
                                        {j.kategori === 'kebaikan' ? '+' : '−'}{j.poin} poin
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.jenis_pelanggaran_id && <p className="text-xs text-red-600">{errors.jenis_pelanggaran_id}</p>}
                    </div>

                    {/* Tanggal */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Tanggal Kejadian <span className="text-red-500">*</span></label>
                        <input type="date" value={data.tanggal_kejadian} max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setData('tanggal_kejadian', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.tanggal_kejadian && <p className="text-xs text-red-600">{errors.tanggal_kejadian}</p>}
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Keterangan Tambahan</label>
                        <textarea value={data.keterangan_tambahan} onChange={(e) => setData('keterangan_tambahan', e.target.value)} rows={3}
                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>

                    {/* Bukti existing */}
                    {existingBukti.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Bukti Saat Ini</label>
                            <div className="flex flex-wrap gap-2">
                                {existingBukti.map((b) => (
                                    <div key={b.id} className="group relative">
                                        <img src={b.url} alt={b.nama_asli} className="h-20 w-20 rounded-md border object-cover" />
                                        <button type="button" onClick={() => markDelete(b.id)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload baru */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Tambah Bukti Baru</label>
                        {newPreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {newPreviews.map((p, i) => (
                                    <div key={i} className="group relative">
                                        <img src={p.url} alt="" className="h-20 w-20 rounded-md border object-cover" />
                                        <button type="button" onClick={() => removeNew(i)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-red-600 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30">
                            <Upload className="size-4" />
                            <span>Pilih foto (JPG, JPEG, PNG)</span>
                            <input type="file" multiple accept="image/jpg,image/jpeg,image/png" onChange={handleFileChange} className="sr-only" />
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            Simpan Perubahan
                        </button>
                        <a href="/guru/laporan/riwayat" className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted">Batal</a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
