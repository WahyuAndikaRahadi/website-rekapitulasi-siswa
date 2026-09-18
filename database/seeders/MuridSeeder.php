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
        $kelasList = Kelas::orderBy('nama_kelas')->get();

        if ($kelasList->isEmpty()) {
            $this->command->warn('Tidak ada Kelas ditemukan. Harap jalankan KelasSeeder terlebih dahulu.');
            return;
        }

        $tahunAjaran = TahunAjaran::first();
        $tahunAjaranId = $tahunAjaran?->id;

        $faker = Faker::create('id_ID');

        $nisCounter = 20241001;
        $nisnCounter = 8123400000;

        foreach ($kelasList as $kelas) {
            // 8 murid per kelas untuk data dummy pengujian
            $jumlahMurid = 8;

            for ($i = 1; $i <= $jumlahMurid; $i++) {
                $gender = $faker->randomElement(['male', 'female']);
                $nama = $faker->firstName($gender) . ' ' . $faker->lastName($gender);
                $nis = (string) $nisCounter++;
                $nisn = '00' . ($nisnCounter++);
                $noTelp = '08' . $faker->numerify('##########');
                $noOrtu = '08' . $faker->numerify('##########');

                Murid::firstOrCreate(
                    [
                        'nis' => $nis,
                    ],
                    [
                        'nama'            => $nama,
                        'nisn'            => $nisn,
                        'no_telp'         => $noTelp,
                        'no_ortu'         => $noOrtu,
                        'status'          => 'aktif',
                        'kelas_id'        => $kelas->id,
                        'tahun_ajaran_id' => $tahunAjaranId,
                    ]
                );
            }
        }
    }
}
