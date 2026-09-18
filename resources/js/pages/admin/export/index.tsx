import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, FileSpreadsheet, GraduationCap, School } from 'lucide-react';
import React, { useState } from 'react';

interface KelasItem { id: number; nama_kelas: string; }

interface Props {
    kelas_list: KelasItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Ekspor Data', href: '/admin/export' },
];

export default function ExportIndex({ kelas_list = [] }: Props) {
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

    const submitDownloadForm = (actionUrl: string, formData: Record<string, string>) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = actionUrl;
        Object.entries(formData).forEach(([k, v]) => {
            if (v) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = k;
                input.value = v;
                form.appendChild(input);
            }
        });
        let csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        if (!csrf) {
            const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
            if (match) {
                csrf = decodeURIComponent(match[1]);
            }
        }
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrf;
        form.appendChild(csrfInput);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const handleExportLaporan = (e: React.FormEvent) => {
        e.preventDefault();
        submitDownloadForm('/admin/export/laporan', laporanForm);
    };

    const handleExportMurid = (e: React.FormEvent) => {
        e.preventDefault();
        submitDownloadForm('/admin/export/murid', muridForm);
    };

    const handleExportKelas = (e: React.FormEvent) => {
        e.preventDefault();
        submitDownloadForm('/admin/export/kelas', kelasForm);
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
                                type="submit"
                                form="form-export-laporan"
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                                <Download className="size-4" />
                                <span>Unduh Laporan (.xlsx)</span>
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
                                        Peringkat, Nama Siswa, NIS, NISN, Kelas, Poin Prestasi, Poin Pelanggaran, Kualifikasi, Tahap Pembinaan.
                                    </p>
                                </div>
                            </form>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                form="form-export-murid"
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                                <Download className="size-4" />
                                <span>Unduh Data Siswa (.xlsx)</span>
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
                                type="submit"
                                form="form-export-kelas"
                                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] hover:from-[#081B42] hover:to-[#174D88] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                            >
                                <Download className="size-4" />
                                <span>Unduh Data Kelas (.xlsx)</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
