<?php

namespace Database\Seeders;

use App\Models\Guru;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Administrator Akun ─────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@sekolah.test'],
            [
                'name'              => 'Administrator',
                'password'          => Hash::make('admin69sukses'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // ── Data Akun Guru Production ───────────────────────────────────────
        $gurus = [
            ['name' => 'Achmad Zaenudin, S.Pd', 'email' => 'achmadzaenudin@gmail.com'],
            ['name' => 'Agung Iswanto, S.Kom', 'email' => 'agungiswanto@gmail.com'],
            ['name' => 'Akbar Wibisono, S.Pd', 'email' => 'akbarwibisono@gmail.com'],
            ['name' => 'Annisa Dwi Laili Amin, S.Pd', 'email' => 'annisadwilaili@gmai.com'],
            ['name' => 'Aprianti Opi Ceisar, S.Pd', 'email' => 'apriantiopiceisar@gmail.com'],
            ['name' => 'Ari Muslim Nur Priningrat S.Pd', 'email' => 'arimuslim@gmail.com'],
            ['name' => "Atikah Muthma'innah, S.Pd", 'email' => "atikahmuthma'innah@gmail.com"],
            ['name' => 'Budy Harry Prasetya, S.T', 'email' => 'budyharryprasetya@gmail.com'],
            ['name' => 'Eva Yulizar, S.Kom', 'email' => 'evayulizar@gmail.com'],
            ['name' => 'Guru Teknik Mekatronika', 'email' => 'gurumekatronika@gmail.com'],
            ['name' => 'Guslia Laila Murni, S.Ag', 'email' => 'guslialailamurni@gmail.com'],
            ['name' => 'Inti Nur Anesa, S.Pd', 'email' => 'intinuranesa@gmail.com'],
            ['name' => 'Ipah Kholivah, M.Pd', 'email' => 'ipahkholivah@gmail.com'],
            ['name' => 'Janesa Ritia Putri, S.S', 'email' => 'janesaritiaputri@gmail.com'],
            ['name' => 'Kiki Mahar Rizki, S.Pd', 'email' => 'kikimaharizki@gmail.com'],
            ['name' => 'Kokok Supriyanto, S.Pd', 'email' => 'kokoksupriyanto@gmail.com'],
            ['name' => 'Muhammad Ikhsan Wahyudi, S.Kom', 'email' => 'mikhsanwahyudi@gmail.com'],
            ['name' => 'Naomi Simarmata, S.Pd', 'email' => 'naomisimarmata@gmail.com'],
            ['name' => 'Nirmala Dewi Amelia, S.Pd', 'email' => 'nirmaladewiamelia@gmail.com'],
            ['name' => 'Nur Hayati Chairani, S.S', 'email' => 'nurhayatichairani@gmail.com'],
            ['name' => 'Nurul Mukmin, M.Pd.I', 'email' => 'nurulmukmin@gmail.com'],
            ['name' => 'Pesta Br Tarigan, S.Pd', 'email' => 'pestabrtarigan@gmail.com'],
            ['name' => 'Randi Ardiansyah, S.Pd', 'email' => 'randiardiansyah@gmail.com'],
            ['name' => 'Rezza Adzmi, S.Pd M.Si', 'email' => 'rezzaadzmi@gmail.com'],
            ['name' => 'Ria Indah Sari, S.S', 'email' => 'riaindahsari@gmail.com'],
            ['name' => 'Rizeki Pambudi, M.Pd', 'email' => 'rizekipambudi@gmail.com'],
            ['name' => 'Romlah, S.S', 'email' => 'romlah@gmail.com'],
            ['name' => 'Rosina Pattian, S.Pd', 'email' => 'rosinapattian@gmail.com'],
            ['name' => 'Sheila Virginia Agisna, S.Pd', 'email' => 'sheilavirginia@gmail.com'],
            ['name' => 'Suciananel Fitriani, S.Pd', 'email' => 'suciananelfitriani@gmail.com'],
            ['name' => 'Sugiyanto, S.T', 'email' => 'sugiyanto@gmail.com'],
            ['name' => 'tester guru', 'email' => 'gurutester@gmail.com'],
            ['name' => 'Witarmin, S.Pd', 'email' => 'witarmin@gmail.com'],
            ['name' => 'Yanthy Yulianthi, S.Pd', 'email' => 'yanthyyulianthi@gmail.com'],
            ['name' => 'Yasner Marnaek Sitinjak, S.Pd', 'email' => 'yasnermarnaeksitinjak@gmail.com'],
            ['name' => 'Yudo Eko Nugroho, S.T', 'email' => 'yudoekonugroho@gmail.com'],
        ];

        foreach ($gurus as $item) {
            $user = User::firstOrCreate(
                ['email' => $item['email']],
                [
                    'name'              => $item['name'],
                    'password'          => Hash::make('Smkn69jkt'),
                    'role'              => 'guru',
                    'email_verified_at' => now(),
                ]
            );

            Guru::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'nama'          => $item['name'],
                    'nip'           => null,
                    'no_telp'       => null,
                    'wali_kelas_id' => null,
                ]
            );
        }
    }
}
