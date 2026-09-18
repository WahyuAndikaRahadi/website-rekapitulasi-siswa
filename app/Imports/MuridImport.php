<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class MuridImport implements ToCollection, WithHeadingRow
{
    private int $tahunAjaranId;
    private int $kelasId;
    private array $previewData = [];
    private array $errors = [];

    public function __construct(int $tahunAjaranId, int $kelasId)
    {
        $this->tahunAjaranId = $tahunAjaranId;
        $this->kelasId       = $kelasId;
    }

    /**
     * Mode preview — validasi tiap baris dan simpan hasilnya.
     * Tidak ada insert ke database.
     */
    public function preview($file): void
    {
        $import = new class($this->tahunAjaranId, $this->kelasId) implements ToCollection, WithHeadingRow
        {
            public array $rows = [];

            public function __construct(private int $tahunAjaranId, private int $kelasId) {}

            public function collection(Collection $rows): void
            {
                $this->rows = $rows->toArray();
            }
        };

        \Maatwebsite\Excel\Facades\Excel::import($import, $file);

        $cleanText = function ($val): string {
            if ($val === null) return '';
            $str = trim((string) $val);
            // Hapus prefix petik satu (') atau petik dua (") dari Excel
            return trim($str, " \t\n\r\0\x0B'\"");
        };

        $cleanPhone = function ($val) use ($cleanText): ?string {
            $cleaned = $cleanText($val);
            if (empty($cleaned)) return null;

            // Hapus semua karakter selain angka
            $digits = preg_replace('/[^0-9]/', '', $cleaned);
            if (empty($digits)) return null;

            // Jika diawali 628..., ubah menjadi 08...
            if (str_starts_with($digits, '628')) {
                $digits = '0' . substr($digits, 2);
            } elseif (str_starts_with($digits, '8')) {
                // Jika angka nol (0) depan hilang di Excel misal 81234567890 -> 081234567890
                $digits = '0' . $digits;
            }

            return $digits;
        };

        foreach ($import->rows as $i => $row) {
            $rowNum = $i + 2; // baris pertama = heading
            $errors = [];

            $nama   = $cleanText($row['nama'] ?? $row['NAMA'] ?? '');
            $nis    = $cleanText($row['nis']  ?? $row['NIS']  ?? '');
            $nisn   = $cleanText($row['nisn'] ?? $row['NISN'] ?? '');
            $noTelp = $cleanPhone($row['no_telp'] ?? $row['no_hp'] ?? $row['NO_TELP'] ?? $row['NO_HP'] ?? null);
            $noOrtu = $cleanPhone($row['no_ortu'] ?? $row['no_hp_ortu'] ?? $row['no_wa'] ?? $row['NO_ORTU'] ?? null);

            // Jika seluruh kolom pada baris ini kosong (baris template sisa/kosong), lewati secara aman
            if (empty($nama) && empty($nis) && empty($nisn) && empty($noTelp) && empty($noOrtu)) {
                continue;
            }

            // Validasi hanya jika baris memang memiliki data namun nama kosong
            if (empty($nama)) {
                $errors[] = 'Kolom NAMA tidak boleh kosong.';
            }

            $this->previewData[] = [
                'baris'   => $rowNum,
                'nama'    => $nama,
                'nis'     => $nis ?: null,
                'nisn'    => $nisn ?: null,
                'no_telp' => $noTelp ?: null,
                'no_ortu' => $noOrtu ?: null,
                'status'  => empty($errors) ? 'valid' : 'error',
                'errors'  => $errors,
            ];

            if (!empty($errors)) {
                $this->errors[] = "Baris {$rowNum}: " . implode(' ', $errors);
            }
        }
    }

    public function collection(Collection $rows): void
    {
        // Tidak dipakai langsung — insert lewat importConfirm
    }

    public function getPreviewData(): array
    {
        return $this->previewData;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
