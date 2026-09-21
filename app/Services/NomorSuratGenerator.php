<?php

namespace App\Services;

use App\Models\SuratPanggil;
use Illuminate\Support\Facades\DB;

class NomorSuratGenerator
{
    /**
     * Generate nomor surat berurutan secara aman dalam database transaction.
     * Format: {urut 3 digit}/PK.01.04 (misal: 001/PK.01.04)
     *
     * @return array{nomor_surat: string, nomor_urut: int, tahun: int}
     */
    public function generate(int $tahun = null): array
    {
        $tahun = $tahun ?? (int) date('Y');
        $kodeKlasifikasi = config('sekolah.surat_panggilan.kode_klasifikasi', 'PK.01.04');

        return DB::transaction(function () use ($tahun, $kodeKlasifikasi) {
            $lastSurat = SuratPanggil::query()
                ->where('tahun', $tahun)
                ->lockForUpdate()
                ->orderByDesc('nomor_urut')
                ->first();

            $nextUrut = $lastSurat ? ($lastSurat->nomor_urut + 1) : 1;
            $nomorSurat = sprintf('%03d/%s', $nextUrut, $kodeKlasifikasi);

            return [
                'nomor_surat' => $nomorSurat,
                'nomor_urut'  => $nextUrut,
                'tahun'       => $tahun,
            ];
        });
    }

    /**
     * Hitung urutan panggilan ke berapa untuk murid tertentu.
     */
    public function hitungPanggilanKe(int $muridId): int
    {
        $count = SuratPanggil::where('murid_id', $muridId)->count();
        return $count + 1;
    }

    /**
     * Format teks perihal: "Panggilan I (Satu)", "Panggilan II (Dua)", dst.
     */
    public static function formatPerihal(int $panggilanKe): string
    {
        $romawi = [
            1 => 'I',
            2 => 'II',
            3 => 'III',
            4 => 'IV',
            5 => 'V',
            6 => 'VI',
            7 => 'VII',
            8 => 'VIII',
            9 => 'IX',
            10 => 'X',
        ];

        $terbilang = [
            1 => 'Satu',
            2 => 'Dua',
            3 => 'Tiga',
            4 => 'Empat',
            5 => 'Lima',
            6 => 'Enam',
            7 => 'Tujuh',
            8 => 'Delapan',
            9 => 'Sembilan',
            10 => 'Sepuluh',
        ];

        $rom = $romawi[$panggilanKe] ?? (string) $panggilanKe;
        $ter = $terbilang[$panggilanKe] ?? (string) $panggilanKe;

        return "Panggilan {$rom} ({$ter})";
    }
}
