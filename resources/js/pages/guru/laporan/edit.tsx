import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronDown, ListFilter, Lock, PlusCircle, Search, Sparkles, Upload, UserCheck, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { type PoinMasterItem } from '@/components/tambah-catatan-modal';

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
    poin_masters?: PoinMasterItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/guru/dashboard' },
    { title: 'Riwayat Laporan', href: '/guru/laporan/riwayat' },
    { title: 'Edit Laporan', href: '#' },
];

export default function EditLaporan({ laporan, poin_ranges, poin_masters = [] }: Props) {
    const [existingBukti, setExistingBukti] = useState<BuktiItem[]>(laporan.bukti);
    const [toDelete, setToDelete]           = useState<number[]>([]);
    const [newPreviews, setNewPreviews]     = useState<{ file: File; url: string }[]>([]);

    const initialMaster = poin_masters.find(
        (pm) => pm.kategori === laporan.kategori && pm.nama === laporan.keterangan
    );

    // Mode pilihan: 'master' vs 'lainnya'
    const [sourceMode, setSourceMode] = useState<'master' | 'lainnya'>(initialMaster ? 'master' : 'lainnya');
    const [searchQuery, setSearchQuery] = useState(initialMaster ? initialMaster.nama : '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState<PoinMasterItem | null>(initialMaster ?? null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        murid_id: number;
        kategori: 'pelanggaran' | 'kebaikan';
        tingkat_keparahan: 'ringan' | 'sedang' | 'berat';
        keterangan: string;
        poin_diberikan: number | '';
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
        poin_diberikan: laporan.poin_diberikan ?? initialMaster?.poin ?? '',
        tanggal_kejadian: laporan.tanggal_kejadian,
        keterangan_tambahan: laporan.keterangan_tambahan ?? '',
        bukti_hapus: [],
        bukti: [],
    });

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const categoryMasters = poin_masters.filter((pm) => pm.kategori === data.kategori);
    const filteredMasters = categoryMasters.filter((pm) =>
        pm.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleKategoriChange = (newKategori: 'pelanggaran' | 'kebaikan') => {
        setData((prev) => ({
            ...prev,
            kategori: newKategori,
            keterangan: '',
            poin_diberikan: '',
            tingkat_keparahan: 'ringan',
        }));
        setSearchQuery('');
        setSelectedMaster(null);
        setIsDropdownOpen(false);
    };

    const handleSelectMasterItem = (item: PoinMasterItem) => {
        setSelectedMaster(item);
        setSearchQuery(item.nama);
        setIsDropdownOpen(false);

        let inferredSeverity: 'ringan' | 'sedang' | 'berat' = 'ringan';
        if (item.kategori === 'pelanggaran') {
            if (item.poin >= -10) inferredSeverity = 'ringan';
            else if (item.poin >= -25) inferredSeverity = 'sedang';
            else inferredSeverity = 'berat';
        } else {
            if (item.poin <= 10) inferredSeverity = 'ringan';
            else if (item.poin <= 25) inferredSeverity = 'sedang';
            else inferredSeverity = 'berat';
        }

        setData((prev) => ({
            ...prev,
            keterangan: item.nama,
            poin_diberikan: item.poin,
            tingkat_keparahan: inferredSeverity,
        }));
    };

    const handleSwitchMode = (mode: 'master' | 'lainnya') => {
        setSourceMode(mode);
        if (mode === 'master') {
            setSearchQuery('');
            setSelectedMaster(null);
            setData((prev) => ({
                ...prev,
                keterangan: '',
                poin_diberikan: '',
            }));
        } else {
            setSelectedMaster(null);
            setSearchQuery(laporan.keterangan);
            setData((prev) => ({
                ...prev,
                keterangan: laporan.keterangan,
                poin_diberikan: laporan.poin_diberikan ?? '',
            }));
        }
    };

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
                                onClick={() => handleKategoriChange('pelanggaran')}
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
                                onClick={() => handleKategoriChange('kebaikan')}
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

                    {/* Sumber Pilihan Mode: Pilih dari Master Data vs Opsi Lainnya */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Sumber Pilihan Tindakan <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('master')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-xs font-semibold transition-all ${
                                    sourceMode === 'master'
                                        ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                <ListFilter className="size-3.5" />
                                Pilih dari Daftar Master
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('lainnya')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-xs font-semibold transition-all ${
                                    sourceMode === 'lainnya'
                                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs'
                                        : 'border-input bg-background text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                <PlusCircle className="size-3.5" />
                                Opsi Lainnya (Input Manual)
                            </button>
                        </div>
                    </div>

                    {/* MODE A: Pilihan dari Daftar Master (Searchbar & Read-Only Point) */}
                    {sourceMode === 'master' && (
                        <>
                            {/* Searchbar Autocomplete */}
                            <div className="space-y-1.5 relative" ref={dropdownRef}>
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Cari Jenis {data.kategori === 'pelanggaran' ? 'Pelanggaran' : 'Kebaikan/Prestasi'} <span className="text-red-500">*</span>
                                </label>
                                
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        placeholder={
                                            data.kategori === 'pelanggaran'
                                                ? 'Ketik untuk mencari...'
                                                : 'Ketik untuk mencari...'
                                        }
                                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    />
                                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                    >
                                        <ChevronDown className="size-4" />
                                    </button>
                                </div>

                                {/* Filtered Dropdown Options */}
                                {isDropdownOpen && (
                                    <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md">
                                        {filteredMasters.length > 0 ? (
                                            filteredMasters.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleSelectMasterItem(item)}
                                                    className={`cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                                                        selectedMaster?.id === item.id ? 'bg-accent/60 font-semibold' : ''
                                                    }`}
                                                >
                                                    {item.nama}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-xs text-muted-foreground italic">
                                                Tidak ditemukan "{searchQuery}". Gunakan tombol "Opsi Lainnya" di atas untuk input manual.
                                            </div>
                                        )}
                                    </div>
                                )}
                                {errors.keterangan && <p className="text-xs text-red-600">{errors.keterangan}</p>}
                            </div>

                            {/* Kolom Poin Master — READ ONLY (Terkunci Otomatis) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Nilai Poin <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                        <Lock className="size-3 text-amber-500" /> Read Only (Poin Pasti dari Master)
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={data.poin_diberikan}
                                    readOnly
                                    placeholder="Poin otomatis terisi saat memilih..."
                                    className={`flex h-10 w-full rounded-md border border-dashed border-input bg-muted/60 px-3 py-2 text-sm font-mono font-bold cursor-not-allowed text-muted-foreground ${
                                        typeof data.poin_diberikan === 'number'
                                            ? data.poin_diberikan < 0
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                            : ''
                                    }`}
                                />
                                {errors.poin_diberikan && <p className="text-xs text-red-600">{errors.poin_diberikan}</p>}
                            </div>
                        </>
                    )}

                    {/* MODE B: Opsi Lainnya (Terpisah, Input Keterangan Sendiri & Kolom Poin Sendiri) */}
                    {sourceMode === 'lainnya' && (
                        <>
                            {/* Input Keterangan Sendiri */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Keterangan Tindakan / Prestasi (Lainnya) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder={
                                        data.kategori === 'pelanggaran'
                                            ? 'Tuliskan jenis pelanggaran yang tidak ada di daftar...'
                                            : 'Tuliskan jenis kebaikan/prestasi yang tidak ada di daftar...'
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {errors.keterangan && <p className="text-xs text-red-600">{errors.keterangan}</p>}
                            </div>

                            {/* Kolom Poin Sendiri (Editable) */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Nilai Poin Sendiri <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-primary font-medium flex items-center gap-1">
                                        <Sparkles className="size-3" /> Input Poin Manual
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={data.poin_diberikan}
                                    onChange={(e) => setData('poin_diberikan', e.target.value === '' ? '' : parseInt(e.target.value))}
                                    placeholder={data.kategori === 'pelanggaran' ? 'Masukkan poin negatif, misal: -15' : 'Masukkan poin positif, misal: 20'}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        typeof data.poin_diberikan === 'number'
                                            ? data.poin_diberikan < 0
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                            : ''
                                    }`}
                                />
                                {errors.poin_diberikan && <p className="text-xs text-red-600">{errors.poin_diberikan}</p>}
                            </div>
                        </>
                    )}

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
                        <Button
                            type="submit"
                            isLoading={processing}
                            loadingText="Menyimpan..."
                        >
                            Simpan Perubahan
                        </Button>
                        <Link href="/guru/laporan/riwayat">
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
