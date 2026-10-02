<?php

namespace Database\Seeders;

use App\Models\Kelas;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;

class KelasSeeder extends Seeder
{
    public function run(): void
    {
        $tahunAjaran = TahunAjaran::first();
        $tahunAjaranId = $tahunAjaran?->id;

        // Migrasikan nama kelas lama (OTO -> TO, MEKA -> TM) jika ada data sebelumnya
        $renameMap = [
            'X OTO 1'   => 'X TO 1',     'X OTO 2'   => 'X TO 2',
            'XI OTO 1'  => 'XI TO 1',    'XI OTO 2'  => 'XI TO 2',
            'XII OTO 1' => 'XII TO 1',   'XII OTO 2' => 'XII TO 2',
            'X MEKA 1'  => 'X TM 1',     'X MEKA 2'  => 'X TM 2',
            'XI MEKA 1' => 'XI TM 1',    'XI MEKA 2' => 'XI TM 2',
            'XII MEKA 1'=> 'XII TM 1',   'XII MEKA 2'=> 'XII TM 2',
        ];
        foreach ($renameMap as $old => $new) {
            Kelas::where('nama_kelas', $old)->update(['nama_kelas' => $new]);
        }

        $kelasList = [
            // SIJA (Sistem Informatika, Jaringan, dan Aplikasi - 4 Tahun)
            ['nama_kelas' => 'X SIJA 1',   'tingkat' => 'X'],
            ['nama_kelas' => 'X SIJA 2',   'tingkat' => 'X'],
            ['nama_kelas' => 'XI SIJA 1',  'tingkat' => 'XI'],
            ['nama_kelas' => 'XI SIJA 2',  'tingkat' => 'XI'],
            ['nama_kelas' => 'XII SIJA 1', 'tingkat' => 'XII'],
            ['nama_kelas' => 'XII SIJA 2', 'tingkat' => 'XII'],
            ['nama_kelas' => 'XIII SIJA 1','tingkat' => 'XIII'],
            ['nama_kelas' => 'XIII SIJA 2','tingkat' => 'XIII'],

            // TO (Teknik Otomotif - 3 Tahun)
            ['nama_kelas' => 'X TO 1',     'tingkat' => 'X'],
            ['nama_kelas' => 'X TO 2',     'tingkat' => 'X'],
            ['nama_kelas' => 'XI TO 1',    'tingkat' => 'XI'],
            ['nama_kelas' => 'XI TO 2',    'tingkat' => 'XI'],
            ['nama_kelas' => 'XII TO 1',   'tingkat' => 'XII'],
            ['nama_kelas' => 'XII TO 2',   'tingkat' => 'XII'],

            // TM (Teknik Mekatronika - 3 Tahun)
            ['nama_kelas' => 'X TM 1',     'tingkat' => 'X'],
            ['nama_kelas' => 'X TM 2',     'tingkat' => 'X'],
            ['nama_kelas' => 'XI TM 1',    'tingkat' => 'XI'],
            ['nama_kelas' => 'XI TM 2',    'tingkat' => 'XI'],
            ['nama_kelas' => 'XII TM 1',   'tingkat' => 'XII'],
            ['nama_kelas' => 'XII TM 2',   'tingkat' => 'XII'],
        ];

        foreach ($kelasList as $data) {
            Kelas::updateOrCreate(
                ['nama_kelas' => $data['nama_kelas']],
                [
                    'tingkat'         => $data['tingkat'],
                    'tahun_ajaran_id' => $tahunAjaranId,
                ]
            );
        }
    }
}
