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
    private int $rank = 0;

    public function __construct(
        private ?int $kelasId = null,
        private ?string $status = 'aktif',
    ) {}

    public function collection()
    {
        $murids = Murid::with(['kelas', 'laporans'])
            ->when($this->status && $this->status !== 'semua', fn($q) => $q->where('status', $this->status))
            ->when($this->kelasId, fn($q) => $q->where('kelas_id', $this->kelasId))
            ->get();

        return $murids->map(function ($m) {
            $prestasi = $m->poinPrestasi();
            $pelanggaran = $m->poinPelanggaran();
            $skorBersih = $prestasi - $pelanggaran;

            return (object) [
                'id'               => $m->id,
                'nama'             => $m->nama,
                'nis'              => $m->nis,
                'nisn'             => $m->nisn,
                'nama_kelas'       => $m->kelas?->nama_kelas ?? '-',
                'status'           => ucfirst($m->status ?? 'aktif'),
                'poin_prestasi'    => $prestasi,
                'poin_pelanggaran' => $pelanggaran,
                'skor_bersih'      => $skorBersih,
                'kualifikasi'      => $m->kualifikasiPoin(),
                'tahap_pembinaan'  => $m->tahapPembinaan(),
            ];
        })
        ->sortBy([
            ['poin_prestasi', 'desc'],
            ['poin_pelanggaran', 'asc'],
            ['nama', 'asc'],
        ])
        ->values();
    }

    public function headings(): array
    {
        return ['Peringkat', 'Nama Siswa', 'NIS', 'NISN', 'Kelas', 'Status', 'Poin Prestasi', 'Poin Pelanggaran', 'Skor Bersih', 'Kualifikasi', 'Tahap Pembinaan'];
    }

    public function map($murid): array
    {
        $this->rank++;

        return [
            $this->rank,
            $murid->nama,
            $murid->nis ?? '-',
            $murid->nisn ?? '-',
            $murid->nama_kelas,
            $murid->status,
            $murid->poin_prestasi,
            $murid->poin_pelanggaran,
            $murid->skor_bersih,
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
