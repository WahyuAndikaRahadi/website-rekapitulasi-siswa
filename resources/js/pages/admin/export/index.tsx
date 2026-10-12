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

function getCsrfToken(): string {
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return '';
}

async function fetchDownload(url: string, formData: Record<string, string>): Promise<void> {
    const csrfToken = getCsrfToken();

    const params = new URLSearchParams();
    if (csrfToken) {
        params.append('_token', csrfToken);
    }
    Object.entries(formData).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params.append(k, v);
    });

    const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*',
    };
    if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: params,
    });

    if (!response.ok) {
        let errorMsg = `Gagal mengunduh file (HTTP ${response.status})`;
        try {
            const data = await response.json();
            if (data?.message) {
                errorMsg = data.message;
            }
        } catch {
            const text = await response.text();
            if (text && text.length < 200) {
                errorMsg = text;
            }
        }
        throw new Error(errorMsg);
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
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const handleExportLaporan = (e: React.FormEvent) => {
        e.preventDefault();
        handleExport('/admin/export/laporan', laporanForm, setLaporanStatus);
    };

    const handleExportMurid = (e: React.FormEvent) => {
        e.preventDefault();
        handleExport('/admin/export/murid', muridForm, setMuridStatus);
    };

    const handleExportKelas = (e: React.FormEvent) => {
        e.preventDefault();
        handleExport('/admin/export/kelas', kelasForm, setKelasStatus);
    };

    const btnClass = (status: DownloadStatus) => {
        if (status === 'loading')
            return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-400 text-white text-xs font-semibold shadow-xs cursor-wait';
        if (status === 'success')
            return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs';
        if (status === 'error')
            return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-xs cursor-pointer';
        return 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer';
    };

    const btnIcon = (status: DownloadStatus) => {
        if (status === 'loading') return <Loader2 className="size-4 animate-spin" />;
        if (status === 'success') return <CheckCircle2 className="size-4" />;
        if (status === 'error') return <XCircle className="size-4" />;
        return <Download className="size-4" />;
    };

    const btnLabel = (status: DownloadStatus, defaultLabel: string) => {
        if (status === 'loading') return 'Menyiapkan file...';
        if (status === 'success') return 'Berhasil diunduh!';
        if (status === 'error') return 'Gagal — coba lagi';
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
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
                        {errorMsg}
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

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">Dari Tanggal</label>
                                        <input
                                            type="date"
                                            value={laporanForm.dari}
                                            onChange={(e) => setLaporanForm((p) => ({ ...p, dari: e.target.value }))}
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-700">Sampai Tanggal</label>
                                        <input
                                            type="date"
                                            value={laporanForm.sampai}
                                            onChange={(e) => setLaporanForm((p) => ({ ...p, sampai: e.target.value }))}
                                            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={laporanStatus === 'loading'}
                                onClick={() => handleExport('/admin/export/laporan', laporanForm, setLaporanStatus)}
                                className={btnClass(laporanStatus)}
                            >
                                {btnIcon(laporanStatus)}
                                <span>{btnLabel(laporanStatus, 'Unduh Laporan (.xlsx)')}</span>
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
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={muridStatus === 'loading'}
                                onClick={() => handleExport('/admin/export/murid', muridForm, setMuridStatus)}
                                className={btnClass(muridStatus)}
                            >
                                {btnIcon(muridStatus)}
                                <span>{btnLabel(muridStatus, 'Unduh Data Siswa (.xlsx)')}</span>
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
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={kelasStatus === 'loading'}
                                onClick={() => handleExport('/admin/export/kelas', kelasForm, setKelasStatus)}
                                className={btnClass(kelasStatus)}
                            >
                                {btnIcon(kelasStatus)}
                                <span>{btnLabel(kelasStatus, 'Unduh Data Kelas (.xlsx)')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
