import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Download, FileSpreadsheet, GraduationCap, Loader2, School, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface KelasItem { id: number; nama_kelas: string; }

interface Props {
    kelas_list: KelasItem[];
    counts?: { laporan: number; murid: number; kelas: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Ekspor Data', href: '/admin/export' },
];

type DownloadStatus = 'idle' | 'loading' | 'success' | 'error';

async function fetchDownload(url: string, formData: Record<string, string>): Promise<void> {
    const params = new URLSearchParams();
    Object.entries(formData).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params.append(k, v);
    });

    const queryString = params.toString();
    const requestUrl = queryString ? `${url}?${queryString}` : url;

    const headers: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*',
    };

    const response = await fetch(requestUrl, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        let errorMsg = `Gagal mengunduh file (HTTP ${response.status})`;
        try {
            // Baca body hanya SEKALI sebagai text untuk menghindari "Body has already been consumed"
            const rawText = await response.text();
            try {
                const data = JSON.parse(rawText);
                if (data?.message) {
                    errorMsg = data.message;
                } else if (data?.errors) {
                    const firstError = Object.values(data.errors)[0];
                    if (Array.isArray(firstError) && firstError.length > 0) {
                        errorMsg = String(firstError[0]);
                    }
                }
            } catch {
                if (rawText && rawText.length < 300 && !rawText.includes('<!DOCTYPE')) {
                    errorMsg = rawText;
                }
            }
        } catch {
            // Abaikan kegagalan parsing body
        }
        throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
        throw new Error('Sesi Anda mungkin telah kedaluwarsa atau server mengembalikan halaman HTML. Silakan muat ulang halaman.');
    }

    const disposition = response.headers.get('content-disposition');
    let filename = 'export.xlsx';
    if (disposition) {
        // Coba match filename*=UTF-8''... atau filename="..."
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;\n]+)/i);
        if (utf8Match?.[1]) {
            filename = decodeURIComponent(utf8Match[1]);
        } else {
            const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (match?.[1]) {
                filename = match[1].replace(/['"]/g, '').trim();
            }
        }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        a.remove();
    }, 1500);
}

