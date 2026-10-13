import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronDown, PlusCircle, Search, Sparkles, Upload, UserCheck, X } from 'lucide-react';
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
    murid: { id: number; nama: string; nis: string | null; no_telp?: string | null; nama_kelas: string };
    kategori: 'pelanggaran' | 'prestasi' | 'kebaikan';
    tingkat_keparahan: 'ringan' | 'sedang' | 'berat';
    keterangan: string;
    is_manual?: boolean;
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

    const normalizedKategori = laporan.kategori === 'kebaikan' ? 'prestasi' : laporan.kategori;

    const initialMaster = !laporan.is_manual
        ? poin_masters.find(
            (pm) => (pm.kategori === normalizedKategori || (normalizedKategori === 'prestasi' && pm.kategori === 'kebaikan')) && pm.nama === laporan.keterangan
        )
        : null;

    const [isManualMode, setIsManualMode] = useState<boolean>(Boolean(laporan.is_manual || !initialMaster));
    const [searchQuery, setSearchQuery] = useState(initialMaster ? initialMaster.nama : '');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedMaster, setSelectedMaster] = useState<PoinMasterItem | null>(initialMaster ?? null);
    const [clientFileError, setClientFileError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        murid_id: number;
        kategori: 'pelanggaran' | 'prestasi';
        tingkat_keparahan: 'ringan' | 'sedang' | 'berat';
        keterangan: string;
        is_manual: boolean;
        poin_diberikan: number | '';
        tanggal_kejadian: string;
        keterangan_tambahan: string;
        bukti_hapus: number[];
        bukti: File[];
    }>({
        _method: 'PUT',
        murid_id: laporan.murid_id,
        kategori: normalizedKategori,
        tingkat_keparahan: laporan.tingkat_keparahan,
        keterangan: laporan.keterangan,
        is_manual: Boolean(laporan.is_manual || !initialMaster),
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

    const categoryMasters = poin_masters.filter((pm: PoinMasterItem) =>
        data.kategori === 'prestasi'
            ? pm.kategori === 'prestasi' || pm.kategori === 'kebaikan'
            : pm.kategori === 'pelanggaran'
    );
    const filteredMasters = categoryMasters.filter((pm: PoinMasterItem) =>
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
            keterangan: enableManual ? (laporan.is_manual ? laporan.keterangan : '') : '',
            is_manual: enableManual,
            poin_diberikan: enableManual ? (laporan.is_manual ? (laporan.poin_diberikan ?? '') : '') : '',
        }));
    };

    const markDelete = (id: number) => {
        setExistingBukti((prev) => prev.filter((b) => b.id !== id));
        const next = [...toDelete, id];
        setToDelete(next);
        setData('bukti_hapus', next);
    };

    const MAX_FILE_SIZE_KB = 2048; // 2 MB

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClientFileError(null);
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;

        if (existingBukti.length + newPreviews.length + files.length > 5) {
            setClientFileError('Maksimal 5 foto bukti yang dapat diunggah.');
            e.target.value = '';
            return;
        }

        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        const invalidFiles: string[] = [];
        const oversizedFiles: string[] = [];

        files.forEach((f) => {
            const ext = f.name.split('.').pop()?.toLowerCase();
            const isValidMime = allowedMimes.includes(f.type.toLowerCase()) || ['jpg', 'jpeg', 'png'].includes(ext ?? '');
            if (!isValidMime) {
                invalidFiles.push(f.name);
            }
            if (f.size > MAX_FILE_SIZE_KB * 1024) {
                oversizedFiles.push(`${f.name} (${(f.size / (1024 * 1024)).toFixed(1)} MB)`);
            }
        });

        if (invalidFiles.length > 0) {
            setClientFileError(`Format file tidak didukung: ${invalidFiles.join(', ')}. Hanya JPG, JPEG, dan PNG yang diizinkan.`);
            e.target.value = '';
            return;
        }

        if (oversizedFiles.length > 0) {
            setClientFileError(`Ukuran foto bukti terlalu besar: ${oversizedFiles.join(', ')}. Batas maksimal adalah ${MAX_FILE_SIZE_KB / 1024} MB per foto.`);
            e.target.value = '';
            return;
        }

        setNewPreviews((prev) => [...prev, ...files.map((f) => ({ file: f, url: URL.createObjectURL(f) }))]);
        setData('bukti', [...data.bukti, ...files]);
        e.target.value = '';
    };

    const removeNew = (idx: number) => {
        setClientFileError(null);
        URL.revokeObjectURL(newPreviews[idx].url);
        setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
        setData('bukti', data.bukti.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (processing) return;
        post(`/guru/laporan/${laporan.id}`, { forceFormData: true });
    };

    const buktiErrors = Object.entries(errors)
        .filter(([key]) => key === 'bukti' || key.startsWith('bukti.'))
        .map(([, msg]) => msg);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Laporan" />
            <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-foreground">Edit Laporan</h1>
                    <p className="text-muted-foreground mt-1 text-xs">
                        Hanya laporan yang belum ditindaklanjuti yang dapat diubah.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-card p-6 shadow-xs">
                    {/* Top Error Alert Banner */}
                    {(Object.keys(errors).length > 0 || clientFileError) && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                            <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                            <div className="space-y-1">
                                <p className="font-bold">Terjadi kesalahan pada formulir:</p>
                                <ul className="list-inside list-disc text-xs space-y-0.5">
                                    {clientFileError && <li>{clientFileError}</li>}
                                    {Object.entries(errors).map(([field, msg]) => (
                                        <li key={field}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Murid Info */}
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCheck className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-foreground truncate">{laporan.murid.nama}</p>
                            <p className="text-xs text-muted-foreground">
                                Kelas: <span className="font-semibold text-foreground">{laporan.murid.nama_kelas}</span>
                                {laporan.murid.nis && <span> · NIS: {laporan.murid.nis}</span>}
                                {laporan.murid.no_telp && <span> · WA/Telp: <strong className="font-semibold text-foreground font-mono">{laporan.murid.no_telp}</strong></span>}
                            </p>
                        </div>
                    </div>

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

                    {/* Link Toggle Opsi Lainnya di Luar Searchbar */}
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
                                                ? 'Ketik untuk mencari...'
                                                : 'Ketik untuk mencari...'
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

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border-2 border-border bg-popover py-1.5 text-popover-foreground shadow-2xl">
                                        {filteredMasters.length > 0 ? (
                                            filteredMasters.map((item: PoinMasterItem) => (
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

                            {/* Info Point Box */}
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

                    {/* Keterangan Tambahan */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Kronologi / Catatan Tambahan <span className="text-muted-foreground font-normal lowercase">(opsional)</span>
                        </label>
                        <textarea
                            value={data.keterangan_tambahan}
                            onChange={(e) => setData('keterangan_tambahan', e.target.value)}
                            rows={3}
                            placeholder="Detail kejadian, lokasi, atau informasi relevan lainnya..."
                            className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>

                    {/* Existing Bukti */}
                    {existingBukti.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Foto Bukti Saat Ini
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {existingBukti.map((b) => (
                                    <div key={b.id} className="group relative">
                                        <img src={b.url} alt={b.nama_asli} className="h-20 w-20 rounded-xl border object-cover shadow-xs" />
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
                        <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Tambah Foto Bukti Baru
                        </label>
                        {clientFileError && (
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{clientFileError}</p>
                        )}
                        {buktiErrors.length > 0 && (
                            <div className="space-y-1">
                                {buktiErrors.map((msg, i) => (
                                    <p key={i} className="text-xs font-semibold text-red-600 dark:text-red-400">
                                        {msg}
                                    </p>
                                ))}
                            </div>
                        )}
                        {newPreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 pb-1">
                                {newPreviews.map((p, i) => (
                                    <div key={i} className="group relative">
                                        <img src={p.url} alt="" className="h-20 w-20 rounded-xl border object-cover shadow-xs" />
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
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed py-3 px-4 text-xs font-semibold text-muted-foreground hover:bg-muted/40 transition-colors">
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
                            disabled={processing}
                        >
                            Simpan Perubahan
                        </Button>
                        <Link href="/guru/laporan/riwayat" className={processing ? 'pointer-events-none opacity-50' : ''}>
                            <Button variant="secondary" type="button" disabled={processing}>
                                Batal
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
