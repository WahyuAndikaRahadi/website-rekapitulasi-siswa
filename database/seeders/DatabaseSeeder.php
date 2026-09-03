<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TahunAjaranSeeder::class,  // 1. dulu — kelas butuh FK ini
            KelasSeeder::class,        // 2. butuh tahun_ajaran
            UserSeeder::class,         // 3. butuh kelas untuk assign wali kelas
            MuridSeeder::class,        // 4. data dummy siswa/murid
        ]);
    }
}