export default function ExportIndex({ kelas_list = [], counts = { laporan: 0, murid: 0, kelas: 0 } }: Props) {
    const [laporanForm, setLaporanForm] = useState({
        kelas_id: '',
        dari: '',
        sampai: '',
        kategori: '',
    });

    const [muridForm, setMuridForm] = useState({
        kelas_id: '',
        status: 'aktif',
    });

    const [kelasForm, setKelasForm] = useState({
        kelas_id: '',
    });

    const [laporanStatus, setLaporanStatus] = useState<DownloadStatus>('idle');
    const [muridStatus, setMuridStatus] = useState<DownloadStatus>('idle');
    const [kelasStatus, setKelasStatus] = useState<DownloadStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Validasi Laporan
    const isDateInverted = Boolean(laporanForm.dari && laporanForm.sampai && laporanForm.dari > laporanForm.sampai);
    const isDateIncomplete = Boolean((laporanForm.dari && !laporanForm.sampai) || (!laporanForm.dari && laporanForm.sampai));
    const isNoLaporanData = (counts?.laporan ?? 0) === 0;
    const isLaporanDisabled = laporanStatus === 'loading' || isNoLaporanData || isDateInverted || isDateIncomplete;
    const laporanDisabledReason = isNoLaporanData
        ? 'Data Laporan Kosong'
        : isDateInverted
          ? 'Rentang Tanggal Terbalik'
          : isDateIncomplete
            ? 'Lengkapi Rentang Tanggal'
            : undefined;

    // Validasi Murid
    const isNoMuridData = (counts?.murid ?? 0) === 0;
    const isMuridDisabled = muridStatus === 'loading' || isNoMuridData || !muridForm.status;
    const muridDisabledReason = isNoMuridData
        ? 'Data Siswa Kosong'
        : !muridForm.status
          ? 'Pilih Status Siswa'
          : undefined;

    // Validasi Kelas
    const isNoKelasData = (counts?.kelas ?? 0) === 0;
    const isKelasDisabled = kelasStatus === 'loading' || isNoKelasData;
    const kelasDisabledReason = isNoKelasData ? 'Data Kelas Kosong' : undefined;

    const handleExport = async (
        url: string,
        formData: Record<string, string>,
        setStatus: React.Dispatch<React.SetStateAction<DownloadStatus>>,
    ) => {
        setStatus('loading');
        setErrorMsg('');
        try {
            await fetchDownload(url, formData);
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err: unknown) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunduh file');
            setTimeout(() => setStatus('idle'), 6000);
        }
    };

    const handleExportLaporan = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLaporanDisabled) return;
        handleExport('/admin/export/laporan', laporanForm, setLaporanStatus);
    };

    const handleExportMurid = (e: React.FormEvent) => {
        e.preventDefault();
        if (isMuridDisabled) return;
        handleExport('/admin/export/murid', muridForm, setMuridStatus);
    };

    const handleExportKelas = (e: React.FormEvent) => {
        e.preventDefault();
        if (isKelasDisabled) return;
        handleExport('/admin/export/kelas', kelasForm, setKelasStatus);
    };

    const btnClass = (status: DownloadStatus, isDisabled: boolean = false) => {
        if (isDisabled && status !== 'loading')
            return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs font-semibold shadow-none cursor-not-allowed select-none transition-all';
        if (status === 'loading')
            return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-400 text-white text-xs font-semibold shadow-xs cursor-wait';
        if (status === 'success')
            return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs';
        if (status === 'error')
            return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-xs cursor-pointer';
        return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer';
    };

    const btnIcon = (status: DownloadStatus, isDisabled: boolean = false) => {
        if (status === 'loading') return <Loader2 className="size-4 animate-spin" />;
        if (status === 'success') return <CheckCircle2 className="size-4" />;
        if (status === 'error') return <XCircle className="size-4" />;
        return <Download className={`size-4 ${isDisabled ? 'opacity-40' : ''}`} />;
    };

    const btnLabel = (status: DownloadStatus, defaultLabel: string, isDisabled: boolean = false, disabledReason?: string) => {
        if (status === 'loading') return 'Menyiapkan file...';
        if (status === 'success') return 'Berhasil diunduh!';
        if (status === 'error') return 'Gagal — coba lagi';
        if (isDisabled && disabledReason) return disabledReason;
        return defaultLabel;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ekspor Data - SMKN 69 Jakarta" />
            <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header Title */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Pusat Unduhan &amp; Ekspor Data
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Unduh rekapitulasi data kedisiplinan siswa, data murid, dan akumulasi nilai kelas dalam format spreadsheet Excel (.xlsx).
                    </p>
                </div>

                {/* Ringkasan Data Tersedia */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center gap-3 shadow-2xs">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-[#1E5FA8]">
                            <FileSpreadsheet className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Laporan Terdata</p>
                            <p className="text-base font-bold text-slate-900">{counts?.laporan ?? 0} data</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center gap-3 shadow-2xs">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <GraduationCap className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Siswa Terdata</p>
                            <p className="text-base font-bold text-slate-900">{counts?.murid ?? 0} siswa</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-center gap-3 shadow-2xs">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <School className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Rombel Kelas</p>
                            <p className="text-base font-bold text-slate-900">{counts?.kelas ?? 0} kelas</p>
                        </div>
                    </div>
                </div>

                {errorMsg && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 text-xs font-semibold text-red-700 dark:text-red-400 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                            <XCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                            <span>{errorMsg}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMsg('')}
                            className="text-red-500 hover:text-red-800 dark:hover:text-red-200 text-xs font-bold px-2 py-1 ml-4 cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Card 1: Export Laporan */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#1E5FA8] border border-blue-100">
                                    <FileSpreadsheet className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Rekap Laporan Peristiwa</h2>
                                    <p className="text-xs text-slate-500">Pelanggaran &amp; Kebaikan Siswa</p>
                                </div>
                            </div>

                            <form id="form-export-laporan" onSubmit={handleExportLaporan} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Jenis Laporan <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <select
                                        value={laporanForm.kategori}
                                        onChange={(e) => setLaporanForm((p) => ({ ...p, kategori: e.target.value }))}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    >
                                        <option value="">Semua (Pelanggaran &amp; Prestasi)</option>
                                        <option value="pelanggaran">Pelanggaran</option>
                                        <option value="prestasi">Prestasi</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Filter Kelas <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <select
                                        value={laporanForm.kelas_id}
                                        onChange={(e) => setLaporanForm((p) => ({ ...p, kelas_id: e.target.value }))}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    >
                                        <option value="">Semua Kelas</option>
                                        {kelas_list.map((k) => (
                                             <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-slate-700">
                                            Rentang Tanggal <span className="text-slate-400 font-normal">(opsional)</span>
                                        </label>
                                        {(laporanForm.dari || laporanForm.sampai) && (
                                            <button
                                                type="button"
                                                onClick={() => setLaporanForm((p) => ({ ...p, dari: '', sampai: '' }))}
                                                className="text-[11px] font-medium text-[#1E5FA8] hover:underline cursor-pointer"
                                            >
                                                Reset Tanggal
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Dari Tanggal</span>
                                            <input
                                                type="date"
                                                value={laporanForm.dari}
                                                max={laporanForm.sampai || undefined}
                                                onChange={(e) => setLaporanForm((p) => ({ ...p, dari: e.target.value }))}
                                                className={`h-10 w-full rounded-lg border px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8] transition-colors ${
                                                    isDateInverted
                                                        ? 'border-red-300 bg-red-50/40 text-red-900 focus:border-red-500 focus:ring-red-500'
                                                        : isDateIncomplete && laporanForm.dari
                                                          ? 'border-amber-300 bg-amber-50/30'
                                                          : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Sampai Tanggal</span>
                                            <input
                                                type="date"
                                                value={laporanForm.sampai}
                                                min={laporanForm.dari || undefined}
                                                onChange={(e) => setLaporanForm((p) => ({ ...p, sampai: e.target.value }))}
                                                className={`h-10 w-full rounded-lg border px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8] transition-colors ${
                                                    isDateInverted
                                                        ? 'border-red-300 bg-red-50/40 text-red-900 focus:border-red-500 focus:ring-red-500'
                                                        : isDateIncomplete && laporanForm.sampai
                                                          ? 'border-amber-300 bg-amber-50/30'
                                                          : 'border-slate-200 bg-slate-50/50'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    {isDateInverted && (
                                        <p className="text-[11px] font-medium text-red-600 flex items-center gap-1.5 mt-1">
                                            <XCircle className="size-3.5 shrink-0" />
                                            Tanggal akhir tidak boleh mendahului tanggal awal.
                                        </p>
                                    )}
                                    {isDateIncomplete && (
                                        <p className="text-[11px] font-medium text-amber-600 flex items-center gap-1.5 mt-1">
                                            <span className="inline-block">⚠️</span>
                                            Lengkapi kedua tanggal untuk menyaring periode waktu, atau reset untuk unduh semua.
                                        </p>
                                    )}
                                </div>

                                {isNoLaporanData && (
                                    <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-3 text-xs text-slate-500 text-center">
                                        Belum ada data laporan yang tercatat dalam sistem.
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                form="form-export-laporan"
                                disabled={isLaporanDisabled}
                                className={btnClass(laporanStatus, isLaporanDisabled)}
                            >
                                {btnIcon(laporanStatus, isLaporanDisabled)}
                                <span>{btnLabel(laporanStatus, 'Unduh Laporan (.xlsx)', isLaporanDisabled, laporanDisabledReason)}</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Export Data Murid + Skor */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <GraduationCap className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Data Siswa + Peringkat Skor</h2>
                                    <p className="text-xs text-slate-500">Urut Poin Prestasi &amp; Pelanggaran</p>
                                </div>
                            </div>

                            <form id="form-export-murid" onSubmit={handleExportMurid} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Status Siswa
                                    </label>
                                    <select
                                        value={muridForm.status}
                                        onChange={(e) => setMuridForm((p) => ({ ...p, status: e.target.value }))}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    >
                                        <option value="aktif">Siswa Aktif</option>
                                        <option value="alumni">Alumni</option>
                                        <option value="semua">Semua Siswa (Aktif &amp; Alumni)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Filter Kelas <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <select
                                        value={muridForm.kelas_id}
                                        onChange={(e) => setMuridForm((p) => ({ ...p, kelas_id: e.target.value }))}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    >
                                        <option value="">Semua Kelas</option>
                                        {kelas_list.map((k) => (
                                            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-600 space-y-1">
                                    <span className="font-semibold text-slate-800">Kolom Data Excel:</span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Peringkat, Nama Siswa, NIS, NISN, Kelas, Status, Poin Prestasi, Poin Pelanggaran, Skor Bersih, Kualifikasi, Tahap Pembinaan.
                                    </p>
                                </div>

                                {isNoMuridData && (
                                    <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-3 text-xs text-slate-500 text-center">
                                        Belum ada data siswa yang tercatat dalam sistem.
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                form="form-export-murid"
                                disabled={isMuridDisabled}
                                className={btnClass(muridStatus, isMuridDisabled)}
                            >
                                {btnIcon(muridStatus, isMuridDisabled)}
                                <span>{btnLabel(muridStatus, 'Unduh Data Siswa (.xlsx)', isMuridDisabled, muridDisabledReason)}</span>
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Export Data Kelas + Akumulasi Skor */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                                    <School className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">Data Kelas + Akumulasi Skor</h2>
                                    <p className="text-xs text-slate-500">Peringkat &amp; Rata-rata Skor Kelas</p>
                                </div>
                            </div>

                            <form id="form-export-kelas" onSubmit={handleExportKelas} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Pilih Kelas Spesifik <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <select
                                        value={kelasForm.kelas_id}
                                        onChange={(e) => setKelasForm((p) => ({ ...p, kelas_id: e.target.value }))}
                                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    >
                                        <option value="">Semua Kelas (Ranking Total)</option>
                                        {kelas_list.map((k) => (
                                            <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-3 text-xs text-slate-600 space-y-1">
                                    <span className="font-semibold text-slate-800">Kolom Data Excel:</span>
                                    <p className="text-[11px] text-slate-500 leading-relaxed">
                                        Peringkat, Nama Kelas, Tingkat, Wali Kelas, Jumlah Murid, Total Akumulasi Poin, Rata-rata Poin.
                                    </p>
                                </div>

                                {isNoKelasData && (
                                    <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-3 text-xs text-slate-500 text-center">
                                        Belum ada data rombel kelas yang tercatat dalam sistem.
                                    </div>
                                )}
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                form="form-export-kelas"
                                disabled={isKelasDisabled}
                                className={btnClass(kelasStatus, isKelasDisabled)}
                            >
                                {btnIcon(kelasStatus, isKelasDisabled)}
                                <span>{btnLabel(kelasStatus, 'Unduh Data Kelas (.xlsx)', isKelasDisabled, kelasDisabledReason)}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
