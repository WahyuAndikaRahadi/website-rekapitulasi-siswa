import { StatusBadge } from '@/components/status-badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface LaporanDetail {
    id: number;
    tanggal_kejadian: string;
    murid: { id: number; nama: string; nis: string | null; nama_kelas: string };
    guru: { id: number; nama: string };
    jenis_pelanggaran: { id: number; kode: string; keterangan: string; kategori: string; tingkat_keparahan: string | null };
    poin_diberikan: number;
    keterangan_tambahan: string | null;
    status: string;
    tindak_lanjut: string | null;
    ditindaklanjuti_oleh: string | null;
    ditindaklanjuti_at: string | null;
    tahun_ajaran: string;
    bukti: { id: number; nama_asli: string; url: string }[];
}

interface Props { laporan: LaporanDetail }

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Laporan Masuk', href: '/admin/laporan' },
    { title: 'Detail', href: '#' },
];

export default function AdminLaporanShow({ laporan }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        status: 'ditindaklanjuti' as 'ditindaklanjuti' | 'ditolak',
        tindak_lanjut: laporan.tindak_lanjut ?? '',
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
                <div className="rounded-lg border bg-white">
                    <div className="border-b px-5 py-3">
                        <h2 className="text-sm font-medium">Informasi Laporan</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Murid</p>
                            <p className="mt-0.5 font-medium">{laporan.murid.nama}</p>
                            <p className="text-sm text-muted-foreground">{laporan.murid.nama_kelas}{laporan.murid.nis ? ` · NIS: ${laporan.murid.nis}` : ''}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Dilaporkan oleh</p>
                            <p className="mt-0.5 font-medium">{laporan.guru.nama}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tanggal Kejadian</p>
                            <p className="mt-0.5 font-medium">{laporan.tanggal_kejadian}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tahun Ajaran</p>
                            <p className="mt-0.5 font-medium">{laporan.tahun_ajaran}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Jenis</p>
                            <p className="mt-0.5 font-medium">{laporan.jenis_pelanggaran.keterangan}</p>
                            <div className="mt-1 flex gap-1">
                                <StatusBadge status={laporan.jenis_pelanggaran.kategori} />
                                {laporan.jenis_pelanggaran.tingkat_keparahan && (
                                    <StatusBadge status={laporan.jenis_pelanggaran.tingkat_keparahan} />
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Poin</p>
                            <p className={`mt-0.5 text-lg font-semibold ${laporan.poin_diberikan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {laporan.poin_diberikan >= 0 ? '+' : ''}{laporan.poin_diberikan}
                            </p>
                        </div>
                        {laporan.keterangan_tambahan && (
                            <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground">Keterangan Tambahan</p>
                                <p className="mt-0.5 text-sm">{laporan.keterangan_tambahan}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bukti foto */}
                {laporan.bukti.length > 0 && (
                    <div className="rounded-lg border bg-white">
                        <div className="border-b px-5 py-3">
                            <h2 className="text-sm font-medium">Bukti Foto ({laporan.bukti.length})</h2>
                        </div>
                        <div className="flex flex-wrap gap-3 p-5">
                            {laporan.bukti.map((b) => (
                                <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer" className="block">
                                    <img src={b.url} alt={b.nama_asli} className="h-28 w-28 rounded-md border object-cover hover:opacity-90" />
                                    <p className="mt-1 max-w-28 truncate text-xs text-muted-foreground">{b.nama_asli}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Riwayat tindak lanjut (kalau sudah ditindaklanjuti) */}
                {sudahDitindaklanjuti && laporan.tindak_lanjut && (
                    <div className="rounded-lg border bg-white">
                        <div className="border-b px-5 py-3">
                            <h2 className="text-sm font-medium">Catatan Tindak Lanjut</h2>
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
                    <div className="rounded-lg border bg-white">
                        <div className="border-b px-5 py-3">
                            <h2 className="text-sm font-medium">Tindak Lanjut</h2>
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

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Catatan Tindak Lanjut <span className="text-red-500">*</span></label>
                                <textarea value={data.tindak_lanjut} onChange={(e) => setData('tindak_lanjut', e.target.value)}
                                    rows={4} placeholder="Tuliskan catatan, sanksi, atau alasan penolakan..."
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                                {errors.tindak_lanjut && <p className="text-xs text-red-600">{errors.tindak_lanjut}</p>}
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" disabled={processing}
                                    className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                    {processing && <Loader2 className="size-4 animate-spin" />}
                                    Simpan Keputusan
                                </button>
                                <Link href="/admin/laporan" className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted">
                                    Kembali
                                </Link>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
