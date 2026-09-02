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

        foreach ($import->rows as $i => $row) {
            $rowNum = $i + 2; // baris pertama = heading
            $errors = [];

            $nama = trim($row['nama'] ?? $row['NAMA'] ?? '');
            $nis  = trim($row['nis']  ?? $row['NIS']  ?? '');
            $nisn = trim($row['nisn'] ?? $row['NISN'] ?? '');

            if (empty($nama)) {
                $errors[] = 'Kolom NAMA tidak boleh kosong.';
            }

            $this->previewData[] = [
                'baris'  => $rowNum,
                'nama'   => $nama,
                'nis'    => $nis ?: null,
                'nisn'   => $nisn ?: null,
                'status' => empty($errors) ? 'valid' : 'error',
                'errors' => $errors,
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
