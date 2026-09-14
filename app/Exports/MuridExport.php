<?php

namespace App\Exports;

use App\Models\Murid;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MuridExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function __construct(
        private int $tahunAjaranId,
        private ?int $kelasId = null,
    ) {}

    public function collection()
    {
        $murids = Murid::with(['kelas', 'laporans'])
            ->where('tahun_ajaran_id', $this->tahunAjaranId)
            ->when($this->kelasId, fn($q) => $q->where('kelas_id', $this->kelasId))
            ->get();

        return $murids->map(function ($m) {
            return (object) [
                'id'               => $m->id,
                'nama'             => $m->nama,
                'nis'              => $m->nis,
                'nisn'             => $m->nisn,
                'nama_kelas'       => $m->kelas?->nama_kelas ?? '-',
                'poin_prestasi'    => $m->poinPrestasi(),
                'poin_pelanggaran' => $m->poinPelanggaran(),
                'kualifikasi'      => $m->kualifikasiPoin(),
                'tahap_pembinaan'  => $m->tahapPembinaan(),
            ];
        })
        // Urutkan siswa dari poin prestasi tertinggi
        ->sortByDesc('poin_prestasi')
        ->values();
    }

    public function headings(): array
    {
        return ['Peringkat', 'Nama Siswa', 'NIS', 'NISN', 'Kelas', 'Poin Prestasi', 'Poin Pelanggaran', 'Kualifikasi', 'Tahap Pembinaan'];
    }

    public function map($murid): array
    {
        static $rank = 0;
        $rank++;

        return [
            $rank,
            $murid->nama,
            $murid->nis ?? '-',
            $murid->nisn ?? '-',
            $murid->nama_kelas,
            $murid->poin_prestasi,
            $murid->poin_pelanggaran,
            $murid->kualifikasi,
            $murid->tahap_pembinaan,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
