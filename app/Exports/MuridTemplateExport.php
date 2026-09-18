<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MuridTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function headings(): array
    {
        return [
            'NAMA',
            'NIS',
            'NISN',
            'NO_TELP',
            'NO_ORTU',
        ];
    }

    public function array(): array
    {
        return [
            [
                'Ahmad Fauzi',
                '20241001',
                '0081234567',
                '081234567890',
                '081298765432',
            ],
            [
                'Siti Nurhaliza',
                '20241002',
                '0081234568',
                '081234567891',
                '081298765433',
            ],
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
