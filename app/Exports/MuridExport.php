<?php

namespace App\Exports;

use App\Models\Murid;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MuridExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function __construct(
        private int $tahunAjaranId,
        private ?int $kelasId = null,
    ) {}

    public function query()
    {
        return Murid::with('kelas')
            ->where('tahun_ajaran_id', $this->tahunAjaranId)
            ->when($this->kelasId, fn($q) => $q->where('kelas_id', $this->kelasId))
            ->orderBy('kelas_id')
            ->orderBy('nama');
    }

    public function headings(): array
    {
        return ['No', 'Nama', 'NIS', 'NISN', 'Kelas', 'Skor Resmi', 'Skor Sementara'];
    }

    public function map($murid): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $murid->nama,
            $murid->nis ?? '-',
            $murid->nisn ?? '-',
            $murid->kelas->nama_kelas,
            $murid->skorResmi(),
            $murid->skorSementara(),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
