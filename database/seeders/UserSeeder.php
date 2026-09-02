<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\Kelas;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@sekolah.test'],
            [
                'name'              => 'Administrator',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // ── Guru 1 — Wali Kelas X TO 1 ───────────────────────────────────
        $userGuru1 = User::firstOrCreate(
            ['email' => 'budi.santoso@sekolah.test'],
            [
                'name'              => 'Budi Santoso',
                'password'          => Hash::make('password'),
                'role'              => 'guru',
                'email_verified_at' => now(),
            ]
        );
        $kelasX = Kelas::where('nama_kelas', 'X TO 1')->first();
        $guru1 = Guru::firstOrCreate(
            ['user_id' => $userGuru1->id],
            [
                'nip'          => '196501011990031001',
                'nama'         => 'Budi Santoso',
                'wali_kelas_id' => $kelasX?->id,
            ]
        );
        // Assign mengajar di beberapa kelas
        if ($kelasX) {
            $guru1->kelas()->syncWithoutDetaching([
                $kelasX->id => ['mapel' => 'Teknik Otomasi'],
            ]);
        }
        $kelasXI = Kelas::where('nama_kelas', 'XI TO 1')->first();
        if ($kelasXI) {
            $guru1->kelas()->syncWithoutDetaching([
                $kelasXI->id => ['mapel' => 'Teknik Otomasi'],
            ]);
        }

        // ── Guru 2 — Wali Kelas XI TO 1 ──────────────────────────────────
        $userGuru2 = User::firstOrCreate(
            ['email' => 'siti.rahayu@sekolah.test'],
            [
                'name'              => 'Siti Rahayu',
                'password'          => Hash::make('password'),
                'role'              => 'guru',
                'email_verified_at' => now(),
            ]
        );
        $kelasXI1 = Kelas::where('nama_kelas', 'XI TO 1')->first();
        Guru::firstOrCreate(
            ['user_id' => $userGuru2->id],
            [
                'nip'          => '197203152000032002',
                'nama'         => 'Siti Rahayu',
                'wali_kelas_id' => $kelasXI1?->id,
            ]
        );

        // ── Guru 3 — Guru Mapel (tidak punya wali kelas) ─────────────────
        $userGuru3 = User::firstOrCreate(
            ['email' => 'ahmad.fauzi@sekolah.test'],
            [
                'name'              => 'Ahmad Fauzi',
                'password'          => Hash::make('password'),
                'role'              => 'guru',
                'email_verified_at' => now(),
            ]
        );
        Guru::firstOrCreate(
            ['user_id' => $userGuru3->id],
            [
                'nip'          => null,
                'nama'         => 'Ahmad Fauzi',
                'wali_kelas_id' => null, // tidak punya wali kelas
            ]
        );
    }
}
