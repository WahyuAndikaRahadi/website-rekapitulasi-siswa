import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface KelasItem { id: number; nama_kelas: string; }
interface TahunAjaranItem { id: number; label: string; }

interface Props {
    kelas_list: KelasItem[];
    tahun_ajarans: TahunAjaranItem[];
    tahun_ajaran_aktif: { id: number; label: string } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Export Data', href: '/admin/export' },
];

export default function ExportIndex({ kelas_list, tahun_ajarans, tahun_ajaran_aktif }: Props) {
    const [laporanForm, setLaporanForm] = useState({
        tahun_ajaran_id: tahun_ajaran_aktif?.id.toString() ?? '',
        kelas_id: '',
        dari: '',
        sampai: '',
    });

    const [muridForm, setMuridForm] = useState({
        tahun_ajaran_id: tahun_ajaran_aktif?.id.toString() ?? '',
        kelas_id: '',
    });

    const buildQuery = (params: Record<string, string>) => {
        const q = Object.entries(params)
            .filter(([, v]) => v !== '')
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');
        return q ? `?${q}` : '';
    };

    const handleExportLaporan = (e: React.FormEvent) => {
        e.preventDefault();
        // POST ke endpoint download — gunakan form submit biasa agar browser trigger download
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/admin/export/laporan';
        Object.entries(laporanForm).forEach(([k, v]) => {
            if (v) {
                const input = document.createElement('input');
                input.type = 'hidden'; input.name = k; input.value = v;
                form.appendChild(input);
            }
        });
        // CSRF
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden'; csrfInput.name = '_token'; csrfInput.value = csrf;
        form.appendChild(csrfInput);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    const handleExportMurid = (e: React.FormEvent) => {
        e.preventDefault();
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/admin/export/murid';
        Object.entries(muridForm).forEach(([k, v]) => {
            if (v) {
                const input = document.createElement('input');
                input.type = 'hidden'; input.name = k; input.value = v;
                form.appendChild(input);
            }
        });
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden'; csrfInput.name = '_token'; csrfInput.value = csrf;
        form.appendChild(csrfInput);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Export Data" />
            <div className="space-y-6 p-6">
                <h1 className="text-xl font-semibold">Export Data</h1>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Export Laporan */}
                    <div className="rounded-lg border bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="size-5 text-muted-foreground" />
                            <h2 className="text-sm font-medium">Export Rekap Laporan</h2>
                        </div>
                        <form onSubmit={handleExportLaporan} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Tahun Ajaran <span className="text-red-500">*</span></label>
                                <select value={laporanForm.tahun_ajaran_id}
                                    onChange={(e) => setLaporanForm((p) => ({ ...p, tahun_ajaran_id: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <option value="">Pilih tahun ajaran</option>
                                    {tahun_ajarans.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Kelas <span className="text-muted-foreground font-normal">(kosongkan = semua kelas)</span></label>
                                <select value={laporanForm.kelas_id}
                                    onChange={(e) => setLaporanForm((p) => ({ ...p, kelas_id: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <option value="">Semua Kelas</option>
                                    {kelas_list.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Dari</label>
                                    <input type="date" value={laporanForm.dari}
                                        onChange={(e) => setLaporanForm((p) => ({ ...p, dari: e.target.value }))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Sampai</label>
                                    <input type="date" value={laporanForm.sampai}
                                        onChange={(e) => setLaporanForm((p) => ({ ...p, sampai: e.target.value }))}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                </div>
                            </div>
                            <button type="submit" disabled={!laporanForm.tahun_ajaran_id}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                <Download className="size-4" /> Download Laporan (.xlsx)
                            </button>
                        </form>
                    </div>

                    {/* Export Murid */}
                    <div className="rounded-lg border bg-white p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="size-5 text-muted-foreground" />
                            <h2 className="text-sm font-medium">Export Data Murid + Skor</h2>
                        </div>
                        <form onSubmit={handleExportMurid} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Tahun Ajaran <span className="text-red-500">*</span></label>
                                <select value={muridForm.tahun_ajaran_id}
                                    onChange={(e) => setMuridForm((p) => ({ ...p, tahun_ajaran_id: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <option value="">Pilih tahun ajaran</option>
                                    {tahun_ajarans.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Kelas <span className="text-muted-foreground font-normal">(kosongkan = semua kelas)</span></label>
                                <select value={muridForm.kelas_id}
                                    onChange={(e) => setMuridForm((p) => ({ ...p, kelas_id: e.target.value }))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <option value="">Semua Kelas</option>
                                    {kelas_list.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                                </select>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                File Excel berisi: Nama, NIS, NISN, Kelas, Skor Resmi, Skor Sementara.
                            </p>
                            <button type="submit" disabled={!muridForm.tahun_ajaran_id}
                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                <Download className="size-4" /> Download Data Murid (.xlsx)
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
