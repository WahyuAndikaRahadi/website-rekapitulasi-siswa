import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

interface JenisData {
    id?: number;
    kode: string;
    keterangan: string;
    kategori: 'pelanggaran' | 'kebaikan';
    tingkat_keparahan: string | null;
    poin: number;
    is_active: boolean;
}

interface Props { jenis_pelanggaran: JenisData | null }

export default function JenisPelanggaranForm({ jenis_pelanggaran }: Props) {
    const isEdit = !!jenis_pelanggaran?.id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Master Data Jenis', href: '/admin/master/jenis-pelanggaran' },
        { title: isEdit ? 'Edit' : 'Tambah', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        kode:               jenis_pelanggaran?.kode             ?? '',
        keterangan:         jenis_pelanggaran?.keterangan        ?? '',
        kategori:           jenis_pelanggaran?.kategori          ?? 'pelanggaran' as 'pelanggaran' | 'kebaikan',
        tingkat_keparahan:  jenis_pelanggaran?.tingkat_keparahan ?? '',
        poin:               jenis_pelanggaran?.poin              ?? 0,
        is_active:          jenis_pelanggaran?.is_active         ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/master/jenis-pelanggaran/${jenis_pelanggaran!.id}`);
        } else {
            post('/admin/master/jenis-pelanggaran');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Jenis' : 'Tambah Jenis'} />
            <div className="mx-auto max-w-lg p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">{isEdit ? 'Edit Jenis' : 'Tambah Jenis Baru'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Kategori */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Kategori <span className="text-red-500">*</span></label>
                        <div className="flex gap-4">
                            {[{ val: 'pelanggaran', label: 'Pelanggaran' }, { val: 'kebaikan', label: 'Kebaikan' }].map((opt) => (
                                <label key={opt.val} className="flex cursor-pointer items-center gap-2 text-sm">
                                    <input type="radio" name="kategori" value={opt.val}
                                        checked={data.kategori === opt.val}
                                        onChange={() => { setData('kategori', opt.val as typeof data.kategori); setData('tingkat_keparahan', ''); }}
                                        className="accent-primary" />
                                    <span className="font-medium">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                        {errors.kategori && <p className="text-xs text-red-600">{errors.kategori}</p>}
                    </div>

                    {/* Kode */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Kode <span className="text-red-500">*</span></label>
                        <input type="text" value={data.kode} onChange={(e) => setData('kode', e.target.value.toUpperCase())}
                            placeholder={data.kategori === 'pelanggaran' ? 'P01' : 'K01'} maxLength={10}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.kode && <p className="text-xs text-red-600">{errors.kode}</p>}
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Keterangan <span className="text-red-500">*</span></label>
                        <input type="text" value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)}
                            placeholder="Contoh: Terlambat masuk sekolah" maxLength={255}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.keterangan && <p className="text-xs text-red-600">{errors.keterangan}</p>}
                    </div>

                    {/* Tingkat keparahan — hanya untuk pelanggaran */}
                    {data.kategori === 'pelanggaran' && (
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Tingkat Keparahan</label>
                            <select value={data.tingkat_keparahan ?? ''} onChange={(e) => setData('tingkat_keparahan', e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                <option value="">— Tidak ditentukan —</option>
                                <option value="ringan">Ringan</option>
                                <option value="sedang">Sedang</option>
                                <option value="berat">Berat</option>
                            </select>
                            {errors.tingkat_keparahan && <p className="text-xs text-red-600">{errors.tingkat_keparahan}</p>}
                        </div>
                    )}

                    {/* Poin */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                            Poin <span className="text-red-500">*</span>
                            <span className="ml-1 font-normal text-muted-foreground text-xs">
                                ({data.kategori === 'kebaikan' ? 'akan dijumlah ke skor' : 'akan dikurang dari skor'})
                            </span>
                        </label>
                        <input type="number" value={data.poin} min={0} max={100}
                            onChange={(e) => setData('poin', parseInt(e.target.value) || 0)}
                            className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.poin && <p className="text-xs text-red-600">{errors.poin}</p>}
                    </div>

                    {/* Status aktif */}
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="is_active" checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 accent-primary" />
                        <label htmlFor="is_active" className="cursor-pointer text-sm">Aktif (bisa dipilih saat buat laporan)</label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing}
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            {processing && <Loader2 className="size-4 animate-spin" />}
                            {isEdit ? 'Simpan Perubahan' : 'Tambah Jenis'}
                        </button>
                        <Link href="/admin/master/jenis-pelanggaran"
                            className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium hover:bg-muted">
                            Batal
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
