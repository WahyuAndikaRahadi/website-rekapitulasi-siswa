import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatIndonesianDate } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { type PoinMasterItem } from '@/components/tambah-catatan-modal';

interface LaporanDetail {
    id: number;
    tanggal_kejadian: string;
    murid: { id: number; nama: string; nis: string | null; nisn?: string | null; no_telp?: string | null; nama_kelas: string };
    guru: { id: number; nama: string; no_telp?: string | null };
    kategori: string;
    tingkat_keparahan: string;
    keterangan: string;
    is_manual: boolean;
    needs_verification: boolean;
    poin_diberikan: number | null;
    keterangan_tambahan: string | null;
    status: string;
    tindak_lanjut: string | null;
    ditindaklanjuti_oleh: string | null;
    ditindaklanjuti_at: string | null;
    bukti: { id: number; nama_asli: string; url: string }[];
}

interface Props {
    laporan: LaporanDetail;
    poin_ranges?: Record<string, Record<string, { min: number; max: number }>>;
    poin_masters?: PoinMasterItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Laporan Masuk', href: '/admin/laporan' },
    { title: 'Detail', href: '#' },
];

export default function AdminLaporanShow({ laporan, poin_ranges = {}, poin_masters = [] }: Props) {
    const isManualPending = laporan.status === 'menunggu verifikasi';
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Form verifikasi khusus untuk laporan manual yang masih pending
    const { data, setData, patch, processing, errors } = useForm({
        status: 'baru dilaporkan' as 'baru dilaporkan' | 'ditolak',
        tindak_lanjut: laporan.tindak_lanjut ?? '',
        poin_diberikan: (laporan.poin_diberikan ?? '') as string | number,
    });

    const handleVerificationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/laporan/${laporan.id}/tindaklanjut`);
    };

    const handleQuickStatusChange = (newStatus: string) => {
        setUpdatingStatus(true);
        router.patch(
            `/admin/laporan/${laporan.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingStatus(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Laporan #${laporan.id}`} />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/laporan" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold">Detail Laporan #{laporan.id}</h1>
                                <StatusBadge status={laporan.status} />
                                {laporan.is_manual && (
                                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold border border-amber-300">
                                        Input Manual
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner jika Menunggu Verifikasi */}
                {isManualPending && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-2xs dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-3">
                        <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                            <p className="font-bold text-sm">Laporan Manual Memerlukan Verifikasi</p>
                            <p>
                                Laporan ini dibuat dengan input manual oleh guru. Poin belum diterapkan ke saldo siswa sebelum admin menyetujui laporan di bawah ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* Status Switcher untuk Laporan yang sudah aktif */}
                {!isManualPending && (
                    <div className="rounded-xl border bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status & Alur Pembinaan</p>
                            <p className="text-sm text-foreground mt-0.5">Ubah status pembinaan siswa secara berkala:</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={laporan.status}
                                disabled={updatingStatus}
                                onChange={(e) => handleQuickStatusChange(e.target.value)}
                                className={`h-9 rounded-md border text-xs font-bold px-3 focus:outline-none focus:ring-2 transition-all ${
                                    laporan.status === 'baru dilaporkan'
                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                        : laporan.status === 'pembinaan tindak lanjut'
                                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                                          : laporan.status === 'selesai'
                                            ? 'bg-green-50 text-green-800 border-green-200'
                                            : 'bg-muted text-muted-foreground'
                                }`}
                            >
                                <option value="baru dilaporkan">Baru Dilaporkan</option>
                                <option value="pembinaan tindak lanjut">Pembinaan Tindak Lanjut</option>
                                <option value="selesai">Selesai</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Info Laporan */}
                <div className="rounded-lg border bg-white shadow-xs overflow-hidden">
                    <div className="border-b bg-muted/30 px-5 py-3.5">
                        <h2 className="text-sm font-semibold text-foreground">Informasi Laporan</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Murid Terlapor</p>
                            <p className="mt-0.5 font-bold text-foreground">{laporan.murid.nama}</p>
                            <p className="text-xs text-muted-foreground">
                                {laporan.murid.nama_kelas}
                                {laporan.murid.nis ? ` · NIS: ${laporan.murid.nis}` : ''}
                                {laporan.murid.nisn ? ` · NISN: ${laporan.murid.nisn}` : ''}
                                {laporan.murid.no_telp ? ` · Telp: ${laporan.murid.no_telp}` : ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Dilaporkan oleh</p>
                            <p className="mt-0.5 font-medium">{laporan.guru.nama}</p>
                            {laporan.guru.no_telp && (
                                <p className="text-xs font-mono text-muted-foreground">Telp: {laporan.guru.no_telp}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tanggal Kejadian</p>
                            <p className="mt-0.5 font-medium text-sm">{formatIndonesianDate(laporan.tanggal_kejadian, true)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Kategori Tindakan</p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <StatusBadge status={laporan.kategori} />
                                {laporan.tingkat_keparahan && (
                                    <span className="text-xs font-semibold capitalize text-muted-foreground">
                                        Tingkat {laporan.tingkat_keparahan}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Nilai Poin</p>
                            {laporan.poin_diberikan !== null ? (
                                <p className={`mt-0.5 text-lg font-black font-mono ${laporan.poin_diberikan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {laporan.poin_diberikan >= 0 ? `+${laporan.poin_diberikan}` : laporan.poin_diberikan} Poin
                                </p>
                            ) : (
                                <p className="mt-0.5 text-sm text-muted-foreground italic">Belum ditentukan</p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">Keterangan / Jenis Tindakan</p>
                            <p className="mt-1 font-medium text-foreground bg-muted/20 p-3 rounded-md border text-sm">
                                {laporan.keterangan}
                            </p>
                        </div>
                        {laporan.keterangan_tambahan && (
                            <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground">Kronologi / Catatan Tambahan</p>
                                <p className="mt-1 text-sm text-foreground bg-muted/10 p-3 rounded-md border">
                                    {laporan.keterangan_tambahan}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bukti Foto */}
                {laporan.bukti.length > 0 && (
                    <div className="rounded-lg border bg-white shadow-xs">
                        <div className="border-b px-5 py-3">
                            <h2 className="text-sm font-semibold">Bukti Foto ({laporan.bukti.length})</h2>
                        </div>
                        <div className="flex flex-wrap gap-3 p-5">
                            {laporan.bukti.map((b) => (
                                <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" className="block group">
                                    <img src={b.url} alt={b.nama_asli} className="h-28 w-28 rounded-md border object-cover group-hover:opacity-90 shadow-xs" />
                                    <p className="mt-1 max-w-28 truncate text-xs text-muted-foreground">{b.nama_asli}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Form Verifikasi Khusus Laporan Manual yang Masih Menunggu Verifikasi */}
                {isManualPending && (
                    <div className="rounded-lg border border-amber-300 bg-white shadow-xs overflow-hidden">
                        <div className="border-b bg-amber-50/70 px-5 py-3.5">
                            <h2 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                <Sparkles className="size-4" />
                                Form Verifikasi Laporan Manual Admin
                            </h2>
                        </div>
                        <form onSubmit={handleVerificationSubmit} className="space-y-4 p-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold">Keputusan Verifikasi <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    {[
                                        { val: 'baru dilaporkan', label: 'Setujui & Terapkan Poin', cls: 'text-green-700 font-bold' },
                                        { val: 'ditolak', label: 'Tolak Laporan', cls: 'text-red-700 font-bold' },
                                    ].map((opt) => (
                                        <label key={opt.val} className="flex cursor-pointer items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={opt.val}
                                                checked={data.status === opt.val}
                                                onChange={() => setData('status', opt.val as typeof data.status)}
                                                className="accent-primary"
                                            />
                                            <span className={opt.cls}>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.status && <p className="text-xs text-red-600">{errors.status}</p>}
                            </div>

                            {data.status === 'baru dilaporkan' && (
                                <div className="space-y-1.5 rounded-lg border p-3.5 bg-muted/20">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Konfirmasi Nilai Poin <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.poin_diberikan}
                                        onChange={(e) => setData('poin_diberikan', e.target.value === '' ? '' : parseInt(e.target.value))}
                                        placeholder={laporan.kategori === 'pelanggaran' ? 'Masukkan poin negatif (misal -10)' : 'Masukkan poin positif (misal 10)'}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono font-bold"
                                    />
                                    {errors.poin_diberikan && <p className="text-xs text-red-600">{errors.poin_diberikan}</p>}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Catatan Verifikasi Admin (Opsional)
                                </label>
                                <textarea
                                    value={data.tindak_lanjut}
                                    onChange={(e) => setData('tindak_lanjut', e.target.value)}
                                    rows={3}
                                    placeholder="Tuliskan catatan verifikasi atau alasan penolakan..."
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {errors.tindak_lanjut && <p className="text-xs text-red-600">{errors.tindak_lanjut}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="submit"
                                    isLoading={processing}
                                    loadingText="Menyimpan..."
                                >
                                    Simpan Keputusan Verifikasi
                                </Button>
                                <Link href="/admin/laporan">
                                    <Button variant="secondary" type="button">
                                        Kembali
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </div>
                )}

                {/* Catatan Verifikasi / Tindak Lanjut yang sudah tercatat */}
                {!isManualPending && laporan.tindak_lanjut && (
                    <div className="rounded-lg border bg-white shadow-xs p-5 space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan Admin</p>
                        <p className="text-sm text-foreground">{laporan.tindak_lanjut}</p>
                        <p className="text-xs text-muted-foreground pt-1">
                            Oleh <span className="font-medium">{laporan.ditindaklanjuti_oleh ?? 'Admin'}</span>
                            {laporan.ditindaklanjuti_at && ` · ${laporan.ditindaklanjuti_at}`}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
