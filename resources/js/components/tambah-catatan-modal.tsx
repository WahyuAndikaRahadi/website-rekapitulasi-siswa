import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronDown, PlusCircle, Search, Sparkles, Upload, UserCheck, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

export interface TargetMurid {
    id: number;
    nama: string;
    nis?: string | null;
    nisn?: string | null;
    nama_kelas: string;
}

export interface PoinMasterItem {
    id: number;
    kategori: string;
    nama: string;
    poin: number;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    murid: TargetMurid | null;
    poinRanges?: Record<string, Record<string, { min: number; max: number }>>;
    poinMasters?: PoinMasterItem[];
}

export function TambahCatatanModal({ open, onOpenChange, murid, poinMasters = [] }: Props) {
    const [previewFiles, setPreviewFiles] = useState<{ file: File; url: string }[]>([]);
    
    // Searchbar State
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState<PoinMasterItem | null>(null);
    const [isManualMode, setIsManualMode] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        murid_id: number | '';
        kategori: 'pelanggaran' | 'prestasi';
        tingkat_keparahan: 'ringan' | 'sedang' | 'berat';
        keterangan: string;
        is_manual: boolean;
        poin_diberikan: number | '';
        tanggal_kejadian: string;
        keterangan_tambahan: string;
        bukti: File[];
    }>({
        murid_id: '',
        kategori: 'pelanggaran',
        tingkat_keparahan: 'ringan',
        keterangan: '',
        is_manual: false,
        poin_diberikan: '',
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
                is_manual: false,
                poin_diberikan: '',
                tanggal_kejadian: new Date().toISOString().split('T')[0],
                keterangan_tambahan: '',
                bukti: [],
            }));
            setSearchQuery('');
            setSelectedMaster(null);
            setIsManualMode(false);
            setIsDropdownOpen(false);
            setPreviewFiles([]);
            clearErrors();
        }
    }, [murid, open]);

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

    // Filter master poin berdasarkan kategori aktif (support both 'prestasi' and 'kebaikan')
    const categoryMasters = poinMasters.filter((pm) => 
        data.kategori === 'prestasi'
            ? pm.kategori === 'prestasi' || pm.kategori === 'kebaikan'
            : pm.kategori === 'pelanggaran'
    );
    const filteredMasters = categoryMasters.filter((pm) =>
        pm.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleKategoriChange = (newKategori: 'pelanggaran' | 'prestasi') => {
        setData((prev) => ({
            ...prev,
            kategori: newKategori,
            keterangan: '',
            is_manual: false,
            poin_diberikan: '',
            tingkat_keparahan: 'ringan',
        }));
        setSearchQuery('');
        setSelectedMaster(null);
        setIsManualMode(false);
        setIsDropdownOpen(false);
    };

    const handleSelectMasterItem = (item: PoinMasterItem) => {
        setSelectedMaster(item);
        setIsManualMode(false);
        setSearchQuery(item.nama);
        setIsDropdownOpen(false);

        let inferredSeverity: 'ringan' | 'sedang' | 'berat' = 'ringan';
        if (item.kategori === 'pelanggaran') {
            if (Math.abs(item.poin) <= 10) inferredSeverity = 'ringan';
            else if (Math.abs(item.poin) <= 25) inferredSeverity = 'sedang';
            else inferredSeverity = 'berat';
        } else {
            if (item.poin <= 10) inferredSeverity = 'ringan';
            else if (item.poin <= 25) inferredSeverity = 'sedang';
            else inferredSeverity = 'berat';
        }

        setData((prev) => ({
            ...prev,
            keterangan: item.nama,
            is_manual: false,
            poin_diberikan: item.poin,
            tingkat_keparahan: inferredSeverity,
        }));
    };

    const handleSelectManualOption = () => {
        setSelectedMaster(null);
        setIsManualMode(true);
        setSearchQuery('');
        setIsDropdownOpen(false);
        setData((prev) => ({
            ...prev,
            keterangan: '',
            is_manual: true,
            poin_diberikan: '',
        }));
    };

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
                setSearchQuery('');
                setSelectedMaster(null);
                setIsManualMode(false);
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
                                onClick={() => handleKategoriChange('prestasi')}
                                className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm font-medium transition-all ${
                                    data.kategori === 'prestasi'
                                        ? 'border-green-500 bg-green-500/10 text-green-700 font-semibold shadow-xs dark:text-green-400'
                                        : 'border-input bg-background hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                <CheckCircle2 className="size-4 text-green-500" />
                                Prestasi / Penghargaan
                            </button>
                        </div>
                        {errors.kategori && <p className="text-xs text-red-600">{errors.kategori}</p>}
                    </div>

                    {/* Cari Jenis Pelanggaran/Prestasi Dropdown (dengan Opsi Lainnya di dalamnya) */}
                    <div className="space-y-1.5 relative" ref={dropdownRef}>
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Cari Jenis {data.kategori === 'pelanggaran' ? 'Pelanggaran' : 'Prestasi'} <span className="text-red-500">*</span>
                            </label>
                            {isManualMode && (
                                <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                                    <Sparkles className="size-3" /> Mode Input Manual (Lainnya)
                                </span>
                            )}
                        </div>
                        
                        <div className="relative">
                            <input
                                type="text"
                                value={isManualMode ? 'Lainnya (Input Manual)' : searchQuery}
                                onFocus={() => setIsDropdownOpen(true)}
                                onChange={(e) => {
                                    if (isManualMode) {
                                        setIsManualMode(false);
                                    }
                                    setSearchQuery(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                placeholder={
                                    data.kategori === 'pelanggaran'
                                        ? 'Ketik untuk mencari (misal: upacara, rokok, terlambat)...'
                                        : 'Ketik untuk mencari (misal: OSIS, kepanitiaan, juara lomba)...'
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

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-lg">
                                {filteredMasters.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleSelectMasterItem(item)}
                                        className={`cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
                                            selectedMaster?.id === item.id ? 'bg-accent/60 font-semibold' : ''
                                        }`}
                                    >
                                        <span className="truncate pr-2">{item.nama}</span>
                                        <span className={`text-xs font-mono font-bold shrink-0 ${
                                            data.kategori === 'pelanggaran' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {data.kategori === 'pelanggaran' ? `${Math.abs(item.poin)} poin` : `+${item.poin} poin`}
                                        </span>
                                    </div>
                                ))}

                                {/* Pilihan Lainnya / Input Manual di dalam Dropdown */}
                                <div
                                    onClick={handleSelectManualOption}
                                    className="cursor-pointer border-t border-border px-3 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-2 transition-colors"
                                >
                                    <PlusCircle className="size-4" />
                                    <span>+ Lainnya (Input Manual yang tidak ada di daftar)</span>
                                </div>
                            </div>
                        )}
                        {errors.keterangan && <p className="text-xs text-red-600">{errors.keterangan}</p>}
                    </div>

                    {/* Jika Bukan Manual & Memilih dari Master: Tampilkan Teks Info Poin (Hide Field Nilai Poin) */}
                    {!isManualMode && selectedMaster && (
                        <div className={`rounded-lg border p-3 text-sm ${
                            data.kategori === 'pelanggaran'
                                ? 'border-red-200 bg-red-50/60 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300'
                                : 'border-green-200 bg-green-50/60 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300'
                        }`}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider">
                                    {data.kategori === 'pelanggaran' ? 'Poin Pelanggaran Diterapkan' : 'Poin Prestasi & Pengurangan Pelanggaran'}
                                </span>
                                <span className="font-mono font-extrabold text-base">
                                    {data.kategori === 'pelanggaran'
                                        ? `+${Math.abs(selectedMaster.poin)} Poin Pelanggaran`
                                        : `+${selectedMaster.poin} Poin Prestasi`}
                                </span>
                            </div>
                            {data.kategori === 'prestasi' && (
                                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                                    ✨ Sekaligus otomatis <strong>mengurangi {selectedMaster.poin} poin pelanggaran aktif</strong> siswa.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Jika Mode Manual ("Lainnya"): Tampilkan Input Keterangan & Input Nilai Poin */}
                    {isManualMode && (
                        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3.5 dark:border-amber-900 dark:bg-amber-950/20">
                            {/* Input Keterangan Manual */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Keterangan Tindakan / Prestasi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder={
                                        data.kategori === 'pelanggaran'
                                            ? 'Tuliskan jenis tindakan pelanggaran...'
                                            : 'Tuliskan jenis prestasi / peran aktif...'
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {errors.keterangan && <p className="text-xs text-red-600">{errors.keterangan}</p>}
                            </div>

                            {/* Input Nilai Poin Manual */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Nilai Poin <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-amber-700 font-medium flex items-center gap-1 dark:text-amber-400">
                                        <Sparkles className="size-3" /> Input Poin Manual
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    value={data.poin_diberikan}
                                    max={data.kategori === 'pelanggaran' ? 0 : undefined}
                                    min={data.kategori === 'pelanggaran' ? undefined : 1}
                                    onChange={(e) => {
                                        if (e.target.value === '' || e.target.value === '-') {
                                            setData('poin_diberikan', '');
                                            return;
                                        }
                                        const parsed = parseInt(e.target.value);
                                        if (data.kategori === 'pelanggaran') {
                                            // Always force negative for pelanggaran
                                            setData('poin_diberikan', parsed > 0 ? -parsed : parsed);
                                        } else {
                                            // Always force positive for prestasi
                                            setData('poin_diberikan', parsed < 0 ? -parsed : parsed);
                                        }
                                    }}
                                    placeholder={data.kategori === 'pelanggaran' ? '-15 (otomatis negatif)' : '20 (positif untuk prestasi)'}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        typeof data.poin_diberikan === 'number'
                                            ? data.poin_diberikan < 0
                                                ? 'text-red-600 dark:text-red-400'
                                                : data.poin_diberikan > 0
                                                  ? 'text-green-600 dark:text-green-400'
                                                  : ''
                                            : ''
                                    }`}
                                />
                                {errors.poin_diberikan && <p className="text-xs text-red-600">{errors.poin_diberikan}</p>}
                            </div>

                            <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                                ℹ️ Laporan manual akan berstatus <strong>Menunggu Verifikasi</strong> dan diverifikasi admin sebelum poin aktif.
                            </p>
                        </div>
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
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            isLoading={processing}
                            loadingText="Menyimpan..."
                        >
                            Simpan Catatan
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
