<?php

namespace App\Exports;

use App\Models\Kelas;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class KelasExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function __construct(
        private ?int $kelasId = null,
    ) {}

    public function collection()
    {
        $kelases = Kelas::with(['murids.laporans', 'waliKelas'])
            ->when($this->kelasId, fn($q) => $q->where('id', $this->kelasId))
            ->get();

        return $kelases->map(function ($kelas) {
            $murids = $kelas->murids;
            $jumlahMurid = $murids->count();
            $totalSkor = $murids->sum(fn ($m) => $m->skorResmi());
            $rataSkor = $jumlahMurid > 0 ? round($totalSkor / $jumlahMurid, 1) : 0;

            return (object) [
                'id'            => $kelas->id,
                'nama_kelas'    => $kelas->nama_kelas,
                'tingkat'       => $kelas->tingkat,
                'wali_kelas'    => $kelas->waliKelas?->nama ?? '-',
                'jumlah_murid'  => $jumlahMurid,
                'total_skor'    => $totalSkor,
                'rata_skor'     => $rataSkor,
            ];
        })
        // Urutkan dari total skor terbanyak (dan rata-rata skor) ke terkecil
        ->sortByDesc('total_skor')
        ->values();
    }

    public function headings(): array
    {
        return ['Peringkat', 'Nama Kelas', 'Tingkat', 'Wali Kelas', 'Jumlah Murid', 'Total Akumulasi Poin', 'Rata-rata Poin'];
    }

    public function map($kelas): array
    {
        static $rank = 0;
        $rank++;

        return [
            $rank,
            $kelas->nama_kelas,
            $kelas->tingkat,
            $kelas->wali_kelas,
            $kelas->jumlah_murid,
            $kelas->total_skor,
            $kelas->rata_skor,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
