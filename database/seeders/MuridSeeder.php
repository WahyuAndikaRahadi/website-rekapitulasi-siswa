<?php

namespace Database\Seeders;

use App\Models\Kelas;
use App\Models\Murid;
use App\Models\TahunAjaran;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;

class MuridSeeder extends Seeder
{
    public function run(): void
    {
        $tahunAjaran = TahunAjaran::where('is_active', true)->first() ?? TahunAjaran::first();

        if (! $tahunAjaran) {
            $this->command->warn('Tidak ada Tahun Ajaran aktif ditemukan. Harap jalankan TahunAjaranSeeder terlebih dahulu.');
            return;
        }

        $kelasList = Kelas::where('tahun_ajaran_id', $tahunAjaran->id)->get();

        if ($kelasList->isEmpty()) {
            $this->command->warn('Tidak ada Kelas ditemukan untuk Tahun Ajaran aktif.');
            return;
        }

        $faker = Faker::create('id_ID');

        $nisCounter = 20241001;
        $nisnCounter = 8123400000;

        foreach ($kelasList as $kelas) {
            // 10 murid per kelas
            $jumlahMurid = 10;

            for ($i = 1; $i <= $jumlahMurid; $i++) {
                $gender = $faker->randomElement(['male', 'female']);
                // Menggunakan firstName + lastName agar tidak mengandung gelar akademik (S.Kom, Dr, dll)
                $nama = $faker->firstName($gender) . ' ' . $faker->lastName($gender);
                $nis = (string) $nisCounter++;
                $nisn = '00' . ($nisnCounter++);

                Murid::firstOrCreate(
                    [
                        'nis' => $nis,
                    ],
                    [
                        'nama'            => $nama,
                        'nisn'            => $nisn,
                        'kelas_id'        => $kelas->id,
                        'tahun_ajaran_id' => $tahunAjaran->id,
                    ]
                );
            }
        }
    }
}
