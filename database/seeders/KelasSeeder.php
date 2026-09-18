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

            // OTO (Teknik Otomotif - 3 Tahun)
            ['nama_kelas' => 'X OTO 1',    'tingkat' => 'X'],
            ['nama_kelas' => 'X OTO 2',    'tingkat' => 'X'],
            ['nama_kelas' => 'XI OTO 1',   'tingkat' => 'XI'],
            ['nama_kelas' => 'XI OTO 2',   'tingkat' => 'XI'],
            ['nama_kelas' => 'XII OTO 1',  'tingkat' => 'XII'],
            ['nama_kelas' => 'XII OTO 2',  'tingkat' => 'XII'],

            // MEKA (Teknik Mekatronika - 3 Tahun)
            ['nama_kelas' => 'X MEKA 1',   'tingkat' => 'X'],
            ['nama_kelas' => 'X MEKA 2',   'tingkat' => 'X'],
            ['nama_kelas' => 'XI MEKA 1',  'tingkat' => 'XI'],
            ['nama_kelas' => 'XI MEKA 2',  'tingkat' => 'XI'],
            ['nama_kelas' => 'XII MEKA 1', 'tingkat' => 'XII'],
            ['nama_kelas' => 'XII MEKA 2', 'tingkat' => 'XII'],
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
