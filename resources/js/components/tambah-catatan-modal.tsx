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
    no_telp?: string | null;
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
    
    // Mode State: Searchbar Master vs Manual Mode (Lainnya)
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

    // Filter master poin berdasarkan kategori aktif
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

    const handleToggleManualMode = (enableManual: boolean) => {
        setIsManualMode(enableManual);
        setIsDropdownOpen(false);
        setSelectedMaster(null);
        setSearchQuery('');
        setData((prev) => ({
            ...prev,
            keterangan: '',
            is_manual: enableManual,
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
                    <DialogTitle className="text-lg font-bold text-foreground">Tambah Catatan Siswa</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Catat tindakan pelanggaran tata tertib atau prestasi kebaikan siswa.
                    </DialogDescription>
                </DialogHeader>

                {murid && (
                    <div className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCheck className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground truncate">{murid.nama}</p>
                            <p className="text-xs text-muted-foreground">
                                Kelas: <span className="font-semibold text-foreground">{murid.nama_kelas}</span>
                                {murid.nis && <span> · NIS: {murid.nis}</span>}
                                {murid.nisn && <span> · NISN: {murid.nisn}</span>}
                                {murid.no_telp && <span> · WA/Telp: <strong className="font-semibold text-foreground font-mono">{murid.no_telp}</strong></span>}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Kategori Toggle */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                            Kategori <span className="text-red-600 dark:text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleKategoriChange('pelanggaran')}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-extrabold transition-all shadow-xs ${
                                    data.kategori === 'pelanggaran'
                                        ? 'border-red-600 bg-red-600 text-white shadow-md ring-2 ring-red-500/40 dark:bg-red-600 dark:text-white'
                                        : 'border-input bg-card text-foreground hover:bg-accent font-bold'
                                }`}
                            >
                                <AlertCircle className={`size-4 ${data.kategori === 'pelanggaran' ? 'text-white' : 'text-red-600 dark:text-red-400'}`} />
                                Pelanggaran
                            </button>
                            <button
                                type="button"
                                onClick={() => handleKategoriChange('prestasi')}
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-extrabold transition-all shadow-xs ${
                                    data.kategori === 'prestasi'
                                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/40 dark:bg-emerald-600 dark:text-white'
                                        : 'border-input bg-card text-foreground hover:bg-accent font-bold'
                                }`}
                            >
                                <CheckCircle2 className={`size-4 ${data.kategori === 'prestasi' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                                Prestasi / Penghargaan
                            </button>
                        </div>
                        {errors.kategori && <p className="text-xs font-bold text-red-600 dark:text-red-400">{errors.kategori}</p>}
                    </div>

                    {/* Tombol Pemisah / Link Opsi Lainnya di Luar Searchbar */}
                    <div className="flex items-center justify-between pt-1">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                            {isManualMode ? 'Opsi Lainnya (Input Manual)' : `Cari Jenis ${data.kategori === 'pelanggaran' ? 'Pelanggaran' : 'Prestasi'}`} <span className="text-red-600 dark:text-red-400">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={() => handleToggleManualMode(!isManualMode)}
                            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-amber-600 bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-amber-600 active:scale-95 transition-all shadow-xs"
                        >
                            {isManualMode ? (
                                <span>← Cari dari Daftar Master</span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <PlusCircle className="size-3.5 stroke-[2.5]" /> Opsi Lainnya (Input Manual & Poin Sendiri)
                                </span>
                            )}
                        </button>
                    </div>

                    {/* MODE 1: SEARCHBAR MASTER */}
                    {!isManualMode && (
                        <div className="space-y-3">
                            <div className="space-y-1.5 relative" ref={dropdownRef}>
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
                                                ? 'Ketik untuk mencari pelanggaran (misal: upacara, rokok, terlambat)...'
                                                : 'Ketik untuk mencari prestasi (misal: OSIS, kepanitiaan, juara lomba)...'
                                        }
                                        className="flex h-11 w-full rounded-xl border-2 border-input bg-background pl-10 pr-9 text-sm font-semibold text-foreground placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-xs"
                                    />
                                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/70" />
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground p-1"
                                    >
                                        <ChevronDown className="size-4" />
                                    </button>
                                </div>

                                {/* Dropdown List Master Items */}
                                {isDropdownOpen && (
                                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border-2 border-border bg-popover py-1.5 text-popover-foreground shadow-2xl">
                                        {filteredMasters.length > 0 ? (
                                            filteredMasters.map((item) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleSelectMasterItem(item)}
                                                    className={`cursor-pointer px-3.5 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between ${
                                                        selectedMaster?.id === item.id ? 'bg-accent font-bold' : ''
                                                    }`}
                                                >
                                                    <span className="truncate pr-3 font-semibold text-foreground">{item.nama}</span>
                                                    <span className={`text-xs font-mono font-black shrink-0 px-2.5 py-0.5 rounded-full text-white shadow-2xs ${
                                                        data.kategori === 'pelanggaran'
                                                            ? 'bg-red-600 dark:bg-red-700'
                                                            : 'bg-emerald-600 dark:bg-emerald-700'
                                                    }`}>
                                                        {data.kategori === 'pelanggaran' ? `${Math.abs(item.poin)} poin` : `+${item.poin} poin`}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-3.5 py-2.5 text-xs text-foreground font-bold italic">
                                                Tidak ditemukan "{searchQuery}". Klik tombol "Opsi Lainnya" di atas untuk input manual.
                                            </div>
                                        )}
                                    </div>
                                )}
                                {errors.keterangan && <p className="text-xs font-bold text-red-600 dark:text-red-400">{errors.keterangan}</p>}
                            </div>

                            {/* Badge Info Poin Otomatis Master */}
                            {selectedMaster && (
                                <div className={`rounded-xl border-2 p-3.5 text-sm shadow-xs ${
                                    data.kategori === 'pelanggaran'
                                        ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-100'
                                        : 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                                            {data.kategori === 'pelanggaran' ? 'Poin Pelanggaran Otomatis' : 'Poin Prestasi Otomatis'}
                                        </span>
                                        <span className={`font-mono font-black text-lg px-3 py-1 rounded-xl text-white shadow-xs ${
                                            data.kategori === 'pelanggaran'
                                                ? 'bg-red-600 dark:bg-red-700'
                                                : 'bg-emerald-600 dark:bg-emerald-700'
                                        }`}>
                                            {data.kategori === 'pelanggaran'
                                                ? `${Math.abs(selectedMaster.poin)} Poin`
                                                : `+${selectedMaster.poin} Poin`}
                                        </span>
                                    </div>
                                    {data.kategori === 'prestasi' && (
                                        <p className="mt-1.5 text-xs text-emerald-950 dark:text-emerald-200 font-bold">
                                            ✨ Sekaligus otomatis <strong>mengurangi {selectedMaster.poin} poin pelanggaran aktif</strong> siswa.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MODE 2: OPSI LAINNYA */}
                    {isManualMode && (
                        <div className={`space-y-3.5 rounded-xl border-2 p-4 transition-all shadow-xs ${
                            data.kategori === 'pelanggaran'
                                ? 'border-red-500 bg-red-50/60 dark:bg-red-950/30'
                                : 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                        }`}>
                            {/* Input Keterangan Manual */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                                    Keterangan Tindakan / Prestasi <span className="text-red-600 dark:text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder={
                                        data.kategori === 'pelanggaran'
                                            ? 'Tuliskan jenis tindakan pelanggaran kustom...'
                                            : 'Tuliskan jenis prestasi / peran aktif kustom...'
                                    }
                                    className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-3.5 py-2 text-sm font-semibold text-foreground placeholder:text-muted-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {errors.keterangan && <p className="text-xs font-bold text-red-600 dark:text-red-400">{errors.keterangan}</p>}
                            </div>

                            {/* Kolom Nilai Poin Sendiri */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                                        Nilai Poin Sendiri <span className="text-red-600 dark:text-red-400">*</span>
                                    </label>
                                    <span className="text-xs text-amber-900 dark:text-amber-200 font-extrabold flex items-center gap-1">
                                        <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" /> Input Poin Manual
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
                                            setData('poin_diberikan', parsed > 0 ? -parsed : parsed);
                                        } else {
                                            setData('poin_diberikan', parsed < 0 ? -parsed : parsed);
                                        }
                                    }}
                                    placeholder={data.kategori === 'pelanggaran' ? '-15 (misal: -15)' : '20 (misal: 20)'}
                                    className={`flex h-11 w-full rounded-xl border-2 bg-background px-3.5 py-2 text-base font-mono font-black text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                        typeof data.poin_diberikan === 'number'
                                            ? data.poin_diberikan < 0
                                                ? 'text-red-600 dark:text-red-400 border-red-500'
                                                : data.poin_diberikan > 0
                                                  ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500'
                                                  : 'border-input'
                                            : 'border-input'
                                    }`}
                                />
                                {errors.poin_diberikan && <p className="text-xs font-bold text-red-600 dark:text-red-400">{errors.poin_diberikan}</p>}
                            </div>

                            <p className="text-xs text-foreground font-bold italic">
                                ℹ️ Laporan manual akan diverifikasi oleh admin saat tindak lanjut.
                            </p>
                        </div>
                    )}

                    {/* Tanggal Kejadian */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Tanggal Kejadian <span className="text-red-600 dark:text-red-400">*</span>
                        </label>
                        <input
                            type="date"
                            value={data.tanggal_kejadian}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setData('tanggal_kejadian', e.target.value)}
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.tanggal_kejadian && <p className="text-xs font-semibold text-red-600">{errors.tanggal_kejadian}</p>}
                    </div>

                    {/* Keterangan Tambahan / Kronologi */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Kronologi / Catatan Tambahan <span className="text-muted-foreground font-normal lowercase">(opsional)</span>
                        </label>
                        <textarea
                            value={data.keterangan_tambahan}
                            onChange={(e) => setData('keterangan_tambahan', e.target.value)}
                            rows={2}
                            placeholder="Detail kejadian, lokasi, atau informasi relevan lainnya..."
                            className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.keterangan_tambahan && <p className="text-xs font-semibold text-red-600">{errors.keterangan_tambahan}</p>}
                    </div>

                    {/* Upload Foto Bukti */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Foto Bukti <span className="text-muted-foreground font-normal lowercase">(opsional, maks. 5 foto)</span>
                        </label>
                        {previewFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1 pb-2">
                                {previewFiles.map((pf, i) => (
                                    <div key={i} className="group relative">
                                        <img src={pf.url} alt="" className="h-16 w-16 rounded-xl border object-cover shadow-xs" />
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
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed py-2.5 px-3 text-xs font-semibold text-muted-foreground hover:bg-muted/40 transition-colors">
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
                        {errors.bukti && <p className="text-xs font-semibold text-red-600">{errors.bukti}</p>}
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
