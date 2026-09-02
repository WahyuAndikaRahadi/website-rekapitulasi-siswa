<?php

namespace Database\Seeders;

use App\Models\JenisPelanggaran;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;

class JenisPelanggaranSeeder extends Seeder
{
    public function run(): void
    {
        $tahunAjaran = TahunAjaran::where('is_active', true)->firstOrFail();

        $data = [
            // ── PELANGGARAN ──────────────────────────────────────────────
            [
                'kode'              => 'P01',
                'keterangan'        => 'Terlambat masuk sekolah',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'ringan',
                'poin'              => 5,
            ],
            [
                'kode'              => 'P02',
                'keterangan'        => 'Tidak memakai seragam sesuai aturan',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'ringan',
                'poin'              => 5,
            ],
            [
                'kode'              => 'P03',
                'keterangan'        => 'Tidak mengerjakan tugas/PR',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'ringan',
                'poin'              => 10,
            ],
            [
                'kode'              => 'P04',
                'keterangan'        => 'Membolos/tidak hadir tanpa keterangan',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'sedang',
                'poin'              => 20,
            ],
            [
                'kode'              => 'P05',
                'keterangan'        => 'Berkelahi di lingkungan sekolah',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'berat',
                'poin'              => 50,
            ],
            [
                'kode'              => 'P06',
                'keterangan'        => 'Membawa/menggunakan rokok di sekolah',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'berat',
                'poin'              => 50,
            ],
            [
                'kode'              => 'P07',
                'keterangan'        => 'Membawa senjata tajam',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'berat',
                'poin'              => 75,
            ],
            [
                'kode'              => 'P08',
                'keterangan'        => 'Merusak fasilitas sekolah',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'sedang',
                'poin'              => 30,
            ],
            [
                'kode'              => 'P09',
                'keterangan'        => 'Tidak sopan kepada guru/staf',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'sedang',
                'poin'              => 25,
            ],
            [
                'kode'              => 'P10',
                'keterangan'        => 'Menggunakan ponsel saat KBM tanpa izin',
                'kategori'          => 'pelanggaran',
                'tingkat_keparahan' => 'ringan',
                'poin'              => 10,
            ],

            // ── KEBAIKAN ─────────────────────────────────────────────────
            [
                'kode'              => 'K01',
                'keterangan'        => 'Membantu teman yang kesulitan belajar',
                'kategori'          => 'kebaikan',
                'tingkat_keparahan' => null,
                'poin'              => 10,
            ],
            [
                'kode'              => 'K02',
                'keterangan'        => 'Menjadi ketua/pengurus organisasi sekolah',
                'kategori'          => 'kebaikan',
                'tingkat_keparahan' => null,
                'poin'              => 15,
            ],
            [
                'kode'              => 'K03',
                'keterangan'        => 'Memenangkan lomba/kompetisi atas nama sekolah',
                'kategori'          => 'kebaikan',
                'tingkat_keparahan' => null,
                'poin'              => 30,
            ],
            [
                'kode'              => 'K04',
                'keterangan'        => 'Aktif membantu kegiatan sekolah',
                'kategori'          => 'kebaikan',
                'tingkat_keparahan' => null,
                'poin'              => 10,
            ],
            [
                'kode'              => 'K05',
                'keterangan'        => 'Menemukan dan mengembalikan barang hilang',
                'kategori'          => 'kebaikan',
                'tingkat_keparahan' => null,
                'poin'              => 20,
            ],
        ];

        foreach ($data as $item) {
            JenisPelanggaran::firstOrCreate(
                ['kode' => $item['kode'], 'tahun_ajaran_id' => $tahunAjaran->id],
                array_merge($item, [
                    'tahun_ajaran_id' => $tahunAjaran->id,
                    'is_active'       => true,
                ])
            );
        }
    }
}
