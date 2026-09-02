<?php

namespace Database\Seeders;

use App\Models\TahunAjaran;
use Illuminate\Database\Seeder;

class TahunAjaranSeeder extends Seeder
{
    public function run(): void
    {
        $tahunAjarans = [
            ['label' => '2024-2025', 'is_active' => false],
            ['label' => '2025-2026', 'is_active' => false],
            ['label' => '2026-2027', 'is_active' => true], // aktif sekarang
        ];

        foreach ($tahunAjarans as $data) {
            TahunAjaran::firstOrCreate(['label' => $data['label']], $data);
        }
    }
}
