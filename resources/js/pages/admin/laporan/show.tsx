import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import React from 'react';

interface LaporanDetail {
    id: number;
    tanggal_kejadian: string;
    murid: { id: number; nama: string; nis: string | null; nisn?: string | null; nama_kelas: string };
    guru: { id: number; nama: string };
    kategori: string;
    tingkat_keparahan: string;
    keterangan: string;
    poin_diberikan: number | null;
    keterangan_tambahan: string | null;
    status: string;
    tindak_lanjut: string | null;
    ditindaklanjuti_oleh: string | null;
    ditindaklanjuti_at: string | null;
    tahun_ajaran: string;
    bukti: { id: number; nama_asli: string; url: string }[];
}

interface Props {
    laporan: LaporanDetail;
    poin_ranges?: Record<string, Record<string, { min: number; max: number }>>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Laporan Masuk', href: '/admin/laporan' },
    { title: 'Detail', href: '#' },
];

export default function AdminLaporanShow({ laporan, poin_ranges = {} }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        status: 'ditindaklanjuti' as 'ditindaklanjuti' | 'ditolak',
        tindak_lanjut: laporan.tindak_lanjut ?? '',
        poin_diberikan: '' as string | number,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/admin/laporan/${laporan.id}/tindaklanjut`);
    };

    const sudahDitindaklanjuti = laporan.status !== 'pending';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Laporan #${laporan.id}`} />
            <div className="mx-auto max-w-3xl space-y-6 p-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/laporan" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <h1 className="text-xl font-semibold">Detail Laporan #{laporan.id}</h1>
                    <StatusBadge status={laporan.status} />
                </div>

                {/* Info laporan */}
                <div className="rounded-lg border bg-white shadow-xs">
                    <div className="border-b px-5 py-3">
                        <h2 className="text-sm font-semibold">Informasi Laporan</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Murid</p>
                            <p className="mt-0.5 font-semibold text-foreground">{laporan.murid.nama}</p>
                            <p className="text-sm text-muted-foreground">
                                {laporan.murid.nama_kelas}
                                {laporan.murid.nis ? ` · NIS: ${laporan.murid.nis}` : ''}
                                {laporan.murid.nisn ? ` · NISN: ${laporan.murid.nisn}` : ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Dilaporkan oleh</p>
                            <p className="mt-0.5 font-medium">{laporan.guru.nama}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tanggal Kejadian</p>
                            <p className="mt-0.5 font-medium font-mono text-sm">{laporan.tanggal_kejadian}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tahun Ajaran</p>
                            <p className="mt-0.5 font-medium">{laporan.tahun_ajaran}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Kategori & Tingkat</p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <StatusBadge status={laporan.kategori} />
                                <span className="text-xs font-semibold capitalize text-muted-foreground">
                                    Tingkat {laporan.tingkat_keparahan}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Rekomendasi Poin Skor</p>
                            {laporan.poin_diberikan !== null ? (
                                <p className={`mt-0.5 text-lg font-bold font-mono ${laporan.poin_diberikan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {laporan.poin_diberikan >= 0 ? '+' : ''}{laporan.poin_diberikan}
                                </p>
                            ) : (
                                <p className="mt-0.5 text-sm text-muted-foreground italic">Ditentukan admin</p>
                            )}
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs text-muted-foreground">Keterangan / Tindakan</p>
                            <p className="mt-0.5 font-medium text-foreground bg-muted/30 p-3 rounded-md border text-sm">
                                {laporan.keterangan}
                            </p>
                        </div>
                        {laporan.keterangan_tambahan && (
                            <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground">Kronologi / Catatan Tambahan</p>
                                <p className="mt-0.5 text-sm text-foreground bg-muted/20 p-3 rounded-md border">
                                    {laporan.keterangan_tambahan}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bukti foto */}
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

                {/* Riwayat tindak lanjut (kalau sudah ditindaklanjuti) */}
                {sudahDitindaklanjuti && laporan.tindak_lanjut && (
                    <div className="rounded-lg border bg-white shadow-xs">
                        <div className="border-b px-5 py-3">
                            <h2 className="text-sm font-semibold">Catatan Tindak Lanjut</h2>
                        </div>
                        <div className="p-5">
                            <p className="text-sm">{laporan.tindak_lanjut}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Oleh <span className="font-medium">{laporan.ditindaklanjuti_oleh}</span>
                                {laporan.ditindaklanjuti_at && ` · ${laporan.ditindaklanjuti_at}`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Form tindak lanjut — hanya kalau masih pending */}
                {!sudahDitindaklanjuti && (
                    <div className="rounded-lg border bg-white shadow-xs">
                        <div className="border-b px-5 py-3">
                            <h2 className="text-sm font-semibold">Tindak Lanjut</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4 p-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Keputusan <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    {[
                                        { val: 'ditindaklanjuti', label: 'Setujui & Tindaklanjuti', cls: 'text-green-700' },
                                        { val: 'ditolak', label: 'Tolak Laporan', cls: 'text-red-700' },
                                    ].map((opt) => (
                                        <label key={opt.val} className="flex cursor-pointer items-center gap-2 text-sm">
                                            <input type="radio" name="status" value={opt.val}
                                                checked={data.status === opt.val}
                                                onChange={() => setData('status', opt.val as typeof data.status)}
                                                className="accent-primary" />
                                            <span className={opt.cls + ' font-medium'}>{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.status && <p className="text-xs text-red-600">{errors.status}</p>}
                            </div>

                            {/* Poin field — only shown when approving */}
                            {data.status === 'ditindaklanjuti' && (() => {
                                const range = poin_ranges[laporan.kategori]?.[laporan.tingkat_keparahan];
                                const isPelanggaran = laporan.kategori === 'pelanggaran';
                                const poinVal = typeof data.poin_diberikan === 'number' ? data.poin_diberikan : null;
                                const hasValue = poinVal !== null && !isNaN(poinVal) && data.poin_diberikan !== '';
                                return (
                                    <div className={`rounded-xl border-2 p-4 space-y-3 transition-colors ${
                                        isPelanggaran
                                            ? 'border-red-200 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20'
                                            : 'border-green-200 bg-green-50/60 dark:border-green-900 dark:bg-green-950/20'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="poin_diberikan" className={`text-sm font-bold flex items-center gap-1.5 ${isPelanggaran ? 'text-red-800' : 'text-green-800'}`}>
                                                <Sparkles className="size-4" />
                                                <span>Tetapkan Poin {isPelanggaran ? 'Pelanggaran' : 'Kebaikan'}</span>
                                            </label>
                                            {/* Live preview badge */}
                                            <span className={`text-2xl font-black font-mono tracking-tight transition-all ${
                                                hasValue
                                                    ? isPelanggaran
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                    : 'text-muted-foreground/40'
                                            }`}>
                                                {hasValue
                                                    ? (poinVal! > 0 ? `+${poinVal}` : `${poinVal}`)
                                                    : (isPelanggaran ? '−?' : '+?')}
                                            </span>
                                        </div>

                                        {range && (
                                            <p className={`text-xs font-medium ${isPelanggaran ? 'text-red-700/80 dark:text-red-400' : 'text-green-700/80 dark:text-green-400'}`}>
                                                Rentang acuan tingkat <span className="capitalize font-bold">{laporan.tingkat_keparahan}</span>:
                                                <span className="font-mono ml-1">{range.min} s/d {range.max} poin</span>
                                            </p>
                                        )}

                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="poin_diberikan"
                                                value={data.poin_diberikan}
                                                onChange={(e) => setData('poin_diberikan', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                placeholder={isPelanggaran ? 'Masukkan poin negatif, misal: -10' : 'Masukkan poin positif, misal: 20'}
                                                className={`flex h-12 w-full rounded-lg border-2 bg-white dark:bg-background px-4 py-2 text-lg font-mono font-bold placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 transition-all ${
                                                    isPelanggaran
                                                        ? 'border-red-300 focus-visible:ring-red-400 dark:border-red-800'
                                                        : 'border-green-300 focus-visible:ring-green-400 dark:border-green-800'
                                                } ${errors.poin_diberikan ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.poin_diberikan && (
                                            <p className="text-xs font-medium text-red-600 flex items-center gap-1.5">
                                                <AlertCircle className="size-3.5" />
                                                <span>{errors.poin_diberikan}</span>
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Catatan Tindak Lanjut <span className="text-red-500">*</span></label>
                                <textarea value={data.tindak_lanjut} onChange={(e) => setData('tindak_lanjut', e.target.value)}
                                    rows={4} placeholder="Tuliskan catatan, sanksi, atau alasan penolakan..."
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                {errors.tindak_lanjut && <p className="text-xs text-red-600">{errors.tindak_lanjut}</p>}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    isLoading={processing}
                                    loadingText="Menyimpan..."
                                >
                                    Simpan Keputusan
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
            </div>
        </AppLayout>
    );
}
