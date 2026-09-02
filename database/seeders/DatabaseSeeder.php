<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TahunAjaranSeeder::class,  // 1. dulu — kelas & jenis pelanggaran butuh FK ini
            KelasSeeder::class,        // 2. butuh tahun_ajaran
            JenisPelanggaranSeeder::class, // 3. butuh tahun_ajaran
            UserSeeder::class,         // 4. terakhir — butuh kelas untuk assign wali kelas
        ]);
    }
}
