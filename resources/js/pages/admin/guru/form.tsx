import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface GuruData {
    id?: number;
    nama: string;
    nip: string | null;
    email: string;
    wali_kelas_id: number | null;
}

interface KelasItem { id: number; nama_kelas: string; }
interface Props { guru: GuruData | null; kelas_list: KelasItem[]; }

export default function GuruForm({ guru, kelas_list }: Props) {
    const isEdit = !!guru?.id;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Kelola Guru', href: '/admin/guru' },
        { title: isEdit ? 'Edit Guru' : 'Tambah Guru', href: '#' },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        nama:           guru?.nama           ?? '',
        nip:            guru?.nip            ?? '',
        email:          guru?.email          ?? '',
        password:       '',
        wali_kelas_id:  guru?.wali_kelas_id?.toString() ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(`/admin/guru/${guru!.id}`) : post('/admin/guru');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Guru' : 'Tambah Guru'} />
            <div className="mx-auto max-w-lg p-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">{isEdit ? 'Edit Guru' : 'Tambah Guru Baru'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nama */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nama Lengkap <span className="text-red-500">*</span></label>
                        <input type="text" value={data.nama} onChange={(e) => setData('nama', e.target.value)} placeholder="Nama guru"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.nama && <p className="text-xs text-red-600">{errors.nama}</p>}
                    </div>

                    {/* NIP */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">NIP <span className="text-muted-foreground font-normal">(opsional)</span></label>
                        <input type="text" value={data.nip} onChange={(e) => setData('nip', e.target.value)} placeholder="Nomor Induk Pegawai"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.nip && <p className="text-xs text-red-600">{errors.nip}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="guru@sekolah.test"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">
                            Password {isEdit && <span className="text-muted-foreground font-normal">(kosongkan jika tidak diubah)</span>}
                            {!isEdit && <span className="text-red-500">*</span>}
                        </label>
                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                            placeholder={isEdit ? 'Kosongkan jika tidak diubah' : 'Min. 8 karakter'}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>

                    {/* Wali Kelas */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Wali Kelas <span className="text-muted-foreground font-normal">(opsional)</span></label>
                        <select value={data.wali_kelas_id} onChange={(e) => setData('wali_kelas_id', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option value="">— Bukan wali kelas —</option>
                            {kelas_list.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                        </select>
                        {errors.wali_kelas_id && <p className="text-xs text-red-600">{errors.wali_kelas_id}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            isLoading={processing}
                            loadingText={isEdit ? 'Menyimpan...' : 'Membuat Akun...'}
                        >
                            {isEdit ? 'Simpan Perubahan' : 'Buat Akun Guru'}
                        </Button>
                        <Link href="/admin/guru">
                            <Button variant="secondary" type="button">
                                Batal
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
