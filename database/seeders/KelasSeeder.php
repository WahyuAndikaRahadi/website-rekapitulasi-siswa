<?php

namespace Database\Seeders;

use App\Models\Kelas;
use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;

class KelasSeeder extends Seeder
{
    public function run(): void
    {
        $tahunAjaran = TahunAjaran::where('is_active', true)->firstOrFail();

        $kelas = [
            // Tingkat X
            ['nama_kelas' => 'X TO 1',  'tingkat' => 'X'],
            ['nama_kelas' => 'X TO 2',  'tingkat' => 'X'],
            ['nama_kelas' => 'X TM 1',  'tingkat' => 'X'],
            ['nama_kelas' => 'X TM 2',  'tingkat' => 'X'],
            ['nama_kelas' => 'X AK 1',  'tingkat' => 'X'],
            // Tingkat XI
            ['nama_kelas' => 'XI TO 1', 'tingkat' => 'XI'],
            ['nama_kelas' => 'XI TO 2', 'tingkat' => 'XI'],
            ['nama_kelas' => 'XI TM 1', 'tingkat' => 'XI'],
            ['nama_kelas' => 'XI AK 1', 'tingkat' => 'XI'],
            // Tingkat XII
            ['nama_kelas' => 'XII TO 1', 'tingkat' => 'XII'],
            ['nama_kelas' => 'XII TM 1', 'tingkat' => 'XII'],
            ['nama_kelas' => 'XII AK 1', 'tingkat' => 'XII'],
        ];

        foreach ($kelas as $data) {
            Kelas::firstOrCreate(
                ['nama_kelas' => $data['nama_kelas'], 'tahun_ajaran_id' => $tahunAjaran->id],
                array_merge($data, ['tahun_ajaran_id' => $tahunAjaran->id])
            );
        }
    }
}
